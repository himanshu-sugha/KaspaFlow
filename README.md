# StreamKAS

> **Money that flows like water.**
> Real-time streaming payments powered by Kaspa's 10 BPS BlockDAG.

Built for [Kaspathon 2026](https://kaspathon.com) | Track: **Payments & Commerce**

---

## What is StreamKAS?

StreamKAS is a **real-time payment streaming platform** built on Kaspa. It replaces traditional lump-sum transfers with continuous, per-second money flows — unlocking use cases that existing payment infrastructure cannot support.

### Real-World Use Cases

| Use Case | Problem Today | How StreamKAS Fixes It |
|---|---|---|
| **Freelancer Payments** | Invoice → wait 30 days → lump sum | Earn KAS every second while working |
| **Employee Payroll** | Biweekly/monthly paycheck | Salary streams continuously |
| **Subscriptions** | Full month charged upfront | Pay-per-second; cancel anytime |

### Why This Needs Kaspa

Per-second streaming requires a blockchain that can actually confirm transactions every second. Most chains can't:

| | Kaspa | Bitcoin | Ethereum |
|---|---|---|---|
| Block time | **1 second** | 10 minutes | 12 seconds |
| Confirmation | **~1 second** | ~60 minutes | ~12 minutes |
| Cost per micro-tx | **~$0.0001** | $1–$50 | $0.50–$50 |
| Streaming viable? | **Yes** | No | No |

Kaspa's 10 BPS BlockDAG is the **only PoW chain** where per-second payment streaming is technically and economically viable.

---

## Table of Contents
1. [Key Features](#key-features)
2. [How It Works](#how-it-works)
3. [AI Stream Creator](#ai-stream-creator)
4. [Kaspa Integration Details](#kaspa-integration-details)
5. [Architecture](#architecture)
6. [Roadmap](#roadmap)
7. [Tech Stack](#tech-stack)
8. [Quick Start](#quick-start)
9. [AI Usage Disclosure](#ai-usage-disclosure)

---

## Key Features

## Key Features

| Feature | Description |
|---------|-------------|
| **Per-Second Streaming** | Splits total amount into micro-txs sent at configurable intervals (10s–60s) |
| **AI Stream Creator** | Type natural language like *"stream 50 KAS to kaspatest:qz0... over 10 minutes"* |
| **Stream Templates** | One-click presets: Payroll, Subscription, Tip Jar |
| **Live KAS/USD Price** | Real-time CoinGecko price feed with USD equivalents on every stream card |
| **Network Status Bar** | Live BlockDAG tip count and BPS displayed in the dashboard header |
| **Toast Notifications** | Visual feedback for every action (create, start, pause, cancel, copy) |
| **On-Chain Verification** | Each micro-tx verified against Kaspa REST API with explorer links |
| **Multi-Recipient Payroll** | Batch stream creation to multiple addresses simultaneously |
| **Payment Request Links** | Shareable URLs with pre-filled stream parameters + QR codes |
| **Analytics Dashboard** | Real-time throughput, verification rate, stream breakdown |
| **Kasware Integration** | Direct connection to Kaspa's leading browser wallet |
| **Demo Mode** | Full experience without a wallet — 500 KAS test balance, simulated txs |

---

## How It Works

```
User: "stream 50 KAS to kaspatest:qz0... over 10 minutes"
                        │
                        ▼
        ┌───────────────────────────────┐
        │  NLP Parser (client-side)     │
        │  Extracts: amount, address,   │
        │  duration, interval           │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Stream Engine                │
        │  Creates 40 micro-txs of     │
        │  1.25 KAS, one every 15s     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Kasware Wallet               │
        │  Signs & broadcasts each tx   │
        │  to Kaspa Testnet-10          │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  On-Chain Verification        │
        │  Each tx verified via REST    │
        │  API → explorer link shown    │
        └───────────────────────────────┘
```

> **Technical Note:** StreamKAS uses client-side signing. The browser tab must remain open for the duration of the stream to sign and broadcast the micro-transactions.

---

## NLP Stream Creator

The NLP Stream Creator parses plain English into stream parameters using **client-side regex** — no API keys, no network calls, works offline.

**Supported commands:**
```
"stream 50 KAS to kaspatest:qz0s22... over 30 minutes"
"send 10 KAS to kaspatest:abc123 for 5 min every 10s"
"pay 100 KAS to kaspatest:qr... in 1 hour"
```

**Templates** (one-click presets that auto-fill the NLP input):
| Template | Preset Command |
|----------|---------------|
| 💰 Payroll | "stream 500 KAS to kaspatest:... over 8 hours" |
| 🔄 Subscription | "stream 10 KAS to kaspatest:... over 30 days" |
| ☕ Tip Jar | "stream 5 KAS to kaspatest:... over 5 minutes" |

---

## Kaspa Integration Details

## Kaspa Integration Details

| Integration Point | How |
|---|---|
| **Wallet** | Kasware browser extension API (`window.kasware`) |
| **Sending KAS** | `kasware.sendKaspa()` with sompi amounts |
| **Balance** | Real-time balance polling + `balanceChanged` event listener |
| **Verification** | `GET /transactions/{txId}` on `api-tn10.kaspa.org` |
| **Network Info** | `GET /info/blockdag` for block count and BPS |
| **Explorer** | Links to `explorer-tn10.kaspa.org` for every confirmed tx |
| **Price Feed** | CoinGecko API (`/simple/price?ids=kaspa&vs_currencies=usd`) |
| **Network** | Testnet-10 (`kaspatest:` address prefix) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Layer                                       │
│  Landing │ Dashboard │ Pay │ Payroll │ Analytics │
├─────────────────────────────────────────────────┤
│  AI Layer (Client-Side NLP)                     │
│  nlp.ts: Regex parser │ Templates               │
├─────────────────────────────────────────────────┤
│  Stream Layer                                   │
│  engine.ts: Micro-tx scheduler + verification   │
│  Pause/Resume/Cancel │ Background verification  │
├─────────────────────────────────────────────────┤
│  Blockchain Layer                               │
│  wallet.ts: Kasware API │ api.ts: REST API      │
│  price.ts: CoinGecko │ NetworkStatus            │
├─────────────────────────────────────────────────┤
│  State: React Context + localStorage            │
│  WalletContext │ StreamContext │ ToastContext     │
└─────────────────────────────────────────────────┘
```

---

## Roadmap

**Phase 1: Hackathon (Done)**
- [x] Stream engine & AI NLP creator
- [x] Dashboard with live stats & charts
- [x] Kasware wallet integration (Testnet-10)
- [x] Payroll & subscription templates
- [x] Real-time KAS/USD pricing

**Phase 2: Mainnet Launch (Q2 2026)**
- [ ] Mainnet deployment on Kaspa
- [ ] Mobile-responsive optimization
- [ ] User profiles & persistent history via database
- [ ] Email/Telegram notifications for received streams

**Phase 3: Ecosystem Expansion (Q3 2026)**
- [ ] **StreamKAS SDK**: Widget for any website to accept streams
- [ ] **KRC-20 Support**: Stream tokens, not just KAS
- [ ] **Smart Contract Escrow**: (When Kaspa smart contracts live)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (Custom Design System) |
| Blockchain | Kaspa Testnet-10 |
| Wallet | Kasware Wallet API |
| Kaspa API | REST API (`api-tn10.kaspa.org`) |
| Price Feed | CoinGecko API |
| NLP | Client-side regex parser (zero dependencies) |
| Animation | HTML5 Canvas + requestAnimationFrame |
| State | React Context API + localStorage |

---

## Quick Start
```bash
# Clone
git clone https://github.com/himanshu-sugha/StreamKAS.git
cd StreamKAS

# Install
npm install

# Run dev server
npm run dev
```
**No wallet?** Click **"Demo Mode"** on the dashboard for the full experience with simulated data.

---

## 🏗️ Judge's Walkthrough (Try This!)

Want to see the magic in 30 seconds? Follow this script:

1.  **Open Demo Mode**: Click "Demo Mode" on the dashboard if you don't have Kasware.
2.  **Use the AI Creator**: In the "Create Flow" box, type:
    > *"Stream 500 KAS to kaspatest:qz0s22... over 1 minute"*
3.  **Watch the Magic**:
    - Hit Enter → The stream card appears instantly.
    - Click **"▶ Start"** → Watch the progress bar establish a real-time connection.
    - See the **USD value** update live as KAS flows.
4.  **Try a Template**:
    - Click the **"💰 Payroll"** button above the input.
    - Notice how it instantly pre-fills a complex payroll command.
5.  **Check the Network**: Look at the top-right header to see the **Live BlockDAG Tip** updating in real-time.

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

## Team

Built by **Himanshu Sugha**
- **Role:** Full Stack Developer
- **Contact:** himanshusugha@gmail.com
- **Submitting for:** Kaspathon 2026 (Payments Track)

---

## License
MIT License
