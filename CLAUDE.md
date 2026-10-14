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
  moments.ts      heuristic judgment-moment detection (7 kinds, see SPEC)
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

## Judgment-moment kinds (fixed vocabulary)
`caught_error | redirected | set_constraints | decomposed | verified | declined_ai | shipped`

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
4. `moments.ts` heuristics, review queue UI.
5. `llm.ts` optional extraction, `portfolio/` generator, provenance footer, deploy.
6. Benjamin's own card and portfolio live. Then launch per `docs/SPEC.md` → Launch strategy.

## Before weekend 1
- Set `"cleanupPeriodDays": 3650` in `~/.claude/settings.json` so Claude Code stops deleting old sessions.
- Back up `~/.claude/projects/`.
- Open one real `.jsonl` session and confirm the fields the importer needs are there.
