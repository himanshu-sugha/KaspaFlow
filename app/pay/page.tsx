'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useStreams } from '@/contexts/StreamContext';
import { isValidKaspaAddress, formatKas, kasToSompi, truncateAddress } from '@/lib/utils';
import Link from 'next/link';

// inner component that uses useSearchParams (needs Suspense boundary)
function PayPageInner() {
    const searchParams = useSearchParams();
    const { isConnected, connect, enableDemoMode, address, isInstalled } = useWallet();
    const { createNewStream, startStreamById, streams } = useStreams();

    // parse URL params
    const toAddress = searchParams.get('to') || '';
    const amountKas = parseFloat(searchParams.get('amount') || '0');
    const durationMin = parseFloat(searchParams.get('duration') || '5');
    const label = searchParams.get('label') || '';
    const interval = parseInt(searchParams.get('interval') || '15');

    const [started, setStarted] = useState(false);
    const [streamId, setStreamId] = useState<string | null>(null);

    // is this a valid payment request?
    const isValid = isValidKaspaAddress(toAddress) && amountKas > 0 && durationMin > 0;

    const handleStartStream = () => {
        if (!isValid || !isConnected) return;

        createNewStream({
            recipient: toAddress,
            totalAmountKas: amountKas,
            durationMinutes: durationMin,
            interval: Math.max(5, interval),
        });
        setStarted(true);
    };

    // auto-start the newly created stream
    useEffect(() => {
        if (started && streams.length > 0) {
            const newest = streams[streams.length - 1];
            if (newest.status === 'pending' && !streamId) {
                setStreamId(newest.id);
                startStreamById(newest.id);
            }
        }
    }, [started, streams, streamId, startStreamById]);

    const activeStream = streamId ? streams.find(s => s.id === streamId) : null;

    // empty / invalid link
    if (!toAddress && !amountKas) {
        return (
            <div className="container">
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-3xl)' }}>
                    <div className="card card-glow" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-md)' }}>
                            📨 Payment Requests
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                            Create a payment request link that anyone can use to stream KAS to you.
                            Share the link with clients, employers, or anyone who needs to pay you.
                        </p>

                        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'left', marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)', color: 'var(--accent-teal)' }}>
                                How to create a link:
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontFamily: 'var(--font-mono, monospace)' }}>
                                <code style={{ display: 'block', padding: 'var(--space-sm)', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflowX: 'auto' }}>
                                    /pay?to=kaspatest:abc...&amount=50&duration=10&label=Design+Work
                                </code>
                            </div>
                            <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                <p><strong>to</strong> — your Kaspa address</p>
                                <p><strong>amount</strong> — KAS amount to stream</p>
                                <p><strong>duration</strong> — minutes to stream over</p>
                                <p><strong>label</strong> — description (optional)</p>
                                <p><strong>interval</strong> — seconds between txs, default 15 (optional)</p>
                            </div>
                        </div>

                        <Link href="/pay/create" className="btn btn-primary btn-lg">
                            ✨ Create Payment Request
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // invalid params
    if (!isValid) {
        return (
            <div className="container">
                <div style={{ maxWidth: '500px', margin: '0 auto', paddingTop: 'var(--space-3xl)' }}>
                    <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
                        <h2>Invalid Payment Request</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                            This payment link is missing required parameters or has an invalid address.
                        </p>
                        <Link href="/" className="btn btn-secondary" style={{ marginTop: 'var(--space-lg)' }}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ maxWidth: '500px', margin: '0 auto', paddingTop: 'var(--space-3xl)' }}>
                {/* Payment request card */}
                <div className="card card-glow" style={{ padding: 'var(--space-2xl)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📨</div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
                            Payment Request
                        </h1>
                        {label && (
                            <p style={{
                                color: 'var(--accent-teal)',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                            }}>
                                {label}
                            </p>
                        )}
                    </div>

                    {/* Payment details */}
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        padding: 'var(--space-lg)',
                        marginBottom: 'var(--space-xl)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>To</span>
                            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                {truncateAddress(toAddress, 8)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Amount</span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                                {amountKas} KAS
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Duration</span>
                            <span style={{ fontSize: '0.9rem' }}>
                                {durationMin} minute{durationMin !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Flow Rate</span>
                            <span style={{ fontSize: '0.9rem' }}>
                                ~{(amountKas / (durationMin * 60) * interval).toFixed(4)} KAS every {interval}s
                            </span>
                        </div>
                    </div>

                    {/* Stream in progress */}
                    {activeStream && activeStream.status === 'active' && (
                        <div style={{
                            background: 'rgba(73, 234, 203, 0.1)',
                            border: '1px solid rgba(73, 234, 203, 0.3)',
                            borderRadius: '12px',
                            padding: 'var(--space-lg)',
                            marginBottom: 'var(--space-lg)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>⚡ Streaming...</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                                {formatKas(activeStream.amountSent)} / {amountKas} KAS
                            </div>
                            <div style={{
                                width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)',
                                borderRadius: '3px', marginTop: 'var(--space-md)', overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${(activeStream.amountSent / activeStream.totalAmount) * 100}%`,
                                    height: '100%', background: 'var(--accent-teal)',
                                    borderRadius: '3px', transition: 'width 0.3s ease',
                                }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                                {activeStream.txHistory.length} transactions sent
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {activeStream && activeStream.status === 'completed' && (
                        <div style={{
                            background: 'rgba(73, 234, 203, 0.15)',
                            border: '1px solid rgba(73, 234, 203, 0.4)',
                            borderRadius: '12px',
                            padding: 'var(--space-lg)',
                            marginBottom: 'var(--space-lg)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>✅</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Payment Complete!</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                                {formatKas(activeStream.amountSent)} KAS sent in {activeStream.txHistory.length} transactions
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {!activeStream && (
                        <>
                            {isConnected ? (
                                <button
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%' }}
                                    onClick={handleStartStream}
                                >
                                    ⚡ Start Streaming {amountKas} KAS
                                </button>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                    <button className="btn btn-primary btn-lg" onClick={connect} style={{ width: '100%' }}>
                                        🔗 Connect Wallet to Pay
                                    </button>
                                    {!isInstalled && (
                                        <button className="btn btn-secondary" onClick={enableDemoMode} style={{ width: '100%' }}>
                                            🎮 Try in Demo Mode
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeStream && activeStream.status === 'completed' && (
                        <Link href="/dashboard" className="btn btn-secondary btn-lg" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                            📊 View Dashboard
                        </Link>
                    )}
                </div>

                {/* Security note */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-lg)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                }}>
                    🔒 Payments are sent directly from your wallet to the recipient.<br />
                    KaspaFlow never has custody of your funds.
                </div>
            </div>
        </div>
    );
}

// main page component with Suspense boundary for useSearchParams
export default function PayPage() {
    return (
        <Suspense fallback={
            <div className="container">
                <div style={{ textAlign: 'center', paddingTop: 'var(--space-4xl)' }}>
                    <div style={{ fontSize: '2rem' }}>⏳</div>
                    <p>Loading payment request...</p>
                </div>
            </div>
        }>
            <PayPageInner />
        </Suspense>
    );
}
