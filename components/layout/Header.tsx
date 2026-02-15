'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress, formatKas } from '@/lib/utils';

export default function Header() {
    const pathname = usePathname();
    const { isConnected, isConnecting, address, balance, demoMode, connect, disconnect, enableDemoMode, isInstalled } = useWallet();

    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                    <div className="logo-icon">⚡</div>
                    <span className="logo-text">
                        Kaspa<span className="highlight">Flow</span>
                    </span>
                </Link>

                <nav>
                    <ul className="nav-links">
                        <li>
                            <Link href="/" className={pathname === '/' ? 'active' : ''}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/pay/create" className={pathname.startsWith('/pay') ? 'active' : ''}>
                                Pay
                            </Link>
                        </li>
                        <li>
                            <Link href="/analytics" className={pathname === '/analytics' ? 'active' : ''}>
                                Analytics
                            </Link>
                        </li>
                        <li>
                            <Link href="/payroll" className={pathname === '/payroll' ? 'active' : ''}>
                                Payroll
                            </Link>
                        </li>
                        <li>
                            <Link href="/history" className={pathname === '/history' ? 'active' : ''}>
                                History
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="wallet-btn">
                    {isConnected ? (
                        <>
                            {demoMode && (
                                <span className="badge badge-paused" style={{ fontSize: '0.7rem' }}>DEMO</span>
                            )}
                            <span className="wallet-dot" />
                            <span className="wallet-addr">{truncateAddress(address)}</span>
                            <span className="wallet-balance">{formatKas(balance.total, 2)} KAS</span>
                            <button className="btn btn-secondary btn-sm" onClick={disconnect}>
                                ✕
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={connect}
                                disabled={isConnecting}
                            >
                                {isConnecting ? '⏳ Connecting...' : '🔗 Connect Wallet'}
                            </button>
                            {!isInstalled && (
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={enableDemoMode}
                                >
                                    🎮 Demo Mode
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
