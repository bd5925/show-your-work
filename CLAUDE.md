# CLAUDE.md — build guide for Show Your Work

Read `docs/SPEC.md` first. Revision 2 is the current plan: browser-based, local-first, heuristics first, LLM optional.

## Revision 9 overrides (read first)
- NUMBERS ONLY. No quoted moments, no excerpts, no inclusion proofs. `src/moments.ts` and the review queue for cards are removed from scope. Categories become rates on a radar chart (`src/charts/radar.ts`): axis = discovered category, value = rate with denominator; no axis under 20 sessions; never the word "score".
- WHOLE UNITS ONLY. Selection = a whole project or a whole date range (`src/units.ts`). Nothing inside a unit can be excluded. The token reports unit vs account ("840 sessions; included: Project X, 112 sessions, Mar–Oct 2026"). Project markers: Claude Projects (export), Claude Code (folder), Codex (repo); ChatGPT and Grok markers must be confirmed from real exports.
- Trust runs on a HARDWARE-ATTESTED PHONE APP (Revision 10): iOS (App Attest) first, Android (Play Integrity) second. The app fetches the export from the provider's domain itself (allowlisted domains, cert pinning), computes exhibits on-device with the shared TypeScript exhibit code, and sends ONLY numbers + export hash + serving domain + device attestation to the server. The server validates the attestation with Apple/Google, signs, serves the verify page. No server-side fetch of exports, ever. Reproducible builds so the attested build hash matches public code. Desktop = local mode only.
- Repo stays public. Employer-side features, if ever, go in a separate private repo.
- Page: name · signed statement · calibration slope · rung × precision · growth with milestones · category radar · failure-and-recovery rate · receipt.

## What this is
A static web app. User drops an AI-history export zip (ChatGPT, Claude, Grok) or a folder of Claude Code `.jsonl` sessions onto the page. Everything parses in the browser. Outputs: a shareable PNG card, an optional portfolio page, resume bullets.

## Stack (keep it boring)
- Vite + TypeScript, no framework unless a component tree becomes painful (then Preact).
- `fflate` or `jszip` for zip parsing in the browser.
- Canvas (or `html-to-image`) for the card PNG.
- No backend. No accounts. No analytics that send session content anywhere.
- Deploy: GitHub Pages or Vercel static.

## Layout
```
src/
  importers/      one file per source: chatgpt.ts, claude.ts, grok.ts, claudecode.ts, github.ts
  schema.ts       the one normalized shape every importer returns
  redact.ts       pattern redaction + deny list; visible [redacted: …] markers
  stats.ts        counts, hours, streaks, tools, first prompt, longest build
  categories.ts   the 30-category library + per-category heuristics
  moments.ts      candidate-moment extraction, ranked pools, veto/refill
  exhibits/       habit rates, calibration, growth, failure/recovery, delegation, breadth, trails
  llm.ts          optional Claude call with user-supplied key, same card shape
  card/           card layout + PNG render
  portfolio/      page generator + provenance footer
  ui/             drop zone, review queue, publish
docs/SPEC.md      the spec; update it when the plan changes
samples/          small, fully synthetic sample exports for tests. NEVER commit real exports.
```

## Normalized schema (every importer returns this)
```ts
type Session = { id: string; source: 'chatgpt'|'claude'|'grok'|'claudecode'|'other'; title?: string; startedAt: string; endedAt: string; turns: Turn[]; project?: string }
type Turn = { role: 'user'|'assistant'|'tool'; at: string; text: string; tool?: string; meta?: Record<string, unknown> }
```

## Exhibits and categories (Revision 5 — SPEC.md wins on conflict)
Build in this order. Each exhibit = one chart + one sentence. Five charts max on the page.
- `src/exhibits/stakes.ts`: deterministic rubric, four signals × 0–2 (consequence domain, audience, reversibility, scale) → low/medium/high; the six care behaviors per session (sources, cross-check, pushback, test/inspect, constraints up front, declined to delegate). Output rates WITH denominators. Model refines only unplaceable sessions, flagged.
- `src/exhibits/ladder.ts`: rung 1–5 per session; correction signals ("no/wrong/undo/revert", repeated attempts, failed tests, reverted edits); precision = accepted-without-correction share; rework share = error-fixing turns / all turns; efficiency = tasks per session hour.
- `src/charts/rungPrecision.ts`: x = rung, y = precision, dot per session sized by length; side panel rework + efficiency by rung. THE chart.
- `src/charts/growth.ts`: monthly rates + milestone markers (first Claude Code, first script, first scheduled task, first tool/MCP, first multi-step delegation, first sources request).
- `src/labels.ts` → `src/categories.ts` (cluster labels into candidate-named categories; `data/library.json` is fallback vocabulary) → `src/moments.ts` (ranked pools, quota 3–7, veto/refill, one moment one category). Reasoning-check labels may name the fallacy the candidate caught; never profile the candidate.
- `src/exhibits/failure.ts`: dead ends and recoveries.
- Page: name · proof line ("Generated from N real sessions, window. Candidate chose what to show; nothing shown was edited. Receipt ↓") · two inks: computed vs candidate's words · exhibits · categories · receipt footer linking the rubric. Candidate can hide an exhibit, never edit numbers.
- Private first: everything renders locally before any publish; a weak shape gets a plain note of what the strong shape looks like.

## Proof, privacy, exclusion (Revision 8 — docs/ATTESTATION-SPEC.md is the token spec; SPEC.md wins on conflict)
Two modes share one exhibit codebase (`src/exhibits/`, pure functions over the normalized schema):
- **local**: browser only, nothing uploads, no proof. Wrapped card + private self-review.
- **verified**: `verifier/` — a separate open-source service. Gets the export FROM THE PLATFORM (candidate pastes the platform's export download link and the verifier fetches it; or TLS notarization via TLSNotary/Reclaim if links need a login session — check this FIRST). Computes exhibits with the same `src/exhibits/` code, signs {counts, window, exclusions by reason and stakes band, exhibit values with denominators, per-card excerpt-attested flags, forensic report, verifier version + code hash, date}, discards the data. Stores nothing. v2 runs in an attested enclave (Nitro) and publishes the attestation.
- Token format: JWS/Ed25519 per docs/ATTESTATION-SPEC.md; pinned issuers; per-session Merkle roots over canonical message hashes; inclusion proofs for quotes; omission counts signed; portfolio vs audit mode (recruiter nonce, HKDF-drawn sample).
- Verify page (`verify/`): static, browser-side signature check against the issuer's JWKS; three blocks — verified facts, proven excerpts, narrative. Never any session content. Never merges issuers.
- Third-party issuer `verifier.showyourwork` emits the SAME token format; provider issuers replace it per provider when they publish a JWKS.
- `src/context.ts`: tag sessions personal / own-business / employer. Personal is excluded from all exhibits. Own-business and employer are the material. Candidate confirms tags; one acknowledgment of responsibility; no per-session affirmation.
- `src/exclusions.ts`: per-session, all-or-nothing, reason from a fixed list; counts by reason and stakes band go into the signed receipt.
- Claude Code sessions: `source: 'claudecode'` is unverifiable (local files). Label "unverified source"; exclude from verified exhibits; include in local mode.
- Dropped: platform share links (never expose a conversation); standalone timestamp log; any GitHub access; the proof "sentence"; the exclusion ledger as anti-cherry-pick (audit mode replaces it; exclusion counts remain as signed omissions).
- Stakes: consequence scores what could go wrong for whoever bears it (own business counts fully). Money points = 2 × (1 − e^(−amount/50000)), capped at 2.
- Efficiency: active time only (drop gaps > 15 min), per 3 active hours, suppressed under 10 active hours per rung.
- `verifier/forensics.ts`: timestamp rhythm, model-id vs public release dates, export structure by date, id formats — a filter, reported, never called proof.
- Review budget: default path completable in 15 minutes; show a running estimate.

## Rules
- Real exports never enter the repo. Tests run on `samples/` only.
- Any text shown to a third party passes through `redact.ts` first.
- No scores, ratings, or rankings anywhere in the UI. Counts are fine.
- Every card the user sees must carry the verbatim excerpt it came from.
- Keep each importer under ~200 lines and independent; export formats change.
- Commit at the end of every working session with a one-line note of what shipped.

## Order of work
1. `schema.ts`, `importers/chatgpt.ts`, `importers/claude.ts`, `importers/claudecode.ts`, `importers/grok.ts`, with synthetic samples and tests. Grok's export format is the least documented: get a real export first, inspect it, then write the importer; if there is no usable export, fall back to a paste-in importer for individual conversations.
1b. Confirm whether ChatGPT and Claude export download links are fetchable server-side without a login session. Record the answer in docs/SPEC.md. This decides the verifier route.
2. `redact.ts`, `stats.ts`, drop-zone UI that shows the stats.
2b. `app/` (React Native or Expo, iOS first): export fetch from allowlisted provider domains, on-device exhibits via shared `src/exhibits/`, App Attest / Play Integrity, send numbers-only payload. `server/`: attestation validation, signing, verify page. Reproducible build pipeline.
3. `card/` — design and PNG export. This is the growth engine; spend real time on the design.
4. `exhibits/stakes.ts` → `exhibits/ladder.ts` → `charts/rungPrecision.ts` → `charts/growth.ts`. These are the page's reason to exist.
4b. `labels.ts` → `categories.ts` → `moments.ts` → review UI (keep/rename/merge, quota, order, veto).
4c. `exhibits/failure.ts`, proof line, two-ink rendering, receipt footer.
5. `llm.ts` optional extraction, `portfolio/` generator, provenance footer, deploy.
6. Benjamin's own card and portfolio live. Then launch per `docs/SPEC.md` → Launch strategy.

## Before weekend 1
- Set `"cleanupPeriodDays": 3650` in `~/.claude/settings.json` so Claude Code stops deleting old sessions.
- Back up `~/.claude/projects/`.
- Open one real `.jsonl` session and confirm the fields the importer needs are there.
