# Superteam Academy

Superteam Academy is a decentralized learning platform built on Solana.

Learners enroll in courses, complete lessons to earn soulbound XP (Token-2022), level up on-chain, receive Metaplex Core credential NFTs, and appear on a leaderboard. Platform authority is governed via multisig.

---

## Monorepo Structure

```
superteam-academy/
├── onchain-academy/   ← Anchor program
├── app/               ← Next.js 14 frontend
├── sdk/               ← TypeScript SDK (future)
├── docs/              ← Specs & architecture
└── wallets/           ← Keypairs (gitignored)
```

---

## Devnet Deployment

| Component | Address |
|------------|----------|
| Program | [`ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf`](https://explorer.solana.com/address/ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf?cluster=devnet) |
| XP Mint (Token-2022) | [`xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3`](https://explorer.solana.com/address/xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3?cluster=devnet) |
| Authority | [`ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn`](https://explorer.solana.com/address/ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn?cluster=devnet) |

---

## On-Chain (Anchor)

```bash
cd onchain-academy
yarn install
anchor build
anchor test
```

Rust unit tests:

```bash
cargo test --manifest-path tests/rust/Cargo.toml
```

---

## Frontend (Next.js 14)

Install dependencies:

```bash
cd app
npm install
```

Create `app/.env.local`:

```
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_XP_MINT=xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3
```

Run:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Architecture Overview

**XP System**
- Token-2022
- NonTransferable + PermanentDelegate
- Minted on lesson completion
- Level formula:

```
level = floor(sqrt(xp / 100))
```

**Credentials**
- Metaplex Core NFTs
- PermanentFreezeDelegate (soulbound)

**Leaderboard**
- Off-chain indexed XP (Helius DAS)
- RPC-efficient service abstraction

---

## Tech Stack

- Anchor 0.31+, Rust
- Token-2022
- Metaplex Core
- Next.js 14, React, Tailwind
- TanStack React Query
- Helius RPC
- Squads multisig

---

## Demo Flow

1. Connect wallet (Devnet)
2. Complete lesson
3. Sign transaction
4. XP minted on-chain
5. Level updates
6. Credential NFT minted
7. Leaderboard updates

---

## Documentation

- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/INTEGRATION.md`
- `docs/DEPLOY-PROGRAM.md`

---

## License

MIT