'use client';

import React from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { formatTimestamp, sompiToKas } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/kaspa/api';
import { useWallet } from '@/contexts/WalletContext';

export default function TxTicker() {
    const { recentTransactions } = useStreams();
    const { network, demoMode } = useWallet();

    if (recentTransactions.length === 0) {
        return (
            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                    📡 Transaction Feed
                </h3>
                <div className="empty-state" style={{ padding: 'var(--space-xl) 0' }}>
                    <div className="empty-state-icon">📡</div>
                    <p style={{ fontSize: '0.85rem' }}>
                        Transactions will appear here<br />as streams execute
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>📡 Transaction Feed</span>
                <span className="badge badge-active badge-dot" style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    {recentTransactions.length} txs
                </span>
            </h3>
            <div className="tx-ticker">
                {recentTransactions.slice(0, 20).map((tx, i) => (
                    <div className={`tx-item ${i === 0 ? 'new' : ''}`} key={`${tx.txId}-${tx.timestamp}`}>
                        <span className="tx-amount">
                            +{sompiToKas(tx.amount).toFixed(4)}
                        </span>
                        <span className="tx-hash">
                            {demoMode ? (
                                tx.txId.slice(0, 12) + '...'
                            ) : (
                                <a
                                    href={getExplorerTxUrl(tx.txId, network)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {tx.txId.slice(0, 12)}...
                                </a>
                            )}
                        </span>
                        <span className="tx-time">
                            {formatTimestamp(tx.timestamp)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
