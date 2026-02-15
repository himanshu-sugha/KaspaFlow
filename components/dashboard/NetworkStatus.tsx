'use client';

import React, { useState, useEffect } from 'react';
import { getBlockDagInfo } from '@/lib/kaspa/api';
import { useKasPrice } from '@/lib/kaspa/price';

export default function NetworkStatus() {
    const [dagInfo, setDagInfo] = useState<{
        blockCount: string;
        headerCount: string;
        difficulty: number;
        networkName: string;
        virtualDaaScore: string;
    } | null>(null);
    const [isLive, setIsLive] = useState(false);
    const { price } = useKasPrice();

    useEffect(() => {
        let mounted = true;

        const fetchInfo = async () => {
            try {
                const info = await getBlockDagInfo();
                if (mounted && info) {
                    setDagInfo(info);
                    setIsLive(true);
                }
            } catch {
                if (mounted) setIsLive(false);
            }
        };

        fetchInfo();
        const timer = setInterval(fetchInfo, 10_000); // every 10s

        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, []);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(73, 234, 203, 0.04)',
            border: '1px solid rgba(73, 234, 203, 0.08)',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-md)',
        }}>
            {/* Left side: connection status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isLive ? '#49eacb' : '#636e72',
                    boxShadow: isLive ? '0 0 8px #49eacb' : 'none',
                    display: 'inline-block',
                    animation: isLive ? 'glow-pulse 2s ease-in-out infinite' : 'none',
                }} />
                <span style={{ fontWeight: 600, color: isLive ? '#49eacb' : '#636e72' }}>
                    {isLive ? 'Live' : 'Connecting...'}
                </span>
                <span>·</span>
                <span>Kaspa {dagInfo?.networkName?.includes('mainnet') ? 'Mainnet' : 'Testnet'}</span>
            </div>

            {/* Right side: stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {dagInfo && (
                    <>
                        <span>
                            Block <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                #{parseInt(dagInfo.blockCount).toLocaleString()}
                            </strong>
                        </span>
                        <span>·</span>
                        <span>DAA <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                            {parseInt(dagInfo.virtualDaaScore).toLocaleString()}
                        </strong></span>
                    </>
                )}
                {price > 0 && (
                    <>
                        <span>·</span>
                        <span>
                            KAS <strong style={{ color: '#49eacb', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                ${price.toFixed(4)}
                            </strong>
                        </span>
                    </>
                )}
                <span>·</span>
                <span style={{ color: 'var(--accent-teal)' }}>⚡ 10 BPS</span>
            </div>
        </div>
    );
}
