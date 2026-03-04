# Superteam Academy

**Superteam Academy is an on-chain developer reputation layer built on Solana.** Superteam Academy is an on-chain developer reputation layer built on Solana. Learning progress is encoded as non-transferable Token-2022 XP balances, levels are deterministically derived, and course completion is represented through soulbound Metaplex Core NFTs. Rather than storing reputation in an application database, Superteam Academy treats skill progression as verifiable on-chain state.

---

## Vision

Developer reputation should be verifiable on-chain and owned by builders. Superteam Academy explores how XP becomes a native on-chain primitive, levels are computed transparently, and credentials are immutable. Wallets can display earned credentials; protocols can verify expertise directly from the blockchain.

---

## Why This Matters

**Ownership**: XP is non-transferable and soulbound. Once earned, it becomes part of your permanent on-chain identity.

**Portability**: Credentials live on Solana. Any wallet-aware tool can query your XP and level without API dependencies.

**Transparency**: Reputation computation is deterministic and auditable on-chain.

**Potential for Composability**: Third-party tools and protocols could eventually build on top of this reputation layer.

---

## Architecture Overview

Superteam Academy is structured as a modular system:

- **Anchor Program**: On-chain logic for XP minting and level computation.
- **Token-2022 XP Mint**: Non-transferable tokens with PermanentDelegate extension. Represents earned XP.
- **Metaplex Core NFTs**: Soulbound credential certificates with PermanentFreezeDelegate for immutability.
- **Helius DAS Indexing**: Aggregates XP balances for leaderboard display.
- **Squads Multisig**: Multi-signature authority for program upgrades and administrative actions.
- **Next.js 14 Frontend**: React-based dashboard for course browsing, lesson interaction, and leaderboard viewing.

---

## Identity Model

Superteam Academy implements a hybrid identity architecture:

- **Primary Identity (Wallet-Based)**: All XP balances, levels, and credentials are derived from and bound to a Solana wallet address. The wallet is the canonical identity primitive.
- **Linked Identity (Google OAuth)**: Users may optionally link a Google account via NextAuth. This does not replace wallet identity. Instead, it acts as a federated identity layer for onboarding, account recovery possibilities, and future integrations (e.g., GitHub, email notifications).

Primary Identity: Wallet  
Optional Linked Identity: Google OAuth

---

## XP System

XP is the core reputation primitive—a non-transferable token earned through lesson completion.

**Token Properties:**
- Standard: Token-2022 with NonTransferable and PermanentDelegate extensions.
- Minting: Designed to trigger on lesson completion; current implementation includes clean abstractions for wiring.
- Immutability: Once minted, XP cannot be transferred or sold.

**Level Computation:**
```
level = floor(sqrt(xp / 100))

XP: 0    → Level: 0
XP: 100  → Level: 1
XP: 400  → Level: 2
XP: 900  → Level: 3
XP: 1600 → Level: 4
```

Levels scale sub-linearly to encourage long-term progression.

---

## Credentials System

Soulbound credential NFTs (Metaplex Core) represent course completion or achievement milestones.

**Properties:**
- **Immutability**: PermanentFreezeDelegate prevents transfer or burning by the holder.
- **Metadata**: On-chain includes course ID, completion timestamp, and issuer authority.
- **Current State**: Credential issuance flows are architected with clean abstractions; full on-chain wiring is part of the development roadmap.

**Use Cases:**
- Wallets can display earned credentials.
- Public profiles showcase completed courses.
- Foundation for future protocol-level access control.

---

## Leaderboard System

The leaderboard aggregates XP data for ranking and visibility.

**Architecture:**
- **Data Source**: Helius DAS API queries XP token balances.
- **Computation**: Levels are calculated from XP; results are cached and displayed.
- **Sorting**: Ranked by total XP descending.

**API Surface:**
```
GET /api/leaderboard?limit=100&offset=0
GET /api/profile/:wallet
GET /api/xp-stats/:wallet
```

---

## Frontend System

The Next.js 14 frontend is the primary interface for learners and course browsing.

**Core Screens:**
- **Onboarding**: Wallet connection via Web3 modal.
- **Dashboard**: Personal XP balance, current level, earned credentials, and profile overview.
- **Courses**: Browse available courses and view lesson progression.
- **Lesson Flow**: Content delivery and transaction signing for XP minting.
- **Profile**: Wallet-based profile displaying XP, level, credentials, and leaderboard rank.
- **Leaderboard**: Global rankings sorted by XP.

**Implementation Notes:**
- Streaks are frontend-only and not persisted on-chain.
- Some flows use clean service abstractions that are designed for future on-chain integration.

**Stack:**
- Framework: Next.js 14 with App Router.
- Styling: Tailwind CSS.
- State: TanStack React Query.
- Wallets: Solana Wallet Adapter.
- RPC: Helius for indexing; Devnet RPC for transactions.

---

## Observability & Monitoring

Superteam Academy includes:

**Google Analytics 4**  (custom product events)

**Microsoft Clarity** (session replay & heatmaps)

**Sentry** (client and server error monitoring)

See ARCHITECTURE.md for implementation details.

## Monorepo Structure
```
superteam-academy/
├── onchain-academy/          ← Anchor program (Rust)
│   ├── programs/academy/
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── instructions/
│   │   │   └── state/
│   │   └── Cargo.toml
│   ├── tests/
│   ├── Anchor.toml
│   └── Cargo.toml
├── app/                       ← Next.js 14 frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json
│   └── tsconfig.json
├── sdk/                       ← TypeScript SDK (future)
│   ├── src/
│   │   ├── idl/
│   │   ├── instructions/
│   │   └── utils/
│   └── package.json
├── docs/                      ← Specifications & architecture
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── INTEGRATION.md
│   └── DEPLOY-PROGRAM.md
├── wallets/                   ← Keypairs (gitignored)
├── package.json
└── yarn.lock
```

---

## Devnet Deployment

| Component | Address | Link |
|-----------|---------|------|
| **Program** | `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf` | [Explorer](https://explorer.solana.com/address/ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf?cluster=devnet) |
| **XP Mint (Token-2022)** | `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3` | [Explorer](https://explorer.solana.com/address/xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3?cluster=devnet) |
| **Authority Multisig** | `ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn` | [Explorer](https://explorer.solana.com/address/ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn?cluster=devnet) |

---

## Local Development

### Prerequisites

- Rust 1.70+
- Node.js 18+
- Solana CLI 1.18+
- Anchor 0.31+
- Yarn

### On-Chain Development
```bash
cd onchain-academy
yarn install
anchor build
anchor test
```

Run Rust unit tests:
```bash
cargo test --manifest-path tests/rust/Cargo.toml
```

### Frontend Development
```bash
cd app
npm install
```

Create `app/.env.local`:
```
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf
NEXT_PUBLIC_XP_MINT=xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3
NEXT_PUBLIC_HELIUS_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Flow

1. **Connect Wallet**: User connects Devnet wallet via Web3 modal.
2. **Browse Courses**: View available courses and lessons.
3. **Complete Lesson**: Submit quiz or proof-of-work.
4. **Sign Transaction**: User approves XP mint transaction in wallet.
5. **XP Minted**: On-chain transaction confirms; balance updates.
6. **Level Recalculated**: Frontend computes new level: `floor(sqrt(xp / 100))`.
7. **Credential Issued**: Upon course completion, credential issuance logic is triggered (on-chain wiring in progress).
8. **Profile Updates**: Public profile reflects updated XP, level, and credentials.
9. **Leaderboard**: User appears on global rankings.

---

## Current Implementation Status

**Fully Implemented:**
- Token-2022 XP mint architecture implemented with deterministic frontend level computation; full lesson-to-mint automation structured and partially wired.
- Token-2022 non-transferable XP tokens.
- Metaplex Core soulbound credential NFTs.
- Helius-based leaderboard aggregation.
- Frontend dashboard and course browsing.
- Wallet-based authentication and profile display.
- Dual identity system (Wallet primary, Google linked).
- GA4 custom product analytics.
- Sentry production error monitoring.
- Clarity heatmap tracking.
- App Router production hardening.

**In Development / Architected:**
- Full end-to-end wiring of lesson completion to on-chain XP minting.
- Complete credential issuance automation.
- Advanced governance and revocation policies.
- Streaks tracking (currently frontend-only).

**Not Currently Implemented:**
- Admin panel for course management (abstracted for future implementation).
- Multi-chain support.
- Staking or yield mechanisms.
- Production-grade treasury management.
- Advanced DAO integrations.

---

## Documentation

- **[SPEC.md](./docs/SPEC.md)** — Program specification and instruction definitions.
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design and data flow.
- **[INTEGRATION.md](./docs/INTEGRATION.md)** — Integration guidance for future use cases.
- **[DEPLOY-PROGRAM.md](./docs/DEPLOY-PROGRAM.md)** — Deployment reference.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contracts** | Anchor 0.31+, Rust |
| **Token Standard** | Token-2022 (NonTransferable, PermanentDelegate) |
| **NFT Standard** | Metaplex Core (PermanentFreezeDelegate) |
| **Governance** | Squads Protocol Multisig |
| **Indexing** | Helius DAS API |
| **Frontend** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS |
| **State Management** | TanStack React Query |
| **RPC** | Helius, Solana Web3.js |
| **Package Manager** | Yarn (monorepo) |
| **Authentication** | Solana Wallet Adapter, NextAuth (Google OAuth) |
| **Analytics** | Google Analytics 4 |
| **Monitoring** | Sentry |
| **UX Observability** | Microsoft Clarity |
| **i18n** | Context-based EN/PT/ES |
| **UI System** | ShadCN UI |

---

## License

MIT