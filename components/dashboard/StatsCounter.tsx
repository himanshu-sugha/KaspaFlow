'use client';

import React, { useEffect, useState } from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { formatKas, sompiToKas } from '@/lib/utils';
import { useKasPrice } from '@/lib/kaspa/price';

export default function StatsCounter() {
    const { stats } = useStreams();
    const [displayFlowRate, setDisplayFlowRate] = useState(0);
    const kasPrice = useKasPrice();

    // Smooth animated counter for flow rate
    useEffect(() => {
        const target = sompiToKas(stats.currentFlowRate);
        const step = (target - displayFlowRate) * 0.1;
        if (Math.abs(step) < 0.00001) {
            setDisplayFlowRate(target);
            return;
        }
        const timer = setTimeout(() => {
            setDisplayFlowRate(prev => prev + step);
        }, 50);
        return () => clearTimeout(timer);
    }, [stats.currentFlowRate, displayFlowRate]);

    const totalKas = sompiToKas(stats.totalKasSent);
    const totalUsd = totalKas * kasPrice;
    const flowUsd = displayFlowRate * kasPrice;

    return (
        <div className="stats-bar">
            {/* Active Streams */}
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                    {stats.activeStreams}
                </div>
                <div className="stat-label">Active Streams</div>
            </div>

            {/* Flow Rate */}
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', animation: stats.currentFlowRate > 0 ? 'glow-pulse 2s ease-in-out infinite' : 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                    {displayFlowRate.toFixed(4)}
                </div>
                <div className="stat-label">KAS / Second</div>
                {kasPrice > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        ≈ ${flowUsd.toFixed(4)}/s
                    </div>
                )}
            </div>

            {/* Total Volume */}
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                    {formatKas(stats.totalKasSent, 0)}
                </div>
                <div className="stat-label">Total KAS Streamed</div>
                {kasPrice > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        ≈ ${totalUsd.toFixed(2)}
                    </div>
                )}
            </div>

            {/* Live Price Badge */}
            {kasPrice > 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="stat-value" style={{ fontSize: '1.6rem', color: '#49eacb' }}>
                        ${kasPrice.toFixed(4)}
                    </div>
                    <div className="stat-label">Live KAS Price</div>
                </div>
            )}
        </div>
    );
}
