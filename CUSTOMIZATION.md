# CUSTOMIZATION.md

**Scope**

Developer guide to extend and customize Superteam Academy: languages, gamification, theming, analytics, auth, on‑chain minting, leaderboard logic, and environment configuration.

**How to add a new language (locale)**

1. Add translation file: `app/src/languages/<xx>.json` (follow existing keys in `en.json`).
2. Update `LanguageContext` to include new locale in available list and fallback logic.
3. Add locale routes and UI toggles (if using route prefixes, update App Router middleware).
4. Ensure CMS contains translations for course/module/lesson fields.
5. Update build & CI to include locale files in static export.

**How to extend gamification system**

- Add new achievement types:
  - Create service: `app/src/services/implementations/AchievementService.*` implementing `interfaces/AchievementService`.
  - Emit events: call `AchievementService.evaluateOnLessonComplete()` after XP awarding.
- New UI components:
  - `components/achievement/Badge.tsx`, `AchievementList.tsx`.
- Storage:
  - Persist achievements in indexer DB or onchain (choose onchain only for high‑value credentials).
- Tests:
  - Add unit tests for achievement rules and integration tests for UI triggers.

**How to modify XP formula**

- Location: `app/src/domain/level.ts` (and any backend indexer or scripts).
- Steps:
  1. Update formula function (e.g., exponential thresholds or linear).
  2. Update migration script for historical recalculation (indexer) OR keep mapping deterministic and recompute on read (less intrusive).
  3. Update tests and level thresholds used by LeaderboardService.
  4. If onchain logic relies on thresholds, coordinate with `onchain-academy` maintainers and update Anchor program + migrations.

**How to theme (light/dark adjustments)**

- Tailwind tokens:
  - Modify `tailwind.config.ts` color tokens and CSS variables in global stylesheet.
- ShadCN UI components:
  - Provide theme overrides where components accept theme props.
- User preference:
  - Persist `theme` in localStorage or user profile (if logged in).
- Implementation steps:
  1. Update variables in `globals.css` and `tailwind.config.ts`.
  2. Add ThemeProvider to `RootProviders` to expose toggle and persist preference.
  3. Test colors across major components and code editor contrast.

**How to add new analytics events**

1. Define event name and schema in `app/src/lib/analytics.ts`.
2. Add wrapper call in `AnalyticsProvider` and call sites (e.g., on lesson complete: `trackEvent('lesson_completed', { lessonId, xp })`).
3. Update GA4 property with corresponding event and parameter schema.
4. Add privacy review and ensure no PII is sent—hash wallet pubkeys if attached.
5. Add automated tests (unit test that `trackEvent` called with correct schema).

**How to add a new OAuth provider**

- Steps for NextAuth:
  1. Add provider config in `pages/api/auth/[...nextauth].ts` or equivalent NextAuth configuration file.
     - Example: `Providers.GitHub({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET })`
  2. Add env vars: `GITHUB_ID`, `GITHUB_SECRET`.
  3. Update `AccountLinkService` to accept the provider id and store link mapping.
  4. Update UI in settings to enable linking/unlinking the new provider.
  5. Test edge cases for linking when wallet already linked.

**How to connect real on‑chain minting**

- Preconditions:
  - Ensure `XP_MINT_ADDRESS` set and Token‑2022 mint configured.
  - Backend signer key (`BACKEND_SIGNER_KEY`) stored securely (KMS / Vault).
- Steps:
  1. Review Anchor program PDAs and instruction `mint_xp` in `onchain-academy`.
  2. For server‑signed minting:
     - Backend forms Anchor transaction calling `mint_xp` CPI; sign with `BACKEND_SIGNER_KEY`.
     - Enforce idempotency (store event id in DB to avoid double mint).
  3. For wallet‑initiated minting:
     - Provide client‑side instruction builder and require user's payer signature.
  4. Security:
     - Validate all accounts in program code; use canonical bumps.
     - Rotate backend signer periodically; update `Config` PDA in program via `update_config`.
  5. Tests:
     - Add integration tests in `onchain-academy/tests` and run `anchor test`.
  6. Deployment:
     - Follow Mandatory Workflow: `anchor build`, `cargo fmt`, `cargo clippy`, `cargo test`, `anchor deploy` to devnet first.

**How to adjust leaderboard logic**

- Where: `app/src/services/LeaderboardService` and indexer logic.
- Options:
  - Sort by total XP (default).
  - Add tie-breakers: last_activity_timestamp, XP gained in window (recency).
  - Regional leaderboards: add `location` attribute from profile and filter by region.
- Scaling:
  - Precompute top‑N per region and cache in Redis or edge layer.
  - Use cursor‑based pagination for large leaderboards.
- Steps to change:
  1. Update aggregation logic in indexer.
  2. Update service API and frontend query params.
  3. Run load tests on large sample.

**Environment configuration guide (.env example)**

- Required (example keys):
  - NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.example.com
  - NEXT_PUBLIC_HELIUS_API_KEY=helius_key
  - NEXTAUTH_URL=https://academy.example.com
  - NEXTAUTH_SECRET=supersecret
  - GOOGLE_CLIENT_ID=
  - GOOGLE_CLIENT_SECRET=
  - SENTRY_DSN=
  - GA4_MEASUREMENT_ID=
  - CLARITY_PROJECT_ID=
  - XP_MINT_ADDRESS=MintPubkeyHere
  - BACKEND_SIGNER_KEY=secure:base64-or-vault-ref
  - CMS_API_URL=https://cms.example.com
  - CMS_API_KEY=...
  - ENABLE_ONCHAIN_DIRECT_AWARD=true|false
- Security:
  - Do not check `BACKEND_SIGNER_KEY` into repo. Use platform secret store.
  - Use role-based access for CI to publish releases and upload source maps.

**Production deployment notes**

- Build steps:
  - `npm ci` then `npm run build` in `app/`.
  - Upload source maps to Sentry during CI with SENTRY_RELEASE tag.
- Onchain deployment:
  - Use `wallets/program-keypair.json` only in secure CI with limited access.
  - Deploy Anchor program to devnet first; run integration tests; then promote to mainnet after explicit approvals.
- Monitoring & observability:
  - Monitor RPC saturation; use Helius or dedicated RPC pool.
  - Alert on failed CPI batches or repeated `mint_xp` failures.
- Key rotation:
  - Rotate `BACKEND_SIGNER_KEY` regularly and apply `update_config` onchain.
- Rollback strategy:
  - For content errors, revert CMS publish (keep previous version).
  - For onchain logic bugs, prepare migration scripts and coordinate with governance (multisig) where relevant.

**Developer checklist before production changes**

- Update unit & integration tests.
- Run `anchor build` and `cargo fmt` for any onchain changes.
- Validate changes in staging/devnet.
- Upload release artifacts / source maps to Sentry.
- Ensure event schemas updated and analytics owner notified.
- Document changes in `docs/` and update `ARCHITECTURE.md` if necessary.
