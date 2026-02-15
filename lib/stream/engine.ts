// stream engine - handles scheduling micro-txs at intervals
// basically: user sets amount + duration, we split it into small chunks
// and send them one by one using kasware wallet
// sompi = smallest kaspa unit (like satoshi). 1 KAS = 100M sompi
// demo mode skips real txs and fakes the ids for testing

import { PaymentStream, StreamCreateConfig, StreamTransaction, StreamStatus } from './types';
import { generateId, kasToSompi, calculateFlowRate, SOMPI_PER_KAS } from '../utils';
import { sendKas } from '../kaspa/wallet';
import { verifyTransaction, getExplorerTxUrl } from '../kaspa/api';

const STREAM_COLORS = ['#49eacb', '#6c5ce7', '#fd79a8', '#00cec9', '#e17055', '#74b9ff', '#a29bfe', '#55efc4'];
let colorIndex = 0;

function getNextColor(): string {
    const color = STREAM_COLORS[colorIndex % STREAM_COLORS.length];
    colorIndex++;
    return color;
}

// keep track of running intervals so we can stop them on pause/cancel
const activeIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

export function createStream(
    config: StreamCreateConfig,
    senderAddress: string
): PaymentStream {
    const totalAmount = kasToSompi(config.totalAmountKas);
    const durationSeconds = config.durationMinutes * 60;
    const interval = config.interval || 15; // default 15 seconds
    const flowRate = calculateFlowRate(totalAmount, durationSeconds, interval);

    // Minimum flow rate: 1000 sompi (0.00001 KAS)
    if (flowRate < 1000) {
        throw new Error('Flow rate too low. Increase amount or decrease duration.');
    }

    return {
        id: generateId(),
        sender: senderAddress,
        recipient: config.recipient,
        totalAmount,
        amountSent: 0,
        duration: durationSeconds,
        interval,
        flowRate,
        status: 'pending',
        txHistory: [],
        createdAt: Date.now(),
        startedAt: null,
        pausedAt: null,
        completedAt: null,
        elapsedBeforePause: 0,
        color: getNextColor(),
    };
}

export type StreamUpdateCallback = (streamId: string, updates: Partial<PaymentStream>) => void;

// kicks off the stream - sets up interval to send micro-txs
// in demo mode we just fake the tx id instead of hitting kasware
export async function startStream(
    stream: PaymentStream,
    onUpdate: StreamUpdateCallback,
    demoMode: boolean = false
): Promise<void> {
    if (stream.status === 'active') return;

    const now = Date.now();
    onUpdate(stream.id, {
        status: 'active',
        startedAt: stream.startedAt || now,
    });

    const tick = async () => {
        // Check if stream is still active
        const remaining = stream.totalAmount - stream.amountSent;
        if (remaining <= 0) {
            stopInterval(stream.id);
            onUpdate(stream.id, {
                status: 'completed',
                completedAt: Date.now(),
            });
            return;
        }

        // Calculate amount for this tick (use remaining if less than flow rate)
        const tickAmount = Math.min(stream.flowRate, remaining);

        try {
            let txId: string;
            if (demoMode) {
                // Simulate transaction in demo mode
                txId = `demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
                await new Promise(resolve => setTimeout(resolve, 300)); // simulate delay
            } else {
                txId = await sendKas(stream.recipient, tickAmount);
            }

            const tx: StreamTransaction = {
                txId,
                amount: tickAmount,
                timestamp: Date.now(),
                status: demoMode ? 'confirmed' : 'pending',
                onChainStatus: demoMode ? 'accepted' : 'unverified',
                explorerUrl: demoMode ? undefined : getExplorerTxUrl(txId),
            };

            const newAmountSent = stream.amountSent + tickAmount;
            const isComplete = newAmountSent >= stream.totalAmount;

            onUpdate(stream.id, {
                amountSent: newAmountSent,
                txHistory: [...stream.txHistory, tx],
                ...(isComplete ? { status: 'completed', completedAt: Date.now() } : {}),
            });

            // update local ref
            stream.amountSent = newAmountSent;
            stream.txHistory = [...stream.txHistory, tx];

            if (isComplete) {
                stopInterval(stream.id);
            }

            // background verification - retry with increasing delays
            // testnet APIs can be slow to index, so we try multiple times
            if (!demoMode) {
                const verifyWithRetry = async (attempts: number, delay: number) => {
                    for (let i = 0; i < attempts; i++) {
                        await new Promise(r => setTimeout(r, delay * (i + 1)));
                        try {
                            const result = await verifyTransaction(txId);
                            if (result.isAccepted) {
                                const updatedHistory = stream.txHistory.map(t =>
                                    t.txId === txId
                                        ? {
                                            ...t,
                                            status: 'confirmed' as const,
                                            onChainStatus: 'accepted' as const,
                                            blockTime: result.blockTime,
                                        }
                                        : t
                                );
                                stream.txHistory = updatedHistory;
                                onUpdate(stream.id, { txHistory: updatedHistory });
                                return; // verified, stop retrying
                            }
                        } catch {
                            // api error, will retry
                        }
                    }
                    // all retries exhausted — mark as unverified (not "not_found")
                    const updatedHistory = stream.txHistory.map(t =>
                        t.txId === txId
                            ? { ...t, onChainStatus: 'unverified' as const }
                            : t
                    );
                    stream.txHistory = updatedHistory;
                    onUpdate(stream.id, { txHistory: updatedHistory });
                };
                verifyWithRetry(3, 5000); // 3 attempts at 5s, 10s, 15s
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed';

            // On error, pause the stream instead of continuing
            stopInterval(stream.id);
            onUpdate(stream.id, {
                status: 'error',
                errorMessage,
                pausedAt: Date.now(),
                elapsedBeforePause: stream.elapsedBeforePause +
                    ((Date.now() - (stream.startedAt || Date.now())) / 1000),
            });
        }
    };

    // First tick immediately
    await tick();

    // Schedule subsequent ticks
    const intervalId = setInterval(tick, stream.interval * 1000);
    activeIntervals.set(stream.id, intervalId);
}

// pause - save how much time has passed so we can resume later
export function pauseStream(streamId: string, onUpdate: StreamUpdateCallback, stream: PaymentStream): void {
    stopInterval(streamId);
    const now = Date.now();
    const elapsed = stream.startedAt
        ? stream.elapsedBeforePause + ((now - stream.startedAt) / 1000)
        : stream.elapsedBeforePause;

    onUpdate(streamId, {
        status: 'paused',
        pausedAt: now,
        elapsedBeforePause: elapsed,
    });
}

// cancel - stop sending. already-sent txs are on-chain and cant be undone
export function cancelStream(streamId: string, onUpdate: StreamUpdateCallback): void {
    stopInterval(streamId);
    onUpdate(streamId, {
        status: 'cancelled',
        completedAt: Date.now(),
    });
}

function stopInterval(streamId: string): void {
    const intervalId = activeIntervals.get(streamId);
    if (intervalId) {
        clearInterval(intervalId);
        activeIntervals.delete(streamId);
    }
}

export function cleanupAllStreams(): void {
    activeIntervals.forEach((intervalId, streamId) => {
        clearInterval(intervalId);
    });
    activeIntervals.clear();
}

// save/load streams from localStorage so they survive page refresh
// if a stream was active when page closed, mark it paused
// (intervals dont persist across reloads obviously)
const STORAGE_KEY = 'kaspaflow_streams';

export function saveStreams(streams: PaymentStream[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
    } catch (e) {
        console.warn('Failed to save streams to localStorage', e);
    }
}

export function loadStreams(): PaymentStream[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const streams = JSON.parse(data) as PaymentStream[];
        // Mark any previously active streams as paused (since intervals don't persist)
        return streams.map(s => ({
            ...s,
            status: s.status === 'active' ? 'paused' as StreamStatus : s.status,
        }));
    } catch (e) {
        console.warn('Failed to load streams from localStorage', e);
        return [];
    }
}
