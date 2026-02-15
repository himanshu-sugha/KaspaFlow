'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { isValidKaspaAddress, truncateAddress } from '@/lib/utils';

export default function CreatePaymentRequest() {
    const { address, isConnected } = useWallet();
    const [recipient, setRecipient] = useState(isConnected ? address : '');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('5');
    const [label, setLabel] = useState('');
    const [interval, setInterval] = useState('15');
    const [copied, setCopied] = useState(false);

    // use connected wallet address by default
    React.useEffect(() => {
        if (isConnected && address && !recipient) {
            setRecipient(address);
        }
    }, [isConnected, address, recipient]);

    const isValid = isValidKaspaAddress(recipient) && parseFloat(amount) > 0 && parseFloat(duration) > 0;

    const generatedUrl = useCallback(() => {
        if (!isValid) return '';
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const params = new URLSearchParams({
            to: recipient,
            amount: amount,
            duration: duration,
        });
        if (label.trim()) params.set('label', label.trim());
        if (interval !== '15') params.set('interval', interval);
        return `${base}/pay?${params.toString()}`;
    }, [recipient, amount, duration, label, interval, isValid]);

    const url = generatedUrl();

    const copyToClipboard = async () => {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // template presets
    const applyPreset = (preset: string) => {
        switch (preset) {
            case 'freelance':
                setAmount('100');
                setDuration('60');
                setLabel('Freelance Work');
                setInterval('30');
                break;
            case 'salary':
                setAmount('500');
                setDuration('480');
                setLabel('Monthly Salary');
                setInterval('60');
                break;
            case 'tip':
                setAmount('5');
                setDuration('2');
                setLabel('Tip');
                setInterval('10');
                break;
            case 'subscription':
                setAmount('10');
                setDuration('30');
                setLabel('Subscription');
                setInterval('15');
                break;
        }
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-2xl)' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)', textAlign: 'center' }}>
                    ✨ Create Payment Request
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.9rem' }}>
                    Generate a link that anyone can use to stream KAS to you
                </p>

                {/* Quick presets */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => applyPreset('freelance')}>💼 Freelance</button>
                    <button className="btn btn-outline btn-sm" onClick={() => applyPreset('salary')}>💰 Salary</button>
                    <button className="btn btn-outline btn-sm" onClick={() => applyPreset('tip')}>☕ Tip</button>
                    <button className="btn btn-outline btn-sm" onClick={() => applyPreset('subscription')}>🔄 Subscription</button>
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    {/* Recipient */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                            Your Kaspa Address (recipient)
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="kaspatest:qr..."
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                            }}
                        />
                        {recipient && !isValidKaspaAddress(recipient) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)' }}>
                                Invalid Kaspa address
                            </span>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                            Amount (KAS)
                        </label>
                        <input
                            type="number"
                            className="input"
                            placeholder="100"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                            }}
                        />
                    </div>

                    {/* Duration */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                            Stream Duration (minutes)
                        </label>
                        <input
                            type="number"
                            className="input"
                            placeholder="5"
                            min="1"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                            }}
                        />
                    </div>

                    {/* Label */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                            Description (optional)
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Logo Design, Monthly Tip"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                            }}
                        />
                    </div>

                    {/* Interval */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
                            Payment Interval (seconds)
                        </label>
                        <select
                            value={interval}
                            onChange={e => setInterval(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
                            }}
                        >
                            <option value="5">Every 5 seconds (fastest)</option>
                            <option value="10">Every 10 seconds</option>
                            <option value="15">Every 15 seconds (default)</option>
                            <option value="30">Every 30 seconds</option>
                            <option value="60">Every 60 seconds</option>
                        </select>
                    </div>

                    {/* Generated URL */}
                    {isValid && (
                        <div style={{
                            background: 'rgba(73, 234, 203, 0.08)',
                            border: '1px solid rgba(73, 234, 203, 0.2)',
                            borderRadius: '12px',
                            padding: 'var(--space-lg)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                📎 Your Payment Link
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                                background: 'rgba(0,0,0,0.3)',
                                padding: 'var(--space-sm)',
                                borderRadius: '6px',
                            }}>
                                {url}
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={copyToClipboard}
                                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                            >
                                {copied ? '✅ Copied!' : '📋 Copy Link'}
                            </button>
                        </div>
                    )}

                    {!isValid && (
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Fill in the fields above to generate your payment link
                        </div>
                    )}
                </div>

                {/* Preview of what payer sees */}
                {isValid && (
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <h3 style={{ fontSize: '0.95rem', textAlign: 'center', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>
                            👁️ Preview: What the payer will see
                        </h3>
                        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', opacity: 0.8 }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>📨</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Payment Request</div>
                            {label && (
                                <div style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
                                    {label}
                                </div>
                            )}
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                                {amount} KAS
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-xs)' }}>
                                Streamed over {duration} min to {truncateAddress(recipient, 6)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
