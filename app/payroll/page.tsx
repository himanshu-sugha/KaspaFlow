'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useStreams } from '@/contexts/StreamContext';
import { isValidKaspaAddress, formatKas, kasToSompi, truncateAddress } from '@/lib/utils';
import Link from 'next/link';

interface Recipient {
    id: string;
    address: string;
    amountKas: string;
    label: string;
}

function createEmptyRecipient(): Recipient {
    return {
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        address: '',
        amountKas: '',
        label: '',
    };
}

export default function PayrollPage() {
    const { isConnected, connect, enableDemoMode, balance, demoMode, network, isInstalled } = useWallet();
    const { createNewStream, startStreamById, streams } = useStreams();

    const [recipients, setRecipients] = useState<Recipient[]>([
        createEmptyRecipient(),
        createEmptyRecipient(),
    ]);
    const [duration, setDuration] = useState('10');
    const [interval, setInterval] = useState('15');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [completed, setCompleted] = useState(false);

    const addRecipient = () => {
        setRecipients(prev => [...prev, createEmptyRecipient()]);
    };

    const removeRecipient = (id: string) => {
        if (recipients.length <= 1) return;
        setRecipients(prev => prev.filter(r => r.id !== id));
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
        setRecipients(prev => prev.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    // validation
    const durationNum = parseFloat(duration) || 0;
    const intervalNum = parseInt(interval) || 15;
    const validRecipients = recipients.filter(r =>
        (demoMode ? r.address.length > 5 : isValidKaspaAddress(r.address)) &&
        parseFloat(r.amountKas) > 0
    );
    const totalKas = recipients.reduce((sum, r) => sum + (parseFloat(r.amountKas) || 0), 0);
    const hasSufficientBalance = kasToSompi(totalKas) <= balance.total;
    const isValid = validRecipients.length > 0 && durationNum > 0 && hasSufficientBalance;

    // batch process - create streams for all recipients
    const handleStartPayroll = useCallback(async () => {
        if (!isValid) return;
        setIsProcessing(true);
        setProcessedCount(0);

        for (let i = 0; i < validRecipients.length; i++) {
            const r = validRecipients[i];
            createNewStream({
                recipient: r.address,
                totalAmountKas: parseFloat(r.amountKas),
                durationMinutes: durationNum,
                interval: intervalNum,
            });
            setProcessedCount(i + 1);
            // small delay between stream creation so they don't collide
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // auto-start all newly created streams after a moment
        setTimeout(() => {
            const newStreams = streams.slice(-validRecipients.length);
            newStreams.forEach(s => {
                if (s.status === 'pending') {
                    startStreamById(s.id);
                }
            });
        }, 500);

        setIsProcessing(false);
        setCompleted(true);
    }, [isValid, validRecipients, durationNum, intervalNum, createNewStream, startStreamById, streams]);

    if (!isConnected) {
        return (
            <div className="container">
                <div className="empty-state" style={{ paddingTop: 'var(--space-4xl)' }}>
                    <div className="empty-state-icon">👥</div>
                    <h3>Connect Your Wallet</h3>
                    <p style={{ marginBottom: 'var(--space-xl)' }}>
                        Connect your wallet or use demo mode to access payroll streaming.
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

    if (completed) {
        return (
            <div className="container">
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-3xl)', textAlign: 'center' }}>
                    <div className="card card-glow" style={{ padding: 'var(--space-2xl)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>✅</div>
                        <h2>Payroll Streams Created!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
                            {validRecipients.length} stream{validRecipients.length !== 1 ? 's' : ''} created
                            totaling {totalKas.toFixed(4)} KAS over {duration} minutes.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                            <Link href="/dashboard" className="btn btn-primary btn-lg">
                                📊 View Dashboard
                            </Link>
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => {
                                    setCompleted(false);
                                    setRecipients([createEmptyRecipient(), createEmptyRecipient()]);
                                }}
                            >
                                ✨ New Payroll
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>
                    👥 Multi-Recipient Payroll
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.9rem' }}>
                    Stream KAS to multiple addresses simultaneously — perfect for payroll, batch tips, or team payments
                </p>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    {/* Recipients list */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                Recipients ({recipients.length})
                            </label>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={addRecipient}
                                type="button"
                            >
                                + Add Recipient
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {recipients.map((r, i) => {
                                const isValidAddr = demoMode ? r.address.length > 5 : isValidKaspaAddress(r.address);
                                return (
                                    <div
                                        key={r.id}
                                        style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '12px',
                                            padding: 'var(--space-md)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                                #{i + 1} {r.label || 'Recipient'}
                                            </span>
                                            {recipients.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipient(r.id)}
                                                    style={{
                                                        background: 'none', border: 'none', color: 'var(--text-muted)',
                                                        cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                            <input
                                                type="text"
                                                placeholder="Label (optional)"
                                                value={r.label}
                                                onChange={e => updateRecipient(r.id, 'label', e.target.value)}
                                                style={{
                                                    flex: '0 0 120px', padding: '6px 10px',
                                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                                    borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem',
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="KAS"
                                                step="0.01"
                                                min="0.01"
                                                value={r.amountKas}
                                                onChange={e => updateRecipient(r.id, 'amountKas', e.target.value)}
                                                style={{
                                                    flex: '0 0 100px', padding: '6px 10px',
                                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                                    borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem',
                                                }}
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            placeholder={demoMode ? 'Any address' : 'kaspatest:qr...'}
                                            value={r.address}
                                            onChange={e => updateRecipient(r.id, 'address', e.target.value)}
                                            style={{
                                                width: '100%', padding: '6px 10px',
                                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                                borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem',
                                                fontFamily: 'monospace',
                                            }}
                                        />
                                        {r.address && !isValidAddr && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-pink)' }}>
                                                Invalid address
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shared settings */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                                Interval (seconds)
                            </label>
                            <select
                                value={interval}
                                onChange={e => setInterval(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                                }}
                            >
                                <option value="10">10s</option>
                                <option value="15">15s</option>
                                <option value="30">30s</option>
                                <option value="60">60s</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{
                        background: 'rgba(73, 234, 203, 0.08)',
                        border: '1px solid rgba(73, 234, 203, 0.15)',
                        borderRadius: '12px',
                        padding: 'var(--space-lg)',
                        marginBottom: 'var(--space-lg)',
                    }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--accent-teal)' }}>
                            Payroll Summary
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Recipients</div>
                                <div style={{ fontWeight: 700 }}>{validRecipients.length} / {recipients.length}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total KAS</div>
                                <div style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{totalKas.toFixed(4)}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Balance</div>
                                <div style={{ fontWeight: 700, color: hasSufficientBalance ? 'var(--text-primary)' : 'var(--accent-pink)' }}>
                                    {formatKas(balance.total, 2)} KAS
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Errors */}
                    {!hasSufficientBalance && totalKas > 0 && (
                        <div style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            color: 'var(--accent-pink)',
                            fontSize: '0.85rem',
                            marginBottom: 'var(--space-md)',
                        }}>
                            ⚠️ Insufficient balance. Need {totalKas.toFixed(4)} KAS.
                        </div>
                    )}

                    {/* Processing indicator */}
                    {isProcessing && (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: 'var(--space-xs)' }}>⏳</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Creating streams... {processedCount}/{validRecipients.length}
                            </div>
                            <div style={{
                                width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)',
                                borderRadius: '2px', marginTop: 'var(--space-sm)', overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${(processedCount / validRecipients.length) * 100}%`,
                                    height: '100%', background: 'var(--accent-teal)',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        onClick={handleStartPayroll}
                        disabled={!isValid || isProcessing}
                    >
                        {isProcessing
                            ? `⏳ Creating ${processedCount}/${validRecipients.length}...`
                            : `⚡ Start Payroll — ${totalKas.toFixed(4)} KAS to ${validRecipients.length} recipient${validRecipients.length !== 1 ? 's' : ''}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
