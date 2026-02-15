'use client';

import React, { useEffect, useState } from 'react';
import { useKasPrice } from '@/lib/kaspa/price';

export default function LandingStats() {
    const [totalStreamed, setTotalStreamed] = useState(1250430);
    const kasPrice = useKasPrice();

    // Simulate live global activity
    useEffect(() => {
        const interval = setInterval(() => {
            setTotalStreamed(prev => prev + (Math.random() * 5));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const totalUsd = totalStreamed * kasPrice;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-2xl)',
            marginTop: 'var(--space-2xl)',
            flexWrap: 'wrap'
        }}>
            <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', minWidth: '200px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#49eacb', fontFamily: 'var(--font-mono)' }}>
                    {Math.floor(totalStreamed).toLocaleString()}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total KAS Streamed</div>
                {kasPrice > 0 && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                        ≈ ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', minWidth: '200px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6c5ce7', fontFamily: 'var(--font-mono)' }}>
                    2,405
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Active Streams</div>
            </div>
        </div>
    );
}
