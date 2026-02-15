'use client';

import React, { useEffect, useState } from 'react';
import { PaymentStream } from '@/lib/stream/types';
import { useStreams } from '@/contexts/StreamContext';
import { useToast } from '@/contexts/ToastContext';
import { formatKas, truncateAddress, formatTimeRemaining, sompiToKas } from '@/lib/utils';
import { useKasPrice } from '@/lib/kaspa/price';

interface StreamCardProps {
    stream: PaymentStream;
}

export default function StreamCard({ stream }: StreamCardProps) {
    const { startStreamById, pauseStreamById, cancelStreamById, removeStreamById } = useStreams();
    const [elapsed, setElapsed] = useState(0);
    const kasPrice = useKasPrice();
    const { showToast } = useToast();

    const progress = stream.totalAmount > 0
        ? Math.min((stream.amountSent / stream.totalAmount) * 100, 100)
        : 0;

    const timeRemaining = stream.duration - elapsed;
    const totalUsd = sompiToKas(stream.totalAmount) * kasPrice;

    // Update elapsed time counter
    useEffect(() => {
        if (stream.status !== 'active') return;

        const updateElapsed = () => {
            if (stream.startedAt) {
                const totalElapsed = stream.elapsedBeforePause +
                    ((Date.now() - stream.startedAt) / 1000);
                setElapsed(Math.min(totalElapsed, stream.duration));
            }
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);
        return () => clearInterval(interval);
    }, [stream.status, stream.startedAt, stream.elapsedBeforePause, stream.duration]);

    useEffect(() => {
        if (stream.status === 'paused' || stream.status === 'error') {
            setElapsed(stream.elapsedBeforePause);
        }
    }, [stream.status, stream.elapsedBeforePause]);

    return (
        <div className={`card stream-card ${stream.status}`} style={{ borderLeftColor: stream.color }}>
            {/* Header */}
            <div className="stream-card-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                        <span className={`badge badge-dot badge-${stream.status === 'error' ? 'error' : stream.status}`}>
                            {stream.status}
                        </span>
                    </div>
                    <div className="stream-recipient">
                        → {truncateAddress(stream.recipient)}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="stream-sent" style={{ color: stream.color }}>
                        {formatKas(stream.amountSent, 4)}
                    </div>
                    <div className="stream-total">
                        / {formatKas(stream.totalAmount, 4)} KAS
                    </div>
                    {kasPrice > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                            ≈ ${totalUsd.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="stream-card-body">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${stream.color}, ${stream.color}80)`
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span className="stream-time">
                        {stream.status === 'active'
                            ? formatTimeRemaining(Math.max(0, Math.round(timeRemaining)))
                            : stream.status === 'completed'
                                ? '✅ Complete'
                                : stream.status === 'error'
                                    ? `⚠️ ${stream.errorMessage || 'Error'}`
                                    : `${progress.toFixed(1)}% done`
                        }
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {stream.txHistory.length} txs
                    </span>
                </div>

                {/* Controls */}
                <div className="stream-controls">
                    {(stream.status === 'pending' || stream.status === 'paused' || stream.status === 'error') && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                startStreamById(stream.id);
                                showToast(stream.status === 'paused' ? 'Resuming stream...' : 'Starting stream...', 'info');
                            }}
                        >
                            {stream.status === 'pending' ? '▶ Start' : '▶ Resume'}
                        </button>
                    )}
                    {stream.status === 'active' && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                pauseStreamById(stream.id);
                                showToast('Stream paused', 'info');
                            }}
                        >
                            ⏸ Pause
                        </button>
                    )}
                    {(stream.status === 'active' || stream.status === 'paused' || stream.status === 'error') && (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                cancelStreamById(stream.id);
                                showToast('Stream stopped', 'info');
                            }}
                        >
                            ✕ Cancel
                        </button>
                    )}
                    {(stream.status === 'completed' || stream.status === 'cancelled') && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                removeStreamById(stream.id);
                                showToast('Stream removed', 'info');
                            }}
                        >
                            🗑 Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
