'use client';

import React from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { formatTimestamp, sompiToKas } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/kaspa/api';
import { useWallet } from '@/contexts/WalletContext';

// kasware sometimes returns txid wrapped in json — extract the actual hash
function cleanTxId(txId: string): string {
    if (!txId) return '';
    if (txId.startsWith('{')) {
        try {
            const parsed = JSON.parse(txId);
            return parsed.id || parsed.txId || parsed.txid || parsed.transaction_id || txId;
        } catch {
            // try regex fallback for partial json
            const match = txId.match(/[a-f0-9]{64}/i);
            if (match) return match[0];
        }
    }
    return txId;
}

// verification status indicator
function VerificationBadge({ status }: { status?: string }) {
    if (status === 'accepted') {
        return (
            <span title="Confirmed on-chain" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.65rem', color: '#49eacb', fontWeight: 600,
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#49eacb', display: 'inline-block',
                    boxShadow: '0 0 6px #49eacb',
                }} />
                ON-CHAIN
            </span>
        );
    }
    if (status === 'verifying' || status === 'unverified') {
        return (
            <span title="Verifying on-chain..." style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.65rem', color: '#fdcb6e', fontWeight: 600,
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#fdcb6e', display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                }} />
                PENDING
            </span>
        );
    }
    if (status === 'not_found') {
        return (
            <span title="Not found on-chain yet" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.65rem', color: '#e17055', fontWeight: 600,
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#e17055', display: 'inline-block',
                }} />
                RETRY
            </span>
        );
    }
    return null;
}

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

    // count verified txs
    const verifiedCount = recentTransactions.filter(tx => tx.onChainStatus === 'accepted').length;

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>📡 Transaction Feed</span>
                <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {verifiedCount > 0 && (
                        <span style={{
                            fontSize: '0.7rem', color: '#49eacb', fontWeight: 600,
                            background: 'rgba(73, 234, 203, 0.1)',
                            padding: '2px 8px', borderRadius: '8px',
                            border: '1px solid rgba(73, 234, 203, 0.2)',
                        }}>
                            ✓ {verifiedCount} verified
                        </span>
                    )}
                    <span className="badge badge-active badge-dot" style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                        {recentTransactions.length} txs
                    </span>
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
                            ) : (() => {
                                const clean = cleanTxId(tx.txId);
                                return (
                                    <a
                                        href={getExplorerTxUrl(clean, network)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
                                        title={`View ${clean} on Explorer`}
                                    >
                                        {clean.slice(0, 12)}… 🔗
                                    </a>
                                );
                            })()}
                        </span>
                        {!demoMode && <VerificationBadge status={tx.onChainStatus} />}
                        <span className="tx-time">
                            {formatTimestamp(tx.timestamp)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
