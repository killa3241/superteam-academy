# ARCHITECTURE.md

**System Overview**

- Purpose: Superteam Academy is an on‑chain developer reputation layer combining a Next.js frontend with Solana on‑chain components for XP (Token‑2022) and soulbound credentials (Metaplex Core).
- Key flows:
  - Learner completes lessons → frontend records completion → XP awarded (Token‑2022) → leaderboard updated.
  - Creators publish course content via CMS → frontend renders courses/modules/lessons.
  - Wallet = primary identity; Google (NextAuth) = linked identity for account recovery / UX.

Text-based system diagram (ASCII)
- Browser (React / App Router)
  ├─ Wallet Adapter (Phantom / Slope / Solflare)
  ├─ NextAuth (Google) — linked via AccountLinkService
  ├─ Context Providers (Auth, XpAnimation, Language, Query)
  ├─ Services (CourseContentService, LearningProgressService, LeaderboardService, CertificateService)
  └─ Network → Next.js API routes / RPC → Onchain Program (Anchor) + Offchain Indexer / Helius
- Backend / Indexer
  ├─ Next.js API (server actions / edge functions)
  ├─ Worker scripts (scripts/*.ts) for batch tasks (minting, finalize)
  └─ Indexer (Helius / DAS or custom) → Leaderboard DB / Cache
- Onchain (Anchor program: onchain-academy)
  ├─ PDAs: Config, Course, Enrollment/Progress, XP Mint ATA, Credential escrow
  └─ Instructions: finalize_course, issue_credential, mint_xp (utility)

**Frontend architecture (App Router structure)**

- app/
  - layout.tsx — global layout, RootProviders
  - page.tsx — landing / redirect logic
  - api/** — server actions (auth hooks, webhook endpoints)
  - certificates/[id]/page.tsx — credential viewer
  - courses/
    - page.tsx — catalog
    - [id]/page.tsx — course detail
  - dashboard/page.tsx — learner dashboard
  - leaderboard/page.tsx — leaderboard view
  - profile/[username]/page.tsx — public profile
  - settings/page.tsx — account settings
  - components/ — UI atoms and domain components (see Component hierarchy)
  - src/providers/QueryProvider.tsx — SWR/React Query provider

Notes:
- Routes follow App Router conventions; server components used where possible for SEO; client components for wallet interactions and code editor challenge UIs.

**Component hierarchy (selected, developer view)**

- Root
  - RootProviders
    - SolanaProviders (WalletProvider, ConnectionProvider)
    - QueryProvider
    - AnalyticsProvider
  - Layout
    - Header (WalletConnection, Nav)
    - Main
      - CourseCatalog
      - CourseDetail
        - CourseHeader
        - ModuleList
          - LessonListItem
            - LessonPlayer (content or challenge)
              - CodeEditor (for challenge)
              - ChallengeRunner (test harness)
      - Dashboard
      - Leaderboard
      - Profile (UserProfile)
    - Footer

**Context providers (what they hold and why)**

- Auth / Wallet (SolanaProviders + NextAuth link)
  - Exposes: wallet publicKey, signer, isConnected.
  - Responsibility: primary identity; triggers UI for linking Google identity via AccountLinkService when requested.
- QueryProvider
  - Exposes: React Query or SWR client for caching, retries, and invalidation.
- LanguageContext
  - Exposes: locale, t() translation helper; provider loads languages/*.json and supports fallback to EN.
- XpAnimationContext
  - Exposes: enqueueXpAnimation(), used by Lesson completion UI to show XP earned visually.
- AnalyticsProvider
  - Exposes: trackEvent() wrapper for GA4 & Clarity; centralizes event schema and sampling rules.

**Service layer abstraction**

- Location: `app/src/services/` with `implementations/` and `interfaces/`.
- Pattern:
  - Interface definitions declare methods (e.g., `CourseContentService.getCourse(slug)`).
  - Default implementations call external sources: CMS (REST/GraphQL), local fixtures, or onchain indexer.
  - Benefits: easy swap of CMS or indexer, test doubles in tests.
- Important services:
  - CourseContentService — fetch and parse Markdown lessons, media URLs, frontmatter.
  - LearningProgressService — submit lesson completion, checkpoint saves.
  - AchievementService & CertificateService — compute achievements and drive credential issuance.
  - LeaderboardService — aggregate XP and rank users (reads from indexer / caching layer).
  - AccountLinkService — link/unlink Google identity to wallet.

**Identity flow (Wallet + Google)**

- Primary identity: Solana wallet (user signs transactions, holds XP Token‑2022 ATA, receives credentials).
- Linked identity: Google via NextAuth for convenience and recovery.
Flow:
  1. User connects wallet via Wallet Adapter (client).
  2. User optionally logs in with Google (NextAuth); server issues NextAuth session cookie.
  3. `AccountLinkService.link(googleId, walletPubkey)` stores association off‑chain (in backend DB or signed onchain registration depending on config).
  4. On sign-in, if wallet missing but Google session exists, front end guides user to re-link or recover access.
  5. Sensitive onchain actions always require wallet signature (no implicit minting from Google session).

**XP & Level computation flow**

- XP storage:
  - XP is represented by a Token‑2022 mint (non‑transferable) with a permanent delegate pattern.
  - Each learner’s XP balance resides in their Token ATA.
- Awarding XP:
  - On lesson completion, frontend calls `LearningProgressService.completeLesson()`.
  - Service either:
    - Option A: emits an event to backend which performs an onchain CPI (`mint_xp`) using backend_signer (rotatable), or
    - Option B: instructs the wallet to submit a transaction (when UX requires onchain signer).
  - Scripts: `scripts/complete-lesson.ts`, `finalize-course.ts` show implemented flows for batching or manual finalize.
- Level computation:
  - `app/src/domain/level.ts` contains level thresholds. Level is computed client‑side as a deterministic mapping from total XP → level.
  - Ensure any change to XP formula updates this module and backend indexers for consistent leaderboards.

**On‑chain integration points**

- Program: `onchain-academy` (Anchor)
  - PDAs: Config (stores backend_signer, mint addresses), Course/Enrollment PDAs, Credential PDA.
  - Key instructions (implemented / partially implemented):
    - `initialize` — setup config and mints
    - `finalize_course` — finalize an enrollment once onchain conditions met
    - `issue_credential` — mint/authorize credential NFT (Metaplex Core CPI)
    - `mint_xp` (utils) — mints Token‑2022 XP to learner ATA (check Token‑2022 flags)
  - Security: all PDAs validated; CPIs verify program IDs and re-check bumps.
- Offchain:
  - Indexer (Helius / custom) listens for token mints and credential events to populate leaderboard and public profiles.
  - Scripts in `scripts/` are used for administrative flows and test harnesses.

**Analytics flow (GA4 event pipeline)**

- Frontend: `analytics.ts` centralizes tracking calls. Event types: `lesson_completed`, `xp_awarded`, `credential_issued`, `course_published`, `signin_linked`.
- Flow:
  1. UI calls `trackEvent(name, payload)` (AnalyticsProvider) for important user actions.
  2. Events sent to GA4 via gtag / measurement protocol.
  3. Clarity: visual heatmaps and session recordings are enabled for specified routes; events tagged with page context.
  4. Server side: selective events forwarded to internal pipelines for aggregation (optional).
- Governance: event contract (names + schema) must be updated in `analytics.ts` and registered with analytics owner.

**Error monitoring pipeline (Sentry)**

- Frontend Sentry:
  - DSN configured via `SENTRY_DSN`.
  - Releases: upload source maps at build (Vercel or CI) and tag releases (SENTRY_RELEASE).
  - Breadcrumbs capture wallet interactions, network errors, and challenge runner logs.
- Server Sentry:
  - API routes capture exceptions, with environment and request metadata.
- Operational practice:
  - Use environment tags: `env`, `region`, `node`, `wallet_provider`.
  - Attach user context where available (wallet pubkey hashed, NextAuth id).
  - Use sampling for verbose logs (privacy-preserving).

**Data flow: lesson completion → XP update → leaderboard**

1. Learner finishes lesson UI (Challenge or Content).
2. Frontend verifies challenge success (runs tests in ChallengeRunner) and calls `LearningProgressService.completeLesson(lessonId)`.
3. LearningProgressService:
   - Persists progress to CMS / backend (optimistic local update).
   - Triggers XP award:
     - If onchain immediate award: wallet signs transaction calling Anchor instruction to mint XP (requires payer).
     - If batched: record event in backend queue; backend signs CPI to `mint_xp` (rotatable backend_signer).
4. Onchain: `mint_xp` increases Token‑2022 balance; event emitted.
5. Indexer picks up token mint event and updates aggregated XP store (leaderboard DB / cache).
6. Frontend LeaderboardService queries indexer/DB to display ranks; UI invalidates caches on XP events.

**Environment variables (select, required/optional)**

- NEXT_PUBLIC_SOLANA_RPC_URL — public RPC endpoint (Helius or provider)
- NEXT_PUBLIC_HELIUS_API_KEY — for indexing / credential queries (if used)
- NEXTAUTH_URL — base URL for NextAuth
- NEXTAUTH_SECRET — NextAuth secret
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — NextAuth Google provider
- SENTRY_DSN, SENTRY_RELEASE — Sentry config
- GA4_MEASUREMENT_ID — GA4 ID
- CLARITY_PROJECT_ID — Microsoft Clarity ID
- XP_MINT_ADDRESS — Token‑2022 mint address (onchain-academy config)
- BACKEND_SIGNER_KEY — backend signer key (secure storage; rotate regularly)
- ANCHOR_WALLET / ANCHOR_PROVIDER_URL — for development/deploy workflows
- NODE_ENV, VERCEL or platform specific vars
- CMS_API_URL / CMS_API_KEY — CMS endpoints
- Optional (feature flags): ENABLE_ONCHAIN_DIRECT_AWARD, BATCH_XP_WINDOW

**Scalability considerations**

- Rate limiting & batching:
  - Use backend batching for high‑frequency XP awards (reduce compute units).
  - Group low‑value XP awards into periodic CPI batches.
- Read scaling:
  - Leaderboard reads should query precomputed aggregates (cache in Redis or edge cache).
  - Use paginated endpoints; avoid on‑the‑fly full scans.
- CU budgets:
  - Optimize Anchor instruction size and accounts to reduce per‑tx cost.
  - Avoid repeated PDA recalculation on hot paths; store canonical bumps.
- Indexing:
  - Use Helius/DAS for event indexing and robust webhook fan‑out.
  - Maintain eventual consistency between onchain state and leaderboard; surface stale status in UI when necessary.
- Observability:
  - Instrument trace spans across frontend → API → onchain to identify latency hotspots.

References / Important files:
- Program: `onchain-academy/programs/onchain-academy/src/`
- Scripts: `scripts/complete-lesson.ts`, `scripts/finalize-course.ts`
- Services: `app/src/services/`
- Contexts: `app/src/context/` and `app/src/providers/`
