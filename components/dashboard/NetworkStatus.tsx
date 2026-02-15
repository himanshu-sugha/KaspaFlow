import React, { useEffect, useState } from 'react';
import { getBlockDagInfo, BlockDagInfo } from '@/lib/kaspa/api';

export default function NetworkStatus() {
    const [info, setInfo] = useState<BlockDagInfo | null>(null);
    const [bps, setBps] = useState<number>(0);
    const [lastBlockCount, setLastBlockCount] = useState<number>(0);
    const [lastTime, setLastTime] = useState<number>(Date.now());

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const data = await getBlockDagInfo();
                setInfo(data);

                // Calculate approx BPS
                const currentBlockCount = parseInt(data.blockCount);
                const now = Date.now();

                if (lastBlockCount > 0) {
                    const diff = currentBlockCount - lastBlockCount;
                    const timeDiff = (now - lastTime) / 1000;
                    if (timeDiff > 0) {
                        setBps(diff / timeDiff);
                    }
                }

                setLastBlockCount(currentBlockCount);
                setLastTime(now);

            } catch (err) {
                console.error('Failed to fetch network info:', err);
            }
        };

        fetchInfo();
        const interval = setInterval(fetchInfo, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [lastBlockCount, lastTime]);

    if (!info) return null;

    return (
        <div className="network-status-bar" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#49eacb', boxShadow: '0 0 8px #49eacb' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Kaspa Testnet-10</span>
            </div>

            <div className="separator" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>

            <div>
                BlockDAG Tip: <span style={{ color: 'var(--text-primary)' }}>{parseInt(info.blockCount).toLocaleString()}</span>
            </div>

            <div className="separator" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>

            <div>
                BPS: <span style={{ color: '#49eacb' }}>{bps > 0 ? bps.toFixed(2) : '~1.00'}</span>
            </div>

            <div className="separator" style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>

            <div>
                DAA Score: <span style={{ color: 'var(--text-primary)' }}>{parseInt(info.virtualDaaScore).toLocaleString()}</span>
            </div>
        </div>
    );
}
