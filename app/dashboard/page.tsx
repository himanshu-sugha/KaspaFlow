'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useStreams } from '@/contexts/StreamContext';
import AIStreamCreator from '@/components/stream/AIStreamCreator';
import StreamCreator from '@/components/stream/StreamCreator';
import StreamCard from '@/components/stream/StreamCard';
import ParticleFlow from '@/components/dashboard/ParticleFlow';
import TxTicker from '@/components/dashboard/TxTicker';
import StatsCounter from '@/components/dashboard/StatsCounter';

export default function DashboardPage() {
    const { isConnected, enableDemoMode, connect, isInstalled } = useWallet();
    const { streams, activeStreams, completedStreams } = useStreams();

    if (!isConnected) {
        return (
            <div className="container">
                <div className="empty-state" style={{ paddingTop: 'var(--space-4xl)' }}>
                    <div className="empty-state-icon">🔗</div>
                    <h3>Connect Your Wallet</h3>
                    <p style={{ marginBottom: 'var(--space-xl)' }}>
                        Connect your Kasware wallet or try demo mode to start streaming payments.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
                        <button className="btn btn-primary" onClick={connect}>
                            🔗 Connect Wallet
                        </button>
                        {!isInstalled && (
                            <button className="btn btn-secondary" onClick={enableDemoMode}>
                                🎮 Demo Mode
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Stats Bar */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <StatsCounter />
            </div>

            {/* Particle Visualization */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <ParticleFlow streams={streams} />
            </div>

            {/* Main Dashboard Grid */}
            <div className="dashboard">
                <div className="dashboard-main">
                    {/* AI-Powered Quick Create */}
                    <AIStreamCreator />

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                        margin: 'var(--space-xs) 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            or use manual form
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    {/* Manual Stream Creator */}
                    <StreamCreator />

                    {/* Active Streams */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            ⚡ Active Streams
                            {activeStreams.length > 0 && (
                                <span className="badge badge-active badge-dot">{activeStreams.length}</span>
                            )}
                        </h3>
                        {activeStreams.length === 0 ? (
                            <div className="card empty-state" style={{ padding: 'var(--space-xl)' }}>
                                <div className="empty-state-icon">💸</div>
                                <h3>No Active Streams</h3>
                                <p>Create your first stream above to start flowing KAS.</p>
                            </div>
                        ) : (
                            <div className="stream-grid">
                                {activeStreams.map(stream => (
                                    <StreamCard key={stream.id} stream={stream} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Streams (preview) */}
                    {completedStreams.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                                ✅ Recently Completed
                            </h3>
                            <div className="stream-grid">
                                {completedStreams.slice(0, 3).map(stream => (
                                    <StreamCard key={stream.id} stream={stream} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Transaction Feed */}
                <div className="dashboard-sidebar">
                    <TxTicker />
                </div>
            </div>
        </div>
    );
}
