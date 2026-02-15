import React from 'react';

interface StreamTemplatesProps {
    onSelect: (text: string) => void;
}

const TEMPLATES = [
    {
        icon: '💰',
        label: 'Payroll',
        text: 'Send 500 KAS to kaspatest:qz0s... over 24 hours',
        color: '#49eacb'
    },
    {
        icon: '🔄',
        label: 'Subscription',
        text: 'Stream 10 KAS every 30 seconds for 1 hour',
        color: '#6c5ce7'
    },
    {
        icon: '❤️',
        label: 'Tip Jar',
        text: 'Send 5 KAS to kaspatest:qz0s... over 5 minutes',
        color: '#fd79a8'
    }
];

export default function StreamTemplates({ onSelect }: StreamTemplatesProps) {
    return (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
            {TEMPLATES.map((t) => (
                <button
                    key={t.label}
                    onClick={() => onSelect(t.text)}
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
    );
}
