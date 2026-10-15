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

## Categories (Revision 3 — see SPEC.md)
A library of 30 categories in four families (judgment, expertise, working_style, character), defined once in `src/categories.ts` as `{ id, family, label, description, heuristic?: (turns) => Candidate[] }`. The candidate picks ≤7, orders them, sets a quota of 3–7 each. Extraction builds a ranked pool per category; vetoes pull the next-ranked moment. One moment, one category. Ship heuristics for the first ten (judgment family) before any model-based classification.

## Exhibits (computed from the whole history, never from selected moments)
`src/exhibits/`: habit rates (with denominators), calibration by stakes, growth curve by quarter, failure-and-recovery, where-the-model-caught-me, delegation map, domain breadth, build trails. Candidate can hide an exhibit, never edit its numbers. No exhibit renders as a single number or grade.

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
4. `categories.ts` (first ten heuristics), `moments.ts` pools + veto/refill, review queue UI with pick/quota/order.
4b. `exhibits/` — habit rates and calibration first; they are the page's reason to exist.
5. `llm.ts` optional extraction, `portfolio/` generator, provenance footer, deploy.
6. Benjamin's own card and portfolio live. Then launch per `docs/SPEC.md` → Launch strategy.

## Before weekend 1
- Set `"cleanupPeriodDays": 3650` in `~/.claude/settings.json` so Claude Code stops deleting old sessions.
- Back up `~/.claude/projects/`.
- Open one real `.jsonl` session and confirm the fields the importer needs are there.
