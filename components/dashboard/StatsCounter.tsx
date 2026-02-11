'use client';

import React, { useEffect, useState } from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { formatKas, sompiToKas } from '@/lib/utils';

export default function StatsCounter() {
    const { stats } = useStreams();
    const [displayFlowRate, setDisplayFlowRate] = useState(0);

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

    return (
        <div className="stats-bar">
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                    {stats.activeStreams}
                </div>
                <div className="stat-label">Active Streams</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', animation: stats.currentFlowRate > 0 ? 'glow-pulse 2s ease-in-out infinite' : 'none' }}>
                <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                    {displayFlowRate.toFixed(4)}
                </div>
                <div className="stat-label">KAS / Second</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                    {formatKas(stats.totalKasSent, 2)}
                </div>
                <div className="stat-label">Total KAS Streamed</div>
            </div>
        </div>
    );
}
