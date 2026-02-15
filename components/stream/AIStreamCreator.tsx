'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useStreams } from '@/contexts/StreamContext';
import { useToast } from '@/contexts/ToastContext';
import { parseStreamCommand, EXAMPLE_PROMPTS, ParsedStreamCommand } from '@/lib/stream/nlp';
import { formatKas } from '@/lib/utils';

function ConfidenceDot({ confidence }: { confidence: number }) {
    const color = confidence >= 0.8 ? '#49eacb' : confidence >= 0.4 ? '#fdcb6e' : '#e17055';
    return (
        <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            background: color, boxShadow: `0 0 6px ${color}`,
        }} />
    );
}

export default function AIStreamCreator() {
    const { balance, demoMode } = useWallet();
    const { createNewStream, isCreating } = useStreams();

    const [input, setInput] = useState('');
    const [parsed, setParsed] = useState<ParsedStreamCommand | null>(null);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const { showToast } = useToast();

    // cycle placeholder examples
    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % EXAMPLE_PROMPTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // parse input in real-time
    useEffect(() => {
        if (input.trim().length < 3) {
            setParsed(null);
            return;
        }
        const result = parseStreamCommand(input);
        setParsed(result);
    }, [input]);

    const handleSubmit = useCallback(() => {
        if (!parsed?.isValid) return;
        createNewStream({
            recipient: parsed.recipient!,
            totalAmountKas: parsed.amount!,
            durationMinutes: parsed.durationMinutes!,
            interval: parsed.intervalSeconds || 15,
        });
        setInput('');
        setParsed(null);
        setShowSuccess(true);
        showToast('Stream started successfully! Money is flowing.', 'success');
        setTimeout(() => setShowSuccess(false), 3000);
    }, [parsed, createNewStream, showToast]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && parsed?.isValid) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(73, 234, 203, 0.08) 0%, rgba(108, 92, 231, 0.08) 100%)',
            border: '1px solid rgba(73, 234, 203, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-md)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    AI Stream Creator
                </span>
                <span style={{
                    fontSize: '0.65rem', fontWeight: 600, color: '#49eacb',
                    background: 'rgba(73, 234, 203, 0.1)', padding: '2px 8px',
                    borderRadius: '8px', border: '1px solid rgba(73, 234, 203, 0.2)',
                }}>
                    NLP
                </span>
                {demoMode && (
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-yellow)',
                        background: 'rgba(253, 203, 110, 0.1)', padding: '2px 8px',
                        borderRadius: '8px',
                    }}>
                        DEMO
                    </span>
                )}
            </div>

            {/* Command Input */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={EXAMPLE_PROMPTS[placeholderIdx]}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingRight: parsed?.isValid ? '90px' : '16px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${parsed?.isValid ? 'rgba(73, 234, 203, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                    }}
                />
                {parsed?.isValid && (
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        style={{
                            position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                            background: 'var(--color-primary)', color: '#000',
                            border: 'none', borderRadius: '8px', padding: '6px 14px',
                            fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            opacity: isCreating ? 0.5 : 1,
                        }}
                    >
                        {isCreating ? '...' : '⚡ Go'}
                    </button>
                )}
            </div>

            {/* Success Animation */}
            {showSuccess && (
                <div style={{
                    textAlign: 'center', padding: 'var(--space-sm)',
                    color: '#49eacb', fontSize: '0.85rem', fontWeight: 600,
                    animation: 'fadeIn 0.3s ease',
                }}>
                    ✅ Stream created from natural language!
                </div>
            )}

            {/* Parsed Preview */}
            {parsed && !showSuccess && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 'var(--space-sm)',
                }}>
                    {/* Amount */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <ConfidenceDot confidence={parsed.fields.amount.confidence} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Amount</span>
                        </div>
                        <div style={{ fontWeight: 700, color: parsed.fields.amount.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {parsed.fields.amount.value !== null ? `${parsed.fields.amount.value} KAS` : '—'}
                        </div>
                    </div>

                    {/* Recipient */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <ConfidenceDot confidence={parsed.fields.recipient.confidence} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Recipient</span>
                        </div>
                        <div style={{
                            fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem',
                            color: parsed.fields.recipient.value ? 'var(--text-primary)' : 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {parsed.fields.recipient.value
                                ? `${parsed.fields.recipient.value.slice(0, 16)}...`
                                : '—'}
                        </div>
                    </div>

                    {/* Duration */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <ConfidenceDot confidence={parsed.fields.duration.confidence} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Duration</span>
                        </div>
                        <div style={{ fontWeight: 700, color: parsed.fields.duration.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {parsed.fields.duration.value !== null ? `${parsed.fields.duration.value} min` : '—'}
                        </div>
                    </div>

                    {/* Interval */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <ConfidenceDot confidence={parsed.fields.interval.value ? parsed.fields.interval.confidence : 0.3} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Interval</span>
                        </div>
                        <div style={{ fontWeight: 700, color: parsed.fields.interval.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {parsed.fields.interval.value !== null ? `${parsed.fields.interval.value}s` : '15s'}
                        </div>
                    </div>
                </div>
            )}

            {/* Suggestion */}
            {parsed && parsed.suggestion && !showSuccess && (
                <div style={{
                    marginTop: 'var(--space-sm)', fontSize: '0.75rem',
                    color: 'var(--text-muted)', fontStyle: 'italic',
                }}>
                    💡 {parsed.suggestion}
                </div>
            )}

            {/* Hint when empty */}
            {!input && !showSuccess && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Type a command like <strong>&quot;stream 50 KAS to kaspatest:... over 10 minutes&quot;</strong> and press Enter
                </div>
            )}

            {/* Quick Templates */}
            {!input && !showSuccess && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Quick Start
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        {[
                            { icon: '💰', label: 'Payroll', text: 'Send 500 KAS to kaspatest:qz0s... over 24 hours', color: '#49eacb' },
                            { icon: '🔄', label: 'Subscription', text: 'Stream 10 KAS every 30 seconds for 1 hour', color: '#6c5ce7' },
                            { icon: '❤️', label: 'Tip Jar', text: 'Send 5 KAS to kaspatest:qz0s... over 5 minutes', color: '#fd79a8' }
                        ].map((t) => (
                            <button
                                key={t.label}
                                onClick={() => setInput(t.text)}
                                className="btn"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = t.color;
                                    e.currentTarget.style.background = `${t.color}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                <span>{t.icon}</span>
                                <span style={{ fontWeight: 500 }}>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
