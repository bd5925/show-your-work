# CLAUDE.md — build guide for Show Your Work

Read `docs/SPEC.md` first. Revision 2 is the current plan: browser-based, local-first, heuristics first, LLM optional.

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

## Categories and exhibits (Revision 4 — see SPEC.md)
- `src/labels.ts`: label every user turn with a short free-text description of what the person did (heuristic first; model with user key when available).
- `src/categories.ts`: cluster labels into candidate-named categories; the candidate keeps/renames/merges. `data/library.json` holds the 30-item fallback vocabulary — data, not the first build.
- `src/moments.ts`: ranked pool per category, quota 3–7, veto pulls the next-ranked moment. One moment, one category.
- `src/exhibits/stakes.ts`: classify sessions low/medium/high (money, legal, third-party, deployable code, tax/medical → high) and measure care behaviors per level. Output: rates with denominators. This is the calibration slope and it ships FIRST.
- `src/exhibits/ladder.ts`: detect the delegation rung (1 ask → 5 builds-things-that-run) per session; highest rung, when, share of time.
- `src/exhibits/growth.ts`: the stakes and ladder metrics plus constraints/verification/pushback by month; first-use date per tool.
- `src/exhibits/failure.ts`: dead ends and recoveries as a moment category.
- Candidate can hide any exhibit; numbers are never editable. Footer states exhibits shown and the window.

## Rules
- Real exports never enter the repo. Tests run on `samples/` only.
- Any text shown to a third party passes through `redact.ts` first.
- No scores, ratings, or rankings anywhere in the UI. Counts are fine.
- Every card the user sees must carry the verbatim excerpt it came from.
- Keep each importer under ~200 lines and independent; export formats change.
- Commit at the end of every working session with a one-line note of what shipped.

## Order of work
1. `schema.ts`, `importers/chatgpt.ts`, `importers/claude.ts`, `importers/claudecode.ts`, `importers/grok.ts`, with synthetic samples and tests. Grok's export format is the least documented: get a real export first, inspect it, then write the importer; if there is no usable export, fall back to a paste-in importer for individual conversations.
2. `redact.ts`, `stats.ts`, drop-zone UI that shows the stats.
3. `card/` — design and PNG export. This is the growth engine; spend real time on the design.
4. `exhibits/stakes.ts` and `exhibits/ladder.ts` — calibration slope and delegation ladder. These are the page's reason to exist; build them before any category work.
4b. `labels.ts` → `categories.ts` clustering → `moments.ts` pools with veto/refill → review UI (keep/rename/merge, quota, order).
4c. `exhibits/growth.ts`, `exhibits/failure.ts`.
5. `llm.ts` optional extraction, `portfolio/` generator, provenance footer, deploy.
6. Benjamin's own card and portfolio live. Then launch per `docs/SPEC.md` → Launch strategy.

## Before weekend 1
- Set `"cleanupPeriodDays": 3650` in `~/.claude/settings.json` so Claude Code stops deleting old sessions.
- Back up `~/.claude/projects/`.
- Open one real `.jsonl` session and confirm the fields the importer needs are there.
