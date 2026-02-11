'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useStreams } from '@/contexts/StreamContext';
import { isValidKaspaAddress, formatKas, sompiToKas, kasToSompi } from '@/lib/utils';

export default function StreamCreator() {
    const { address, balance, demoMode, network } = useWallet();
    const { createNewStream, isCreating, error } = useStreams();

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('5');
    const [interval, setInterval] = useState('15');
    const [showPreview, setShowPreview] = useState(false);

    const amountNum = parseFloat(amount) || 0;
    const durationNum = parseFloat(duration) || 0;
    const intervalNum = parseInt(interval) || 15;
    const durationSeconds = durationNum * 60;
    const numPayments = Math.floor(durationSeconds / intervalNum);
    const amountPerTx = numPayments > 0 ? amountNum / numPayments : 0;
    const flowRatePerSec = durationSeconds > 0 ? amountNum / durationSeconds : 0;

    const addressPrefix = network?.includes('mainnet') ? 'kaspa:' : 'kaspatest:';
    const isValidAddr = demoMode ? recipient.length > 5 : isValidKaspaAddress(recipient);
    const hasSufficientBalance = kasToSompi(amountNum) <= balance.total;
    const isValid = isValidAddr && amountNum > 0 && durationNum > 0 && hasSufficientBalance && numPayments > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        createNewStream({
            recipient,
            totalAmountKas: amountNum,
            durationMinutes: durationNum,
            interval: intervalNum,
        });
        // Reset form
        setRecipient('');
        setAmount('');
        setDuration('5');
        setShowPreview(false);
    };

    return (
        <div className="card card-glow">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>💸 Create New Stream</h2>
                {demoMode && <span className="badge badge-paused">Demo Mode</span>}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Recipient */}
                <div className="input-group">
                    <label className="input-label">Recipient Address</label>
                    <input
                        className="input input-mono"
                        type="text"
                        placeholder={`${addressPrefix}qz0s22ece8ej08...`}
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                    />
                    {recipient && !isValidAddr && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
                            Invalid Kaspa address format
                        </span>
                    )}
                </div>

                {/* Amount + Duration row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="input-group">
                        <label className="input-label">Total Amount (KAS)</label>
                        <input
                            className="input"
                            type="number"
                            step="0.0001"
                            min="0.001"
                            placeholder="10.0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Balance: {formatKas(balance.total, 2)} KAS
                        </span>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Duration (minutes)</label>
                        <input
                            className="input"
                            type="number"
                            step="1"
                            min="1"
                            max="1440"
                            placeholder="5"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                {/* Interval */}
                <div className="input-group">
                    <label className="input-label">Payment Interval (seconds)</label>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        {[10, 15, 30, 60].map(sec => (
                            <button
                                key={sec}
                                type="button"
                                className={`btn btn-sm ${intervalNum === sec ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setInterval(String(sec))}
                            >
                                {sec}s
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                {amountNum > 0 && durationNum > 0 && (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'rgba(73, 234, 203, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(73, 234, 203, 0.1)',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            Stream Preview
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Flow Rate</div>
                                <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                                    {flowRatePerSec.toFixed(4)} KAS/s
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Payments</div>
                                <div style={{ fontWeight: 700 }}>{numPayments} txs</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Per TX</div>
                                <div style={{ fontWeight: 700 }}>{amountPerTx.toFixed(4)} KAS</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}
                {!hasSufficientBalance && amountNum > 0 && (
                    <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', fontSize: '0.85rem' }}>
                        Insufficient balance. Need {amount} KAS but only have {formatKas(balance.total, 2)} KAS.
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!isValid || isCreating}
                    style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                >
                    {isCreating ? '⏳ Creating...' : '⚡ Create Stream'}
                </button>
            </form>
        </div>
    );
}
