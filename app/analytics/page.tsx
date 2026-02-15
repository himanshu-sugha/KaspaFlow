'use client';

import React, { useMemo } from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { useWallet } from '@/contexts/WalletContext';
import { sompiToKas, formatKas, formatDate, formatTimestamp } from '@/lib/utils';
import Link from 'next/link';

// simple bar chart using CSS - no dependencies needed
function MiniBarChart({ data, label, color }: { data: number[], label: string, color: string }) {
    const max = Math.max(...data, 1);
    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
                {label}
            </div>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '80px' }}>
                {data.map((val, i) => (
                    <div
                        key={i}
                        title={val.toFixed(4)}
                        style={{
                            flex: 1,
                            height: `${Math.max(4, (val / max) * 100)}%`,
                            background: `linear-gradient(180deg, ${color}, ${color}44)`,
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                            minHeight: '4px',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// timeline dot chart
function TimelineChart({ events }: { events: { time: number, amount: number, color: string }[] }) {
    if (events.length === 0) return null;
    const maxAmount = Math.max(...events.map(e => e.amount), 1);

    return (
        <div style={{ position: 'relative', height: '120px', marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
                Transaction Timeline (recent 50)
            </div>
            <div style={{
                position: 'relative', height: '90px',
                background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                overflow: 'hidden', padding: '8px',
            }}>
                {/* grid lines */}
                {[0.25, 0.5, 0.75].map(pct => (
                    <div key={pct} style={{
                        position: 'absolute', left: 0, right: 0,
                        top: `${(1 - pct) * 100}%`,
                        borderTop: '1px dashed rgba(255,255,255,0.05)',
                    }} />
                ))}
                {events.slice(0, 50).map((event, i) => {
                    const x = (i / Math.max(events.length - 1, 1)) * 100;
                    const y = (1 - (event.amount / maxAmount)) * 80 + 5;
                    return (
                        <div
                            key={i}
                            title={`${sompiToKas(event.amount).toFixed(4)} KAS`}
                            style={{
                                position: 'absolute',
                                left: `${x}%`,
                                top: `${y}%`,
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: event.color,
                                boxShadow: `0 0 6px ${event.color}`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { streams } = useStreams();
    const { isConnected, connect, enableDemoMode, isInstalled } = useWallet();

    // calcaulte analytics data
    const analytics = useMemo(() => {
        const allTxs = streams
            .flatMap(s => s.txHistory.map(tx => ({ ...tx, streamColor: s.color })))
            .sort((a, b) => a.timestamp - b.timestamp);

        const totalKasSent = sompiToKas(streams.reduce((sum, s) => sum + s.amountSent, 0));
        const totalTxCount = allTxs.length;
        const activeCount = streams.filter(s => s.status === 'active').length;
        const completedCount = streams.filter(s => s.status === 'completed').length;
        const cancelledCount = streams.filter(s => s.status === 'cancelled').length;

        // average tx size
        const avgTxSize = totalTxCount > 0
            ? sompiToKas(allTxs.reduce((sum, tx) => sum + tx.amount, 0) / totalTxCount)
            : 0;

        // on-chain verification rate
        const verifiedCount = allTxs.filter(tx => tx.onChainStatus === 'accepted').length;
        const verificationRate = totalTxCount > 0 ? (verifiedCount / totalTxCount) * 100 : 0;

        // throughput - txs per minute (last 5 min)
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;
        const recentTxs = allTxs.filter(tx => tx.timestamp > fiveMinAgo);
        const txsPerMin = recentTxs.length > 0 ? recentTxs.length / 5 : 0;

        // KAS per minute (last 5 min)
        const kasPerMin = recentTxs.length > 0
            ? sompiToKas(recentTxs.reduce((s, tx) => s + tx.amount, 0)) / 5
            : 0;

        // bar chart: kas sent per stream
        const kasPerStream = streams.map(s => sompiToKas(s.amountSent));

        // bar chart: tx count per stream
        const txsPerStream = streams.map(s => s.txHistory.length);

        // timeline events
        const timelineEvents = allTxs.slice(-50).map(tx => ({
            time: tx.timestamp,
            amount: tx.amount,
            color: (tx as any).streamColor || '#49eacb',
        }));

        // stream status breakdown
        const statusBreakdown = {
            active: activeCount,
            completed: completedCount,
            cancelled: cancelledCount,
            paused: streams.filter(s => s.status === 'paused').length,
            error: streams.filter(s => s.status === 'error').length,
        };

        return {
            totalKasSent, totalTxCount, activeCount, completedCount,
            avgTxSize, verificationRate, txsPerMin, kasPerMin,
            kasPerStream, txsPerStream, timelineEvents, statusBreakdown,
            totalStreams: streams.length,
        };
    }, [streams]);

    if (!isConnected) {
        return (
            <div className="container">
                <div className="empty-state" style={{ paddingTop: 'var(--space-4xl)' }}>
                    <div className="empty-state-icon">📊</div>
                    <h3>Connect Your Wallet</h3>
                    <p style={{ marginBottom: 'var(--space-xl)' }}>
                        Connect your wallet or use demo mode to see analytics.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
                        <button className="btn btn-primary" onClick={connect}>🔗 Connect Wallet</button>
                        {!isInstalled && (
                            <button className="btn btn-secondary" onClick={enableDemoMode}>🎮 Demo Mode</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (streams.length === 0) {
        return (
            <div className="container">
                <div className="empty-state" style={{ paddingTop: 'var(--space-4xl)' }}>
                    <div className="empty-state-icon">📊</div>
                    <h3>No Data Yet</h3>
                    <p style={{ marginBottom: 'var(--space-xl)' }}>
                        Create and run some streams to see analytics.
                    </p>
                    <Link href="/dashboard" className="btn btn-primary">🚀 Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>
                    📊 Stream Analytics
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.9rem' }}>
                    Real-time insights into your streaming payment activity
                </p>

                {/* Stat cards row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)',
                }}>
                    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                            {analytics.totalKasSent.toFixed(4)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total KAS Sent</div>
                    </div>
                    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            {analytics.totalTxCount}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Transactions</div>
                    </div>
                    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-pink)' }}>
                            {analytics.totalStreams}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Streams</div>
                    </div>
                    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fdcb6e' }}>
                            {analytics.verificationRate.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>On-Chain Verified</div>
                    </div>
                </div>

                {/* Rate cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-md)', marginBottom: 'var(--space-xl)',
                }}>
                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>
                            ⚡ Live Throughput (5 min)
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                            {analytics.txsPerMin.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>txs/min</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-teal)', marginTop: '4px' }}>
                            {analytics.kasPerMin.toFixed(4)} KAS/min
                        </div>
                    </div>
                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)' }}>
                            📦 Average Transaction
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                            {analytics.avgTxSize.toFixed(4)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KAS</span>
                        </div>
                    </div>
                </div>

                {/* Transaction timeline */}
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                    <TimelineChart events={analytics.timelineEvents} />
                </div>

                {/* Charts row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-md)', marginBottom: 'var(--space-xl)',
                }}>
                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <MiniBarChart
                            data={analytics.kasPerStream}
                            label="KAS Sent per Stream"
                            color="#49eacb"
                        />
                    </div>
                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <MiniBarChart
                            data={analytics.txsPerStream}
                            label="Transactions per Stream"
                            color="#6c5ce7"
                        />
                    </div>
                </div>

                {/* Stream status breakdown */}
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                        Stream Status Breakdown
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                            if (count === 0) return null;
                            const colors: Record<string, string> = {
                                active: '#49eacb', completed: '#6c5ce7',
                                paused: '#fdcb6e', cancelled: '#636e72', error: '#e17055',
                            };
                            return (
                                <div key={status} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(0,0,0,0.2)', padding: '6px 12px',
                                    borderRadius: '20px', fontSize: '0.8rem',
                                }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: colors[status] || '#999',
                                        display: 'inline-block',
                                    }} />
                                    <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                    <span style={{ fontWeight: 700 }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
