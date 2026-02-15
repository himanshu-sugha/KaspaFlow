'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import LandingStats from '@/components/landing/LandingStats';

export default function HomePage() {
  const { isConnected, connect, enableDemoMode, isInstalled } = useWallet();

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="dot" />
          Powered by Kaspa BlockDAG — 10 blocks per second
        </div>
        <h1>
          Money that flows<br />
          <span className="gradient">like water</span>
        </h1>
        <p className="hero-description">
          Stream KAS per-second with real-time visualization. Pay salaries,
          subscriptions, or tips — continuously, not in lump sums. Built on
          the world&apos;s fastest PoW blockchain.
        </p>
        <div className="hero-actions">
          {isConnected ? (
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              🚀 Open Dashboard
            </Link>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={connect}>
                🔗 Connect Wallet
              </button>
              {!isInstalled && (
                <button className="btn btn-secondary btn-lg" onClick={enableDemoMode}>
                  🎮 Try Demo Mode
                </button>
              )}
            </>
          )}
          <a
            href="https://github.com/himanshu-sugha/StreamKAS"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-lg"
          >
            ⭐ GitHub
          </a>
        </div>

        <div className="hero-stats">
          <LandingStats />
        </div>
      </section>

      {/* Features */}
      <section style={{ paddingBottom: 'var(--space-4xl)' }}>
        <div className="section-title">
          <h2>Why Streaming Payments?</h2>
          <p>Traditional payments are discrete. StreamKAS makes them continuous.</p>
        </div>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon teal">💸</div>
            <h3>Per-Second Payments</h3>
            <p>
              Define a total amount and duration — StreamKAS sends micro-transactions
              automatically, every few seconds. Watch money flow in real-time.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon purple">📊</div>
            <h3>Live Dashboard</h3>
            <p>
              Animated particle visualization shows every KAS flowing between addresses.
              Real-time counters, transaction tickers, and stream progress — all live.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon pink">🎮</div>
            <h3>Full Control</h3>
            <p>
              Start, pause, resume, or cancel any stream instantly. Track analytics,
              view transaction history, and export data — you&apos;re always in control.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="card" style={{ marginTop: 'var(--space-3xl)', padding: 'var(--space-xl)', overflowX: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>The Future of Payments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)' }}>Feature</th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#ff6b6b' }}>Traditional Payroll</th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#49eacb', fontSize: '1.2rem' }}>StreamKAS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>Frequency</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Monthly / Bi-weekly</td>
                <td style={{ padding: '16px', color: '#49eacb', fontWeight: 600 }}>Every Second</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>Transaction Fee</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>High (Bank Wires)</td>
                <td style={{ padding: '16px', color: '#49eacb', fontWeight: 600 }}>&lt; 0.0001 KAS</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>Settlement</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>1-3 Business Days</td>
                <td style={{ padding: '16px', color: '#49eacb', fontWeight: 600 }}>Instant (1s)</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', fontWeight: 600 }}>Transparency</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Opaque / Trust-based</td>
                <td style={{ padding: '16px', color: '#49eacb', fontWeight: 600 }}>100% On-Chain</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ paddingBottom: 'var(--space-4xl)' }}>
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Three steps to start streaming KAS</p>
        </div>
        <div className="steps-grid">
          <div className="card step-card">
            <div className="step-number">1</div>
            <h3>Connect Wallet</h3>
            <p>
              Link your Kasware browser extension or try demo mode.
              Get testnet KAS from the faucet to experiment.
            </p>
          </div>
          <div className="card step-card">
            <div className="step-number">2</div>
            <h3>Create a Stream</h3>
            <p>
              Set recipient address, total amount, and duration.
              StreamKAS calculates the flow rate automatically.
            </p>
          </div>
          <div className="card step-card">
            <div className="step-number">3</div>
            <h3>Watch It Flow</h3>
            <p>
              Hit start and watch micro-transactions flow in real-time.
              Every transaction confirms on-chain in under a second.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ paddingBottom: 'var(--space-4xl)' }}>
        <div className="section-title">
          <h2>Built for Real-World Use</h2>
          <p>Streaming payments unlock entirely new possibilities</p>
        </div>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon teal">💰</div>
            <h3>Payroll Streaming</h3>
            <p>Pay employees by the second, not by the month. No more waiting for payday.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon purple">🔄</div>
            <h3>Subscription Billing</h3>
            <p>Replace monthly invoices with continuous micro-payments. Cancel anytime, pay only for what you use.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon pink">❤️</div>
            <h3>Live Tips & Donations</h3>
            <p>Stream tips to creators during live events. Charity donations that flow in real-time for maximum transparency.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', paddingBottom: 'var(--space-4xl)' }}>
        <div className="card card-glow" style={{ padding: 'var(--space-3xl)', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>Ready to Stream?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
            StreamKAS is open source and runs on Kaspa testnet. Try it now — no real funds needed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {isConnected ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                🚀 Launch Dashboard
              </Link>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={connect}>
                  🔗 Connect & Start
                </button>
                <button className="btn btn-secondary btn-lg" onClick={enableDemoMode}>
                  🎮 Demo Mode
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: 'var(--space-xl) 0',
        borderTop: '1px solid var(--bg-glass-border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>
          Built with ⚡ for{' '}
          <a href="https://kaspathon.com" target="_blank" rel="noopener noreferrer">
            Kaspathon 2026
          </a>
          {' '}· Powered by{' '}
          <a href="https://kaspa.org" target="_blank" rel="noopener noreferrer">
            Kaspa
          </a>
        </p>
      </footer>
    </div>
  );
}
