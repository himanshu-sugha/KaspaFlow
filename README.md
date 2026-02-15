# KaspaFlow

> **Money that flows like water.**
> Real-time streaming payments powered by Kaspa's 10 BPS BlockDAG.

---

## What is KaspaFlow?

KaspaFlow is a **real-time payment streaming platform** that:

1. **Streams KAS by the second** - continuous micro-transactions, not lump sums
2. **AI-powered stream creation** - type natural language commands to create streams
3. **Verifies on-chain** - every micro-tx confirmed against the Kaspa blockchain
4. **Supports payroll** - stream to multiple recipients simultaneously
5. **Generates payment links** - shareable URLs for receiving streaming payments

---

## Table of Contents
1. [Features & Implementation](#features--implementation)
2. [How It Works](#-how-it-works)
3. [AI Capabilities](#-ai-capabilities)
4. [Architecture](#architecture)
5. [Pages](#pages)
6. [Tech Stack](#tech-stack)
7. [Quick Start](#quick-start)
8. [AI Usage Disclosure](#-ai-usage-disclosure)

---

## Features & Implementation

| Feature | How It Works | File/Service |
|---------|--------------|--------------|
| **Payment Streaming** | Splits total amount into micro-txs sent at configurable intervals | `lib/stream/engine.ts` |
| **AI Stream Creator** | NLP parser extracts amount, address, duration from natural language | `lib/stream/nlp.ts` |
| **On-Chain Verification** | Background verification of each tx against Kaspa REST API | `lib/kaspa/api.ts` |
| **Payment Request Links** | Shareable URLs with pre-filled stream parameters | `app/pay/page.tsx` |
| **Multi-Recipient Payroll** | Batch stream creation to multiple addresses | `app/payroll/page.tsx` |
| **Analytics Dashboard** | Real-time throughput, verification rate, stream breakdown | `app/analytics/page.tsx` |
| **CSV Export** | Download transaction history with on-chain status | `app/history/page.tsx` |
| **Particle Visualization** | Canvas animation where speed/density = flow rate | `components/dashboard/ParticleFlow.tsx` |
| **Tx Verification Badges** | Green/yellow/red indicators for on-chain confirmation | `components/dashboard/TxTicker.tsx` |
| **Kasware Integration** | Direct connection to Kaspa's leading browser wallet | `lib/kaspa/wallet.ts` |
| **Demo Mode** | Full experience without a wallet using simulated data | `contexts/WalletContext.tsx` |

---

## How It Works

```
+-------------------------------------------------------------+
|                        KaspaFlow                            |
+-------------------------------------------------------------+
|  User types: "stream 50 KAS to kaspatest:qz0... over 10m"  |
+-------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------+
|  NLP Parser (lib/stream/nlp.ts)                            |
|  Extracts: amount=50, recipient=kaspatest:qz0...,          |
|            duration=10min, interval=15s                      |
+-------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------+
|  Stream Engine (lib/stream/engine.ts)                       |
|  Creates 40 micro-txs of 1.25 KAS each                     |
|  Sends one every 15 seconds via Kasware                     |
+-------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------+
|  On-Chain Verification (lib/kaspa/api.ts)                   |
|  Each tx verified against Kaspa REST API                    |
|  Status: accepted / pending / not_found                     |
|  Links to Kaspa block explorer                              |
+-------------------------------------------------------------+
```

**Why Kaspa?** Kaspa's 10 BPS BlockDAG is the only PoW chain fast enough for per-second payment streaming. Bitcoin needs 10-minute blocks. Kaspa confirms in under a second.

---

## AI Capabilities

### Natural Language Stream Creator

The AI Stream Creator parses plain English into stream parameters using client-side NLP:

| Input Pattern | Example | Extracted |
|---------------|---------|-----------|
| Amount | "50 KAS", "0.5 kas", "100kas" | `amount: 50` |
| Recipient | "to kaspatest:qz0s22..." | `recipient: kaspatest:qz0s22...` |
| Duration | "over 30 minutes", "for 1 hour", "in 5 min" | `duration: 30 min` |
| Interval | "every 10s", "every 30 seconds" | `interval: 10s` |

**Supported command formats:**
```
"stream 50 KAS to kaspatest:qz0s22... over 30 minutes"
"send 10 KAS to kaspatest:abc123 for 5 min every 10s"
"pay 100 KAS to kaspatest:qr... in 1 hour"
"25 KAS to kaspatest:qz0... over 15 minutes every 30s"
```

**Key design decision:** Parser runs entirely client-side using regex pattern matching - no API keys, no network calls, works offline. Real-time confidence indicators show extraction accuracy per field.

### Payment Request Presets

| Preset | Use Case | Default Duration |
|--------|----------|-----------------|
| Freelance | Hourly billing | 60 min |
| Salary | Recurring payroll | 480 min |
| Tip | Quick tips | 5 min |
| Subscription | Recurring payments | 30 min |

---

## Architecture

```
+-------------------------------------------------------------+
|                       KaspaFlow                             |
+-------------------------------------------------------------+
|  UI Layer                                                   |
|  [Dashboard] [Pay] [Payroll] [Analytics] [History]          |
+-------------------------------------------------------------+
|  AI Layer (Client-Side NLP)                                 |
|  nlp.ts: Regex-based natural language parser                |
|  No external APIs required                                  |
+-------------------------------------------------------------+
|  Stream Layer                                               |
|  engine.ts: Micro-tx scheduler with background verification |
|  - Configurable intervals (10s, 15s, 30s, 60s)             |
|  - Pause/resume/cancel support                              |
|  - On-chain verification with explorer links                |
+-------------------------------------------------------------+
|  Wallet Layer                                               |
|  wallet.ts: Kasware API wrapper with response normalization |
|  api.ts: Kaspa REST API for balance, UTXOs, verification   |
+-------------------------------------------------------------+
|  Storage: localStorage with stream persistence              |
+-------------------------------------------------------------+
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Main control panel
│   ├── pay/page.tsx          # Accept payment requests
│   ├── pay/create/page.tsx   # Generate payment links
│   ├── payroll/page.tsx      # Multi-recipient streams
│   ├── analytics/page.tsx    # Real-time metrics
│   └── history/page.tsx      # Stream history + CSV export
├── components/
│   ├── stream/
│   │   ├── AIStreamCreator.tsx   # NLP command bar
│   │   ├── StreamCreator.tsx     # Manual form
│   │   └── StreamCard.tsx        # Stream display
│   ├── dashboard/
│   │   ├── ParticleFlow.tsx      # Canvas animation
│   │   ├── TxTicker.tsx          # Transaction feed
│   │   └── StatsCounter.tsx      # Animated stats
│   └── layout/
│       └── Header.tsx            # Navigation
├── contexts/
│   ├── WalletContext.tsx     # Wallet state + demo mode
│   └── StreamContext.tsx     # Stream state management
└── lib/
    ├── stream/
    │   ├── engine.ts         # Micro-tx scheduler
    │   ├── nlp.ts            # NLP parser
    │   └── types.ts          # TypeScript interfaces
    ├── kaspa/
    │   ├── wallet.ts         # Kasware wrapper
    │   └── api.ts            # REST API + verification
    └── utils.ts              # Helpers (formatting, validation)
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview and how-it-works |
| `/dashboard` | AI creator, manual creator, active streams, tx feed |
| `/pay` | Accept incoming payment request links |
| `/pay/create` | Generate shareable payment request URLs |
| `/payroll` | Multi-recipient batch stream creation |
| `/analytics` | Throughput, verification rate, charts |
| `/history` | Stream history table with CSV export |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (Custom Design System) |
| Blockchain | Kaspa (Testnet 10) |
| Wallet | Kasware Wallet API |
| API | Kaspa REST API (`api-tn10.kaspa.org`) |
| NLP | Client-side regex parser |
| Animation | HTML5 Canvas + requestAnimationFrame |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/himanshu-sugha/KaspaFlow.git
cd KaspaFlow

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

**No wallet?** Click "Demo Mode" on the dashboard - full experience with simulated data and 500 KAS test balance.

---

## AI Usage Disclosure

This project used **AI coding assistance** (Google Gemini) during development.

**Areas where AI assisted:**
- Code scaffolding and boilerplate generation
- CSS design system and UI component styling
- NLP parser implementation for the AI Stream Creator
- Bug diagnosis (Kasware wallet response normalization)
- Documentation drafting

**Human-driven areas:**
- Core concept and feature design
- All blockchain interaction logic verified manually
- Flow rate calculations and sompi conversions tested on Kaspa Testnet 10
- Architecture decisions (client-side NLP, localStorage persistence)

---

## License

MIT License

---

## Author

Built by Himanshu Sugha

Contact: himanshusugha@gmail.com

*Built for [Kaspathon 2026](https://kaspathon.com)*
