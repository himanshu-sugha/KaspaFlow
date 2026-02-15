'use client';

import React from 'react';
import { useStreams } from '@/contexts/StreamContext';
import { useWallet } from '@/contexts/WalletContext';
import { formatKas, truncateAddress, formatDuration, formatDate, sompiToKas } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/kaspa/api';

// export all stream + tx data as CSV for accounting
function exportToCsv(streams: any[], network: string) {
    const rows: string[][] = [
        ['Stream ID', 'Status', 'Recipient', 'Amount Sent (KAS)', 'Total Amount (KAS)', 'Duration', 'Tx Count', 'Created', 'Tx ID', 'Tx Amount (KAS)', 'Tx Time', 'On-Chain Status', 'Explorer URL'],
    ];

    streams.forEach(stream => {
        if (stream.txHistory.length === 0) {
            rows.push([
                stream.id, stream.status, stream.recipient,
                sompiToKas(stream.amountSent).toFixed(8),
                sompiToKas(stream.totalAmount).toFixed(8),
                formatDuration(stream.duration),
                '0', new Date(stream.createdAt).toISOString(),
                '', '', '', '', '',
            ]);
        } else {
            stream.txHistory.forEach((tx: any, i: number) => {
                rows.push([
                    i === 0 ? stream.id : '',
                    i === 0 ? stream.status : '',
                    i === 0 ? stream.recipient : '',
                    i === 0 ? sompiToKas(stream.amountSent).toFixed(8) : '',
                    i === 0 ? sompiToKas(stream.totalAmount).toFixed(8) : '',
                    i === 0 ? formatDuration(stream.duration) : '',
                    i === 0 ? stream.txHistory.length.toString() : '',
                    i === 0 ? new Date(stream.createdAt).toISOString() : '',
                    tx.txId,
                    sompiToKas(tx.amount).toFixed(8),
                    new Date(tx.timestamp).toISOString(),
                    tx.onChainStatus || 'unknown',
                    tx.explorerUrl || getExplorerTxUrl(tx.txId, network),
                ]);
            });
        }
    });

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kaspaflow_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export default function HistoryPage() {
    const { streams, completedStreams, stats } = useStreams();
    const { isConnected, network, demoMode } = useWallet();

    const allFinished = streams.filter(s => s.status === 'completed' || s.status === 'cancelled');

    if (!isConnected) {
        return (
            <div className="container">
                <div className="empty-state" style={{ paddingTop: 'var(--space-4xl)' }}>
                    <div className="empty-state-icon">📊</div>
                    <h3>Connect to View History</h3>
                    <p>Connect your wallet to view your stream history and analytics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-4xl)' }}>
            {/* Page Header */}
            <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-sm)' }}>
                        📊 Stream History
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        View your completed and cancelled payment streams
                    </p>
                </div>
                {streams.length > 0 && (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => exportToCsv(streams, network)}
                        title="Download all stream and transaction data as CSV"
                    >
                        📥 Export CSV
                    </button>
                )}
            </div>

            {/* Summary Stats */}
            <div className="stats-bar" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                    <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                        {stats.totalStreams}
                    </div>
                    <div className="stat-label">Total Streams</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                    <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                        {formatKas(stats.totalKasSent, 2)}
                    </div>
                    <div className="stat-label">Total KAS Streamed</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                    <div className="stat-value stat-highlight" style={{ fontSize: '1.6rem' }}>
                        {stats.totalTransactions}
                    </div>
                    <div className="stat-label">Total Transactions</div>
                </div>
            </div>

            {/* History Table */}
            {allFinished.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📜</div>
                    <h3>No Stream History</h3>
                    <p>Completed and cancelled streams will appear here. Create your first stream on the Dashboard.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Recipient</th>
                                <th>Amount Sent</th>
                                <th>Total</th>
                                <th>Duration</th>
                                <th>Transactions</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allFinished.map(stream => (
                                <tr key={stream.id}>
                                    <td>
                                        <span className={`badge badge-${stream.status === 'completed' ? 'completed' : 'error'}`}>
                                            {stream.status === 'completed' ? '✅ Done' : '✕ Cancelled'}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                                        {truncateAddress(stream.recipient)}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {formatKas(stream.amountSent, 4)} KAS
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {formatKas(stream.totalAmount, 4)} KAS
                                    </td>
                                    <td>{formatDuration(stream.duration)}</td>
                                    <td>
                                        {stream.txHistory.length} txs
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        {formatDate(stream.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transaction Log */}
            {allFinished.some(s => s.txHistory.length > 0) && (
                <div style={{ marginTop: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        🔗 Transaction Log
                    </h2>
                    <div className="card" style={{ maxHeight: '500px', overflow: 'auto' }}>
                        <div className="tx-ticker">
                            {allFinished
                                .flatMap(s => s.txHistory.map(tx => ({
                                    ...tx,
                                    streamRecipient: s.recipient,
                                    streamColor: s.color,
                                })))
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .slice(0, 100)
                                .map((tx, i) => (
                                    <div className="tx-item" key={`${tx.txId}-${i}`}>
                                        <span className="tx-amount">
                                            +{sompiToKas(tx.amount).toFixed(4)}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            → {truncateAddress(tx.streamRecipient, 4)}
                                        </span>
                                        <span className="tx-hash">
                                            {demoMode ? (
                                                tx.txId.slice(0, 10) + '...'
                                            ) : (
                                                <a
                                                    href={getExplorerTxUrl(tx.txId, network)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--text-tertiary)' }}
                                                >
                                                    {tx.txId.slice(0, 10)}...
                                                </a>
                                            )}
                                        </span>
                                        <span className="tx-time">
                                            {formatDate(tx.timestamp)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
