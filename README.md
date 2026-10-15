# Show Your Work

**Turn your real AI history into proof of how you work with AI.**

Drop your ChatGPT, Claude, Grok, or Claude Code export onto a page. Get a shareable card of your AI habits and, if you want it, a portfolio of *judgment moments* a hiring manager can read in 90 seconds. Everything runs in your browser. Nothing uploads.

> Built by a commercial real estate operator with no programming background, using Claude Code. The build itself is the first portfolio entry.

## Who this is for

This is for people who own their own AI account—freelancers, consultants, small-business operators, or anyone on a personal plan. Employees can use it if their employer has agreed. It doesn't work with company-controlled accounts (enterprise or team plans); those need the employer involved.

## Your data

Your chats never leave your phone. The app downloads your export straight from OpenAI, Anthropic, or xAI, runs the numbers on your device, and deletes the file. Only the results go to our server. The code is public, so anyone can check it.

## Why a hiring manager can trust it

Your phone's built-in security confirms an unmodified copy of the app pulled the data directly from the AI company and did the math. We sign the record. They click once and see the signed numbers, the date, and the source—without ever seeing a single chat.

*The signature confirms the process — a genuine app, data from the AI company, numbers unaltered. It is not a judgment of the candidate.*

## Why

Employers have started testing "AI fluency" in interviews. Candidates have no way to prove it except claiming it. Meanwhile, the evidence already exists: every chat and every build session you've ever had is sitting in an export file. This tool reads those files and shows, in numbers, how you actually work with AI — how much you double-check when stakes are high, how much you delegate and whether quality holds when you do, and how that has changed over time.

## What you get

1. **A card** — one image of your AI history: sessions, hours, tools, the date you started, how many times you caught the AI being wrong, your longest build. Post it.
2. **A verified profile page** — five charts, no chats: calibration by stakes, delegation vs. precision, growth over time with milestones, your categories as rates, failure and recovery. Signed, so a hiring manager can check it in one click. Optional.
3. **Resume bullets** — the two or three lines your numbers actually support, with the link.

## How it works

- You export your data from ChatGPT (Settings → Data controls → Export), Claude (Settings → Privacy → Export data), or Grok (account data export), or point it at your local Claude Code sessions (`~/.claude/projects/`).
- The web version parses the zip in your browser for the card and a private self-review. Nothing uploads.
- The phone app is the verified path: it fetches the export itself from the AI company, computes on-device, and sends only numbers plus the phone's attestation.
- You choose a whole project or a whole date range. Nothing inside it can be removed; the signed statement says what share of your account it is.
- No scores. Rates with denominators. Humans judge.

## Principles

- **Local-first.** Parsing, redaction, and extraction happen on your machine.
- **Numbers only.** No chat content is ever shown to anyone.
- **No scores.** Rates with denominators. Humans judge.
- **You control it.** Publish or don't. Unpublish removes the page.

## Status

Pre-build. The spec is in [`docs/SPEC.md`](docs/SPEC.md). Build order and conventions for Claude Code are in [`CLAUDE.md`](CLAUDE.md).

## Contributing

Importers are the easiest first contribution. ChatGPT, Claude, Grok, and Claude Code ship first; Gemini, Cursor, Copilot, and others are open. See `src/importers/` once it exists, and the schema in `docs/SPEC.md`.

## License

MIT.
