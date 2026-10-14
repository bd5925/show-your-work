# Launch kit

Drafts for every channel in the launch plan (see `SPEC.md` → Launch strategy). Replace `NAME` with the final product name and `URL` with the live link. Post from your own accounts only.

---

## Show HN

**Title (80 chars max):**
Show HN: Turn your ChatGPT/Claude history into proof of how you work with AI

**Alternate titles:**
- Show HN: A "Wrapped" for your AI chat history, open source, runs in your browser
- Show HN: I built a tool that shows hiring managers how you actually use AI

**Body:**

I'm a commercial real estate operator, not a programmer. Over the last year I built a desktop app for my business with Claude Code, and when I started applying for jobs I hit a problem: every posting says "AI fluency," and the only way to show it was to claim it on a resume.

But the evidence already existed — every chat and every build session is in an export file. So I built NAME.

You drop your ChatGPT or Claude export zip (or point it at your Claude Code sessions) onto the page. It parses everything in your browser — nothing uploads — and gives you:

1. A card: sessions, hours, tools, the day you started, how many times you caught the model being wrong, your first prompt.
2. Optionally, a portfolio page: verbatim excerpts of the moments that show judgment — catching an error, redirecting a bad approach, setting constraints up front, verifying a number, deciding not to use AI at all. You approve every excerpt. Redactions are visible, never silent.

Design choices I'd like feedback on:
- No scores. It labels and counts; humans judge. I think scoring would be gamed within a week and is a legal mess for hiring anyway.
- Heuristics first. Stats and basic correction-detection need no model. Deeper extraction only if you paste your own API key, which stays in the browser.
- Every card carries its source excerpt. The labels are a filing system, not claims.

Built with Claude Code; the build sessions are themselves the first portfolio entry. MIT licensed. Importers for other tools (Gemini, Cursor, Copilot) are open issues if anyone wants one.

URL · GitHub: REPO

**First comment (post immediately, as the author):**

A few things people will probably ask:

*Can't someone fake an export?* Yes. The provenance footer (file hashes, counts, date ranges) is a receipt, not proof. The defense is cost — fabricating months of coherent, dated sessions is more work than being good at the thing. I say this plainly on the page.

*Isn't "being good at prompting" not a real skill?* Prompting isn't what it shows. It shows whether you verify, redirect, decompose, and know when to stop using the tool. Those are the same things a manager wants from a junior hire.

*Privacy?* Nothing leaves the browser unless you click publish, and publish only sends the cards you approved. The repo is small enough to read.

---

## Reddit

Post each one separately, two days apart, written for that subreddit. Lead with the card image.

**r/ClaudeAI — "I turned my Claude + Claude Code history into a shareable card and a portfolio (open source, browser-only)"**
Short version of the HN body. Emphasize: Claude Code sessions are the richest input because they show a build trail. Mention the `cleanupPeriodDays` gotcha — people will thank you for it.

**r/ChatGPT — "Spotify Wrapped, but for your ChatGPT history"**
Lead with the card. One paragraph on what it reads from `conversations.json`. "Runs in your browser, nothing uploads, open source."

**r/ArtificialIntelligence — "A tool for proving AI fluency to employers without scores or claims"**
Lead with the design argument: no scores, verbatim excerpts, judgment moments as the unit. Ask for criticism of the seven kinds.

**r/cscareerquestions — "Job postings keep saying 'AI fluency.' I built a way to show it instead of claiming it."**
Lead with the hiring problem. Keep the self-promotion to one link at the end. Expect skepticism; answer it.

**r/recruiting — "Would this change how you screen for AI skills? (free tool, looking for recruiter feedback)"**
Frame as a question, not a launch. Show the portfolio page, not the card. Ask what they'd want to see that isn't there.

---

## X / LinkedIn — 14-post queue

One per day. Alternate X-length and LinkedIn-length. Each carries the link once.

1. **Launch.** Your own card as the image. "I built a tool that turns your AI history into proof of how you work with AI. Here's mine. Free, open source, runs in your browser."
2. **The origin.** "I run a commercial real estate business. No programming background. Built this with Claude Code in three weekends. The build sessions are the first portfolio entry."
3. **A judgment moment.** Screenshot of one card — the time you caught the model inventing a number. "This is the kind of thing a hiring manager actually wants to see."
4. **The design rule.** "No scores. The tool counts and labels; humans judge. Scoring would be gamed in a week."
5. **Someone else's card** (with permission). Tag them.
6. **The privacy line.** "Drop a zip, nothing uploads. The repo is small enough to read in 20 minutes."
7. **Your first prompt.** Post it. Everyone's is embarrassing. Ask people to post theirs.
8. **The hiring angle.** "Every posting says 'AI fluency.' Nobody can check it. This is the check." Link the portfolio page.
9. **A build note.** One thing Claude Code got wrong and how you caught it. Meta, and on-topic.
10. **Numbers so far.** Cards generated, stars, countries. Honest even if small.
11. **The 'when I don't use AI' section.** Yours. Negotiations, legal exposure, relationships.
12. **Contributor callout.** "Gemini and Cursor importers are open issues. ~150 lines each."
13. **A recruiter's reaction** — quote one, with permission.
14. **What I learned.** Link the write-up on the repo.

---

## Product Hunt

**Tagline (60 chars):** Proof of how you work with AI, from your real chat history

**Description:** Drop your ChatGPT, Claude, or Claude Code export onto a page. Get a shareable card of your AI habits and an optional portfolio of verbatim "judgment moments" for hiring managers. Runs entirely in your browser. No scores, no uploads, open source.

**First comment:** the HN first comment, shortened.

**Pre-arranged first commenters (5):** people who have used it and can post their own card in the comments within the first hour. Line these up a week ahead.

---

## Newsletter pitch (email)

Subject: A free tool that shows whether someone is actually good with AI

Hi NAME,

Quick one. I'm a commercial real estate operator — not a developer — and I built an open-source tool with Claude Code that turns a person's real ChatGPT/Claude history into a shareable card and a portfolio of "judgment moments" a hiring manager can read in 90 seconds. Everything runs in the browser; nothing uploads; no scores.

It launched on Hacker News on DATE (NUMBER points) and has generated NUMBER cards so far.

Two angles that might fit your readers: the hiring side (postings say "AI fluency," nobody can verify it) and the non-programmer-builds-real-software side.

Link: URL · 30-second demo: GIF · Repo: REPO

Happy to send my own card or a short write-up if useful.

Benjamin Adelmann
Mission Viejo, CA · 818.521.5416

**Targets:** Ben's Bites, The Neuron, TLDR AI, The Rundown, Recruiting Brainfood (Hung Lee), HR Brew, Superhuman AI, Lenny's Newsletter (long shot). Verify current submission addresses before sending.

---

## Press pitch (email)

Subject: A real estate operator built the first "AI fluency" portfolio tool — with AI

Three-sentence version of the newsletter pitch, plus: "I'm in Orange County and available for a call this week." Attach the card image inline.

**Targets:** Fast Company (Work Life), Business Insider (Careers), Axios AI+, Orange County Business Journal, OC Register business desk, LAist.

---

## Anthropic community post

Discord / Claude Code community / X tagging Anthropic devrel:

"Non-programmer here. Built NAME with Claude Code — a browser-only tool that turns your Claude and Claude Code history into a shareable card and a portfolio of judgment moments. The Claude Code session files turned out to be the best input: they show the whole build trail. Repo: REPO. Would love feedback on the `.jsonl` importer."

Do not ask for a repost. Make the post useful and let it happen.

---

## Reply bank (for HN, Reddit, PH comments)

- **"This is just a prompt library."** It isn't — prompts aren't shown on their own. The unit is the moment: what you did when the model was wrong, vague, or overreaching, with the excerpt as evidence.
- **"Hiring managers won't read this."** Probably not the long version. The card takes 5 seconds and the portfolio page 90. The provenance footer is for the skeptical ones.
- **"This will be gamed."** No scores means nothing to optimize for. You could fabricate an export; it's more work than being good.
- **"Why not an extension that records live?"** Creepy, and unverifiable by the reader. Exports are something the platforms already give you.
- **"Does it work with [tool]?"** Not yet — importers are ~150 lines and open issues. Link the schema.
- **"You built this with AI, so it's not impressive."** The build sessions are in the portfolio. Judge the judgment.
