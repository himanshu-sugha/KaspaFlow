// KaspaFlow Stream Data Model

export type StreamStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'error' | 'pending';

export interface StreamTransaction {
    txId: string;
    amount: number; // sompi
    timestamp: number;
    status: 'confirmed' | 'pending' | 'failed';
}

export interface PaymentStream {
    id: string;
    sender: string;
    recipient: string;
    totalAmount: number;       // total sompi to send
    amountSent: number;        // sompi sent so far
    duration: number;          // total duration in seconds
    interval: number;          // seconds between micro-txs
    flowRate: number;          // sompi per interval tick
    status: StreamStatus;
    txHistory: StreamTransaction[];
    createdAt: number;         // timestamp
    startedAt: number | null;  // timestamp when started
    pausedAt: number | null;   // timestamp when paused
    completedAt: number | null;
    elapsedBeforePause: number; // cumulative seconds elapsed before pause
    errorMessage?: string;
    color: string;             // for visualization
}

export interface StreamCreateConfig {
    recipient: string;
    totalAmountKas: number;   // in KAS (human-readable)
    durationMinutes: number;  // in minutes (human-readable)
    interval?: number;        // seconds between txs, default 15
}

export interface StreamStats {
    activeStreams: number;
    totalStreams: number;
    totalKasSent: number;     // sompi
    totalTransactions: number;
    currentFlowRate: number;  // sompi/sec across all active streams
}

// Demo mode stream for judges without Kasware
export interface DemoStream extends PaymentStream {
    isDemo: true;
}
