# Show Your Work

**Turn your real AI history into proof of how you work with AI.**

Drop your ChatGPT, Claude, or Claude Code export onto a page. Get a shareable card of your AI habits and, if you want it, a portfolio of *judgment moments* a hiring manager can read in 90 seconds. Everything runs in your browser. Nothing uploads.

> Built by a commercial real estate operator with no programming background, using Claude Code. The build itself is the first portfolio entry.

## Why

Employers have started testing "AI fluency" in interviews. Candidates have no way to prove it except claiming it. Meanwhile, the evidence already exists: every chat and every build session you've ever had is sitting in an export file. This tool reads those files and shows the moments that matter — where you caught the model being wrong, redirected it, set the constraints, verified the output, or shipped something real.

## What you get

1. **A card** — one image of your AI history: sessions, hours, tools, the date you started, how many times you caught the AI being wrong, your most common kind of judgment, your longest build. Post it.
2. **A portfolio page** — 6–12 verbatim excerpts, each labeled by the kind of judgment it shows, with your one-line annotation. For hiring managers. Optional.
3. **Resume bullets** — the two or three lines your cards actually support, with the link.

## How it works

- You export your data from ChatGPT (Settings → Data controls → Export) or Claude (Settings → Privacy → Export data), or point it at your local Claude Code sessions (`~/.claude/projects/`).
- The page parses the zip in your browser. Stats and heuristic judgment moments need no AI model at all.
- Optionally, add your own Claude API key for deeper extraction. The key never leaves your browser.
- Redaction runs before anything is shown: emails, phones, money, keys, paths, and any names you list. Redactions are visible as `[redacted: …]`, never silently removed.
- You approve every card. Nothing is published that you didn't pick.
- The published page carries a provenance footer: export hashes, import dates, counts. A receipt, not a score.

## Principles

- **Local-first.** Parsing, redaction, and extraction happen on your machine.
- **Verbatim.** Excerpts are shown as they were, apart from visible redactions.
- **No scores.** The tool labels and counts. Humans judge.
- **You control it.** Every card is opt-in. Unpublish removes the page.

## Status

Pre-build. The spec is in [`docs/SPEC.md`](docs/SPEC.md). Build order and conventions for Claude Code are in [`CLAUDE.md`](CLAUDE.md).

## Contributing

Importers are the easiest first contribution. ChatGPT, Claude, and Claude Code ship first; Gemini, Cursor, Copilot, and others are open. See `src/importers/` once it exists, and the schema in `docs/SPEC.md`.

## License

MIT.
