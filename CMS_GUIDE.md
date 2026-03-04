# CMS_GUIDE.md

**Purpose**

Guide for content authors and integrators: how to model courses/modules/lessons in the CMS used by Superteam Academy, and how the frontend consumes that content.

**CMS supported entities (conceptual)**

- Course
  - Holds metadata and ordered modules.
- Module
  - Grouping of lessons within a course.
- Lesson
  - Two types: `content` (read/watch) or `challenge` (interactive coding challenge).
- CMS features assumed:
  - Markdown editor with code blocks
  - Media uploads (images, video URL support)
  - Draft / publish workflow
  - Localized fields (EN / PT-BR / ES)
  - Metadata fields (difficulty, duration, XP, track)

**Content schema (canonical)**

Course (required fields)
- id / slug: unique identifier (string)
- title: localized object { en, pt, es }
- description: localized short summary
- difficulty: enum (beginner|intermediate|advanced)
- track: tag (e.g., "onchain", "web", "rust")
- coverImage: media URL
- modules: ordered array of Module references
- xp_total: integer (computed or author-specified)
- published: boolean
- metadata: optional tags, duration_estimate

Module (required fields)
- id / slug
- title: localized
- description: localized
- lessons: ordered array of Lesson references
- published: boolean

Lesson (required fields)
- id / slug
- title: localized
- type: enum (content | challenge)
- content: markdown (for `content`), supports frontmatter and code blocks
- challenge_config: object (required only if type == challenge)
- difficulty: enum
- duration_minutes: integer
- xp_award: integer
- draft: boolean
- author_notes: optional (not rendered publicly)
- locale_overrides: optional localized content blocks

Lesson — challenge_config (fields)
- language: e.g., "typescript", "rust", "python"
- entryFile: "index.ts"
- testHarness: string or reference to a test file / pattern
- timeLimitMs: integer
- memoryLimitMb: integer (optional)
- sampleSolution: optional (not revealed on first attempt)
- grader: "inline" | "server" (if server, CMS must provide test cases)
- revealHintAfterAttempts: integer
- sandboxed: boolean (indicates using client or server runner)

**How lesson types differ**

- Content
  - Primary field: `content` (Markdown).
  - Renders via `LessonPlayer` with Markdown parser; code blocks are displayed read‑only or with runnable snippets.
- Challenge
  - Has `challenge_config`; frontend renders a `CodeEditor` + `ChallengeRunner`.
  - `ChallengeRunner` imports `testHarness` and runs tests client‑side (browser sandbox) or via server/worker depending on `grader` setting.
  - Challenge content must include example input/output and clear acceptance criteria.

**Publishing workflow**

- Author creates Course → adds Modules → adds Lessons.
- Work in Drafts: editors should save often; `draft` flag set.
- Preview: CMS preview endpoint should render same layout as frontend preview route.
- Review: team/peer review metadata and XP assignment.
- Publish: set `published: true` on Course and all Modules/Lessons; CI will invalidate caches and trigger webhook.
- Webhook: CMS publishes should call frontend's revalidation API to update cached pages and notify the indexer if needed.

**How frontend consumes CMS content**

- Service layer: `CourseContentService` abstracts fetch/parsing.
- Expected CMS responses:
  - Course JSON with modules and lesson references.
  - Lessons returned with frontmatter (metadata) and markdown body.
- Rendering:
  - Content lessons: parsed markdown → React components (code blocks, images).
  - Challenge lessons: deliver `challenge_config` to client to initialize CodeEditor and tests.
- Caching:
  - Use edge cache / ISR for published content.
  - For drafts or preview, use authenticated preview route using `NEXTAUTH` session or preview tokens.

**Required fields checklist (for QA)**

- Course: slug, title (all locales), at least one module, published flag as needed.
- Module: title, at least one lesson.
- Lesson (content): markdown body present, xp_award set.
- Lesson (challenge): valid `challenge_config`, test harness present, xp_award set.

**Best practices for content creators**

- Keep lessons short (5–15 minutes estimate) for frequent XP granularity.
- Use canonical slugs; avoid renaming published slugs.
- Set `xp_award` to reflect difficulty and expected minutes.
- Provide localized titles/descriptions and translate primary learning objectives first.
- Include alt text for images and transcripts for videos.
- For challenges: include sample inputs, clear acceptance criteria, and limit external network calls.
- Version control: export course content periodically for backups.

**How to add a new course (step by step)**

1. Create Course entry in CMS with slug and localized title.
2. Add Modules under Course; order them.
3. For each Module, add Lessons:
   - For content: paste Markdown, include images/media, set duration, xp_award.
   - For challenges: fill `challenge_config`, upload test harness; validate tests locally using challenge runner.
4. Set Course and Module `published: false` until all lessons are ready.
5. Preview the Course via CMS preview route; validate UI rendering.
6. Request peer review; fix any feedback.
7. Publish: set `published: true` and trigger CMS webhook to revalidate frontend caches.

**Localization considerations**

- Localize these fields: title, description, lesson body, UI labels in lesson content.
- Fallback: if locale content missing, frontend falls back to English.
- For challenges: ensure `testHarness` is language-agnostic or localized when prompts include natural language.
- Keep structure identical across locales to prevent mismatches.

**Future extensibility**

- New lesson types (video lab, interactive sandbox) — extend `type` & schema, add frontend runners.
- Structured metadata for assessment (rubrics).
- CMS plugin: automated XP suggestion based on duration/difficulty trends.
- Content versioning: allow rollbacks and staged releases.
