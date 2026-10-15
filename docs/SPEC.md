# Show Your Work — Product Spec

Oct 14, 2026 · Benjamin Adelmann · Revision 4

A free, open-source tool that turns a power user's real AI history — Claude, ChatGPT, Claude Code, GitHub — into a shareable profile of how they work with AI, and a verifiable portfolio for hiring managers. Goal as of revision 2: maximum reach, not revenue. The popularity of the tool is the sell; Benjamin's own portfolio is the first user.

## The bet

Hiring managers have started testing AI fluency in interviews but have nothing to look at beforehand. Candidates who are strong with AI have no way to prove it except claiming it on a resume. This product sits between them: the candidate imports their real AI history, picks the sessions that show judgment, and shares one link. The hiring manager sees evidence, not claims.

**One-sentence pitch:** a portfolio for how you work with AI, built from what you actually did.

**Why now:** employers are moving from asking about AI to watching candidates use it (Parker Dewey, IBM, Shopify's AI-baseline memo). The data already exists: ChatGPT and Claude both let users export full histories; Claude Code logs every session locally. Nobody has connected the two.

**Why Benjamin:** he is the user. Nine years of operator judgment, a shipped desktop app built with Claude Code, no formal programming background, applying for ops and AI-ops roles that explicitly ask to see shipped work. The product is the portfolio and the portfolio is the product.

## Revision 2 — the popularity pivot

When the goal is reach, the product has to be shareable by people who are not job hunting. Job seekers are a small, quiet audience. AI power users are a large, loud one. So the product gets a second face, and the second face goes first.

**The one change that matters:** add a **"Wrapped" card** — a single image-sized summary of someone's AI history that they want to post. Sessions, hours, tools, the date they started, how many times they caught the AI being wrong, their most-used kind of judgment, their longest build. Spotify Wrapped proved people share statistics about themselves if the design is good and the numbers are surprising. The hiring portfolio stays as the depth behind the card; the card is what spreads.

What changes in the mechanics:

| Was (v1 spec) | Now | Why |
| --- | --- | --- |
| Python CLI, local install | Browser-based: drag your export zip onto a web page; all parsing runs in the browser; nothing uploads | Install friction kills sharing. "Drop a file, get a card" is a 30-second loop. Client-side processing is also the privacy story in one sentence. |
| LLM extraction required | Heuristics first, LLM optional | Counts, hours, tools, streaks, and correction detection (turns that begin with "no," "wrong," "that's not," "actually") need no model. The judgment-moment cards use a model only when the user adds their own API key. Zero server cost, zero API cost, works for everyone. |
| Portfolio page is the product | Wrapped card is the front door; portfolio is the second step | Card → share → friend drops their export → card. Portfolio is for the 5% who are hiring or being hired. |
| One output | Three outputs: the card (PNG), the portfolio page, and a resume-bullet generator | Each one reaches a different audience: social, hiring managers, job seekers. |
| MIT license, mentioned once | Open source as the headline: GitHub repo is the home page, README is the pitch | Open source is what makes it postable on Hacker News and credible to the AI community. It also lets contributors add importers for tools Benjamin has not used. |
| Name: Show Your Work | Name must survive a search. Working alternatives below; decide before launch | "Show Your Work" collides with a well-known book. |

**What stays:** judgment moments as the unit; verbatim excerpts; no scores; local-first; the provenance footer; Benjamin's own portfolio as the first shipped card.

**Concept tweaks worth keeping:**

- A "compare" mode: two people's cards side by side. Harmless, competitive, shareable.
- "Your first prompt" on the card. Everyone's first prompt is embarrassing; that is why they will post it.
- A tagline on every card that carries the product name and URL. The card is the ad.
- Importers as community contributions: ChatGPT, Claude, Grok, Claude Code at launch; Gemini, Cursor, Copilot as "good first issues."

**Honest trade-off:** the Wrapped card can read as gimmicky to a hiring manager. Keep it off the portfolio page by default. The two faces share a codebase, not a page.

## Revision 3 — categories, quotas, and the niche

Two changes. The seven fixed kinds become a library the candidate chooses from, and the page stops competing with the resume. A resume already lists shipped projects; a live interview already shows ten minutes of the candidate at their most nervous. The niche is what neither can show: **habits across hundreds of sessions, over time, including the failures.** That only exists in the history, and nobody can produce it by hand.

**The library: 30 categories in four families.** The candidate picks up to 7, orders them, and sets a quota of 3–7 moments for each.

| Family | Categories |
| --- | --- |
| Judgment | Caught an error · Redirected a bad approach · Set constraints up front · Decomposed a big ask · Verified against a source · Declined to use AI · Changed my mind on evidence · Stopped before an irreversible step · Asked the question that mattered · Rejected "good enough" |
| Expertise | Knew more than the model (domain correction) · Supplied the context the model lacked · Spotted a legal, financial, or compliance risk · Reconciled numbers that didn't match · Translated for a specific audience · Recognized a pattern across sessions · Chose the right tool or method · Wrote a specification that held up |
| Working style | Planned before executing · Iterated to done · Persisted through failure · Recovered from a dead end · Scoped down or time-boxed · Documented for the next person · Built something reusable |
| Character | Owned a mistake · Asked for critique and used it · Handled ambiguity without stalling · Pushed back on a bad ask · Kept the human part human |

**The mechanic: pick, quota, fill, veto, refill.**

1. Candidate picks ≤ 7 categories and orders them. Order is the page order.
2. Candidate sets a quota per category (3–7). Default 4.
3. Extraction runs once over every session and builds a ranked pool per category: every candidate moment, with an internal rationale ("why this one") and a strength rank. The pool is private to the candidate; the hiring manager never sees ranks or rationales.
4. The top N fill the quota. Candidate reviews each: approve, trim the excerpt, rewrite the annotation, or veto.
5. A veto pulls the next-ranked moment into the slot. Repeat until the quota is met or the pool is exhausted. Exhausted means the tool says so and offers to lower the quota or let the candidate nominate a session by hand.
6. One moment belongs to one category. A moment that fits two is offered in the stronger one and withheld from the other.
7. The candidate writes a one-line summary per category; the tool drafts it, the candidate owns it.

**What comes off the hiring-manager page.** "Shipped" stops being a section. Shipped work stays as evidence links on the cards and in a one-line strip under the header, because the resume already covers it. The Wrapped card stays off the page.

**What goes on: the exhibits only volume can produce.** These are the reason a hiring manager opens the link after the resume and before the interview. Each is derived from the whole history, not from selected moments, so the candidate cannot cherry-pick it; they can only choose whether to show it.

| Exhibit | What it shows | Why it beats a live session |
| --- | --- | --- |
| Habit rates | Across all sessions: how often the candidate verified, pushed back, set constraints, planned first. Shown as rates, not scores ("verified in 41% of sessions where a number mattered"). | Ten minutes shows a performance. Four hundred sessions show a habit. Habits predict. |
| Calibration by stakes | The same rates split by stakes: money, legal, code, writing, casual. The question is whether verification rises when stakes rise. | This is the single thing a hiring manager most wants to know about an AI user and cannot observe in an interview. |
| Growth curve | Habit rates by quarter. New tools adopted, by date. The shape matters more than the level. | A career-changer's AI skill is often recent; the curve shows whether it is real. Nothing else on a resume shows trajectory. |
| Failure and recovery | Dead ends, abandoned approaches, and what the candidate did next. Selected like other moments but from a category nobody volunteers. | Candidates never show failure on a resume or in an interview. Showing it, with the recovery, is the most credible thing on the page. |
| Where the model caught me | Moments where the AI corrected the candidate and the candidate accepted it. | Honesty signal. A person who shows this is a person who will tell you when they are wrong. |
| Delegation map | What the candidate hands to AI and what they keep, inferred from behavior, not stated. Shown as two short lists. | Revealed preference beats a stated one. The "when I don't use AI" paragraph becomes evidence instead of a claim. |
| Domain breadth | A small map of the subject areas the history covers (finance, legal, code, writing, operations) with session counts. | Shows range without listing skills. A hiring manager sees transferability. |
| Build trails | For each shipped thing: the sessions and commits that produced it, as a dated line. | Keeps the shipped work, but as proof of process rather than a claim of outcome. |

**Guardrails on the exhibits.** Rates are shown with their denominators. No exhibit ever renders as a single number or a grade. The candidate can hide any exhibit but cannot edit its numbers; the provenance footer says which exhibits are hidden. Stakes classification is heuristic and labeled as such.

**What this does to the build.** Extraction now has three jobs: classify every user turn by category (cheap, batched), compute the exhibits from the full history (local, no model needed for most), and rank pools per category (model, once). The browser-only constraint holds for stats and heuristics; category classification over hundreds of sessions needs the user's API key or a very good heuristic pass. Ship heuristics for ten categories first; the other twenty are model-only until proven otherwise.

**Revised hiring-manager page order:** header · habit rates and calibration strip · the candidate's categories in their order, quota-filled · failure and recovery · where the model caught me · delegation map · growth curve · domain breadth · build trails · provenance footer. Ninety seconds for the first two zones; the rest for whoever keeps reading.

## Revision 4 — the candidate owns the page

The candidate is the user and the customer. The hiring manager is only the reader. Everything on the page is the candidate's choice; the tool's job is to find the best material and compute the exhibits honestly. Cherry-picking is the point. Fabrication is the only thing ruled out, because a reader who stops believing the page stops reading it.

**Rule:** the candidate decides what is shown; what is shown is computed from the history, not edited by hand. The footer carries the receipt: "7 of 9 exhibits shown · window Mar 2025–Oct 2026."

**Discovered categories replace the preset library.** Pass one labels every user turn with a short free-text description of what the person did. Cluster the labels. The largest clusters become proposed categories named from the candidate's own behavior ("Catching invented numbers," "Negotiation prep," "Tightening a brief"). The candidate keeps, renames, merges, or deletes, then sets quotas and reviews moments with veto-and-refill as in Revision 3. The 30-item library survives only as a fallback vocabulary for thin histories and as suggestions for what might be missing. Every page ends up with categories nobody else has.

**The four exhibits that carry the page.** Each is computed over the whole chosen window. The candidate can hide one, never edit one.

| Exhibit | Mechanism | What the reader looks for |
| --- | --- | --- |
| Calibration slope | Classify each session's stakes: dollar amounts, contract or legal terms, anything addressed to a third party, deployable code, tax or medical → high; internal drafting and analysis → medium; brainstorming, learning, casual → low. Measure care behaviors at each level: asked for sources, cross-checked with a second source or tool, pushed back or corrected, said "are you sure," declined to let the model do it. | The slope, not the level. "Verified in 9% of low-stakes sessions, 31% medium, 68% high." Rising = calibrated. Flat-high = thorough but slow. Flat-low = will paste a hallucinated number into a lease. Inverted = red flag. |
| Delegation ladder | Five rungs: (1) ask-and-answer, (2) drafting and editing, (3) directing multi-step work with constraints, (4) delegating whole tasks and verifying the result, (5) building things that run without you: scripts, automations, agents, apps. Each rung has detectable evidence; rung 5 is Claude Code sessions, scheduled tasks, tool or MCP use, batch jobs. | Highest rung reached, when, and share of time at each. A year of use that never leaves rungs 1–2 is the tell that the person does not understand the tools. Rung 5 is the opposite tell. |
| Growth curve | Bucket sessions by month. Per month: constraints per prompt, verification rate, pushback rate, turns per session, highest ladder rung, first use of each tool. | Shape over level. Corrections falling while constraints rise means the prompts got good enough that the model stopped needing correction. First-tool dates show adoption speed. Answers "is this real or did he start last month" in one glance. |
| Failure and recovery | Candidate moments from a category nobody volunteers: dead ends, abandoned approaches, what came next. Selected and vetoed like any other category. | The most credible thing on the page, because nobody shows it. |

**Demoted to strips:** shipped work (the resume has it; build trails stay as links), domain breadth, where-the-model-caught-me (folds into failure and recovery), habit rates (fold into the calibration exhibit as its denominators).

**Page order:** header · calibration slope · delegation ladder · the candidate's categories, in their order, quota-filled · failure and recovery · growth curve · strips · receipt footer.

**Build order changes:** stakes classifier and ladder detector move up to weekend 2, ahead of any category work. Turn-labeling and clustering replace the fixed-library heuristics. The 30-item library stays in the repo as data, not as the first build.

## Launch strategy

The product spreads through one loop: someone posts their card, a reader drops their own export, gets a card, posts it. Everything below exists to start that loop and to make sure the story travels with it. Target: 1,000 cards generated and one press mention in the first six weeks. Benjamin's time: under three hours a week after launch.

**The story (what gets repeated)**

Two hooks, used together: "a tool that proves whether you are actually good with AI" and "built by a non-programmer, a commercial real estate operator, with Claude Code." The first gets clicks; the second gets coverage. Every post, README, and pitch carries both in the first two sentences.

**Channels, in launch order**

| Week | Channel | What goes out | Who does it |
| --- | --- | --- | --- |
| 0 | GitHub | Repo public, README as the pitch, demo GIF, "good first issue" importers, MIT license | Claude drafts everything; Benjamin pushes |
| 0 | Benjamin's own card + portfolio | Live page; his LinkedIn header and resume link point at it | Benjamin |
| 1 | Hacker News, "Show HN" | Title: "Show HN: I turned my ChatGPT and Claude history into a shareable profile (open source, runs in your browser)". Post Tuesday–Thursday, 8–9am ET. Benjamin answers comments for the first 4 hours | Claude drafts post and FAQ; Benjamin posts and replies |
| 1 | Reddit | r/ClaudeAI, r/ChatGPT, r/ArtificialIntelligence, r/cscareerquestions, r/recruiting; one post each, 2 days apart, each written for that sub | Claude drafts; Benjamin posts |
| 1–2 | X and LinkedIn | Benjamin's card, then one post a day for two weeks: a card, a judgment moment, a build note, a user's card (with permission) | Claude drafts a 14-post queue; scheduled |
| 2 | Product Hunt | Launch day with 5 pre-arranged first comments; "free, open source, runs in your browser" | Claude prepares listing; Benjamin launches |
| 2–3 | Newsletters | Pitch to AI newsletters (Ben's Bites, The Neuron, TLDR AI, The Rundown) and recruiting newsletters (Recruiting Brainfood, HR Brew). Short email: the two hooks, a link, a GIF | Claude writes 8 pitches; Benjamin sends from his address |
| 3 | Anthropic and OpenAI community | Post in Anthropic's Discord and Claude Code community; tag Anthropic devrel on X with the non-programmer build story. A repost from them is the single biggest possible lift | Claude drafts; Benjamin posts |
| 3–4 | Podcasts and creators | 10 AI-tools YouTubers and podcasters who do "I tested X" content; offer them their own card first | Claude finds and drafts; Benjamin sends |
| 4–6 | Press | TechCrunch is unlikely for a free tool; realistic targets are Fast Company (work/AI), Business Insider (careers), Axios AI, and local OC business press, which loves the local-operator angle | Claude drafts pitches; Benjamin sends |
| Ongoing | Contributors | Respond to every issue and PR within a day; merge importers; credit contributors on the README | Claude drafts replies; Benjamin approves |

**Six-week calendar**

1. Week 0 (build done): repo public, Benjamin's page live, demo GIF recorded, 14-post queue written, HN and Reddit posts drafted.
2. Week 1: Show HN Tuesday. Reddit Wednesday and Friday. Daily social posts begin.
3. Week 2: Product Hunt Tuesday. Newsletter pitches go out the same day, citing the HN and PH numbers.
4. Week 3: Anthropic community and devrel. Creator outreach.
5. Week 4: Press pitches, citing whatever traction exists. Second wave of social posts using other people's cards.
6. Weeks 5–6: Ship the most-requested importer. Post the "what I learned" write-up on the repo and LinkedIn. Pitch the write-up to the same newsletters.

**What Benjamin must do himself (about 10 hours total)**

- Push the repo and own the GitHub account.
- Post from his own accounts: HN, Reddit, X, LinkedIn, Product Hunt. Posting from someone else's account or a bot is the fastest way to get banned on all five.
- Answer Hacker News comments live for four hours on launch morning. This is the one thing that cannot be delegated and matters most.
- Send the newsletter and press pitches from his own email.
- Record one 3-minute walkthrough video, once.

**What gets delegated (Claude, or any agent)**

- All drafting: README, posts, FAQ, pitches, replies, the write-up.
- Finding the 10 creators and 8 newsletters with current contact details.
- A daily check of GitHub issues, HN, and Reddit threads with suggested replies.
- Weekly metrics: cards generated, repo stars, referrers, press hits.

**On using another AI agent for distribution**

Use any assistant for drafting and research. Do not let any agent post, DM, upvote, or comment on his behalf at scale: HN, Reddit, and Product Hunt detect and ban it, and getting caught turns the story from "non-programmer builds useful tool" into "guy astroturfs launch." The accounts must stay human.

**Metrics that mean it is working**

| Signal | Week 2 target | Week 6 target |
| --- | --- | --- |
| Cards generated | 200 | 1,000 |
| GitHub stars | 100 | 500 |
| Cards posted by others (search the tagline) | 20 | 100 |
| Newsletter or press mentions | 1 | 3 |
| Inbound messages about Benjamin himself | 2 | 10 |

If week 2 misses by half, the card design is the problem, not the channels. Fix the card before spending more on distribution.

## How the idea changed

Four passes. Each one moved the product closer to what a hiring manager will spend 90 seconds on.

| Version | The idea | What was wrong with it | What survived |
| --- | --- | --- | --- |
| v1 — Prompt portfolio | Export your chats, curate the best prompts, publish them like a design portfolio. | Nobody reads prompts. A hiring manager cannot judge a prompt without the context, and raw transcripts are long, repetitive, and full of private data. Also indistinguishable from a copied prompt library. | Import from real exports; the candidate curates. |
| v2 — Shipped-work showcase | Show the outputs instead: the apps, documents, and analyses built with AI, each with a short write-up. | Better, but outputs alone prove nothing about AI skill. Anyone can paste a result. And it collapses into a generic portfolio site, which already exists everywhere. | Outputs as evidence, linked to the sessions that produced them. |
| v3 — Judgment moments | Mine the sessions for the moments that show skill: catching an AI error, redirecting a bad approach, setting constraints, verifying a number, deciding not to use AI. Extract these automatically, let the user approve them, present them as short cards. | Right unit of value. Risk: the extraction is itself AI-generated, so it needs the original excerpt beside it and a provenance trail, or it is just more claims. | The core concept. Every card shows the excerpt, the moment, and the outcome. |
| v4 — Verifiable, two-sided | Add provenance (import hashes, timestamps, session counts), a fluency profile the viewer can scan in 10 seconds, and an interviewer mode where the hiring manager asks questions of the portfolio. Keep an employer path open: send a candidate a task, get the same report back. | Scope creep for an MVP. Everything past the profile and cards is v0.2+. | The final shape below: cards + profile for v0.1; interviewer mode and employer take-homes later. |

**What got cut:** a ChatGPT plugin or Custom GPT (cannot read other conversations); a browser extension that records live (creepy, and a hiring manager cannot verify it either); a marketplace of prompts (different product, solved by PromptBase and others); scoring candidates with a single number (invites gaming and lawsuits; show evidence, let humans judge).

## Users and the job to be done

Two users with opposite attention budgets. The candidate will spend hours; the hiring manager will spend 90 seconds, then maybe five minutes.

| User | Situation | What they want | What they fear |
| --- | --- | --- | --- |
| Candidate (power user, non-engineer) | Applying for ops, marketing, analyst, PM, chief-of-staff roles where "AI fluency" is on the posting. Has years of real sessions. | Proof that reads as credible in under two minutes. Control over what is shown. One link to paste into a resume header or application form. | Leaking client data, embarrassing early prompts, looking like they just copied ChatGPT. |
| Hiring manager or recruiter | Screening 30–200 applicants. Posting says "uses AI tools aggressively" and they have no way to check. | A fast read: does this person delegate well, verify, and know when not to use AI? Something to ask about in the interview. | Being fooled by polished AI-written claims. Wasting time on a long portfolio. |
| Candidate who is a builder (Benjamin's case) | Has shipped software with Claude Code and no CS degree. Posting asks to "see something you shipped." | Link the shipped thing to the sessions and commits that produced it, so the build is believable. | Being filtered as "only ever prompted" (an actual line from an Irvine posting). |

**Job to be done, candidate:** "When a posting asks for AI fluency, give me a link that proves it from my real work, without exposing anything I would not want a stranger to read."

**Job to be done, hiring manager:** "Before I spend an interview slot, show me in 90 seconds whether this person's AI claims are real, and give me two things to probe."

## Core concept: judgment moments

The unit of the product is not a prompt, a chat, or an output. It is a **judgment moment**: a short, dated excerpt where the candidate did something a weak AI user would not have done. The product extracts candidates for these from imported sessions, the user approves and annotates them, and each becomes a card.

Seven kinds, based on what employers say they actually test for:

| Kind | What it looks like in a session | Why a hiring manager cares |
| --- | --- | --- |
| Caught an error | User spots a wrong number, a made-up citation, a logic slip, and corrects it. | Verification habit. The number-one fear is a hire who trusts output blindly. |
| Redirected | User rejects an approach and restates the goal or constraints; the next output is better. | Steering ability. Shows the user, not the model, is driving. |
| Set constraints up front | A prompt that scopes the task: audience, format, what to exclude, what to check. | Delegation skill. Same thing a manager does with a junior employee. |
| Decomposed | User breaks a big ask into steps or has the model plan before executing. | Judgment about task size. Separates power users from chatters. |
| Verified externally | User checks against a source, a spreadsheet, a test run, a second model. | Rigor. Pairs with "caught an error." |
| Chose not to use AI | User says, in effect, "I will handle this part" (negotiation, legal exposure, a relationship). | The question interviewers ask most: when wouldn't you? |
| Shipped | A session or run of sessions that ends in a real artifact: an app, a report, a model, a decision. | Outcome. Links the skill to something that exists. |

Each card shows: the kind, the date, a 5–15 line excerpt (user and assistant turns, redacted), a one-line annotation in the candidate's words, and, where it applies, a link to the output or commit. The extraction is done by a model, so every card carries the original excerpt. The hiring manager judges the excerpt; the label is just a filing system.

## MVP scope (v0.1)

*Revision 2 changes this scope: the MVP is browser-based (drop an export zip, nothing uploads), uses heuristics first with the LLM optional via the user's own key, and ships the Wrapped card before the full portfolio. The list below is the original; read it with those three changes applied.*

The MVP is done when Benjamin's own portfolio link is live and in his resume header. Target: three weekends. Everything below is in; everything in "Creative extensions" is out.

**In**

1. Local import of a ChatGPT export, a Claude export, and Claude Code session files. Nothing leaves the machine until the user publishes.
2. Automatic redaction pass: emails, phone numbers, dollar figures, names the user lists, file paths, API keys. User reviews before anything is kept.
3. Candidate-moment extraction: a model reads each session and proposes judgment moments with a kind, an excerpt, and a draft annotation. Batched, cheap model, run once.
4. Review queue: approve, reject, edit the excerpt bounds, rewrite the annotation, attach an output link. Target: 8–15 approved cards.
5. Fluency profile: computed from approved cards and import stats. Counts by kind, tools used, date range, sessions imported, and a short "how I work with AI" statement the user writes.
6. Publish: a static page at a shareable URL. One page, scannable in 90 seconds. Optional password.
7. Provenance footer: import timestamps, session and message counts, export file hashes, tools detected. Reads as a receipt.

**Out for v0.1**

- Interviewer mode, replay, employer side, multiple portfolios, teams, any payments.
- Direct API connection to ChatGPT or Claude accounts. Exports only.
- Any scoring. Counts yes, scores no.

**Done means**

- Benjamin imports his real history, approves cards, and the page is live.
- A stranger reads it in under two minutes and can name one thing to ask him about.
- The CRE Base card links to a public GitHub repo and a 3-minute walkthrough video.

## What the hiring manager sees

One page, top to bottom, designed for a 90-second scan with a five-minute option.

| Zone | Content | Time budget |
| --- | --- | --- |
| Header | Name, target role, one-line statement in the candidate's words. Tools used as plain chips (Claude, ChatGPT, Claude Code, Zapier). | 5 seconds |
| Profile strip | Four numbers: sessions imported, date range, shipped artifacts, judgment moments by kind (a small bar). Plus the provenance badge. | 10 seconds |
| Shipped | 1–3 cards for real outputs: what it is, what it replaced, link to repo or demo, link to the sessions that built it. | 30 seconds |
| Judgment moments | 6–12 cards, grouped by kind, each with excerpt, annotation, date. Collapsed by default to the annotation line; click to open the excerpt. | 45 seconds, or five minutes if they open cards |
| When I don't use AI | One short paragraph in the candidate's words. | 10 seconds |
| Provenance footer | Import dates, counts, file hashes, "excerpts are unedited beyond redaction." | Only if they are skeptical |

Design rules: no AI-generated prose on the page except the excerpts themselves. Every sentence outside an excerpt is the candidate's. No scores, no badges, no gamification. The page should look like a well-made case study, not a dashboard.

## Data sources and import

All four sources exist today and need no API access. Verify the export formats against current documentation before building; they change.

| Source | How the user gets it | Format | What it yields |
| --- | --- | --- | --- |
| ChatGPT | Settings → Data controls → Export. Emailed zip. | `conversations.json`: one object per chat, messages in a tree keyed by id with timestamps. | Judgment moments; tool breadth; date range. |
| Claude (claude.ai) | Settings → Privacy → Export data. Emailed zip. | JSON of conversations with messages and timestamps; project files separate. | Same as above. Projects give context on sustained work. |
| Claude Code | Already on disk: `~/.claude/projects/<project>/*.jsonl`. Note: Claude Code deletes transcripts older than `cleanupPeriodDays` (default 30) — set it high in `~/.claude/settings.json` before relying on this. | One JSONL file per session: user turns, assistant turns, tool calls, file edits, with timestamps. | The strongest evidence: a build trail. Shows planning, redirection, error handling, and what shipped. |
| GitHub | Public repo URL or local clone. | Commit history with dates and messages. | Corroborates the Claude Code trail. A shipped card links commits to the sessions that produced them. |
| Grok (xAI) | Account data export from grok.com / X settings, where offered. Format and availability must be verified against a real export before building; fall back to a paste-in importer if the export is unusable. | JSON, format unconfirmed. | Breadth; the X-native audience is loud and posts cards. |
| Other (later) | Cursor, Gemini, Copilot chat exports; Zapier/Make run logs. | Varies. | Breadth. Not needed for v0.1. |

Import is a local pipeline: unzip, normalize every source into one schema (session, turn, role, timestamp, text, tool name), run redaction, run extraction, keep everything in browser memory or local storage. The published page is generated from approved cards only; raw sessions never leave the machine.

## Privacy, redaction, and verification

The product fails if a candidate leaks a client's data or a hiring manager suspects the cards are invented. Both are handled the same way: nothing is automatic at the boundary.

**Privacy**

- Local-first. Import, redaction, and extraction run on the user's machine. Publishing uploads only approved cards and the profile.
- Two-pass redaction: pattern-based (emails, phones, money, keys, paths, URLs), then a model pass that flags names, companies, addresses, and anything that reads as confidential. User confirms every replacement.
- Deny list the user maintains: names, company names, project code names. Applied before any model sees the text.
- Excerpt bounds are user-set. The extractor proposes; the user trims.
- Delete is real: unpublish removes the page; local store can be wiped.

**Verification (why a hiring manager can trust it)**

- Provenance footer: export file hashes, import timestamps, session and message counts, tools detected. Not proof, but a receipt that is awkward to fake.
- Excerpts are shown verbatim apart from redaction markers, which are visible as `[redacted: client name]` rather than silently removed.
- Shipped cards link to external evidence (a repo, a live demo, a document) that exists outside the tool.
- No scores. The tool labels and counts; the human judges. This also keeps it out of hiring-assessment regulation, which is tightening around automated scoring.

**Honest limit:** a determined person could fabricate an export. The defense is cost: fabricating months of dated, coherent sessions is more work than being good at the thing. State this plainly in the footer; hiring managers respect candor more than claimed certainty.

## Creative extensions (v0.2+)

In rough order of value to the hiring manager, then to the candidate. None are needed for the resume link.

1. **Interviewer mode.** The hiring manager types a question ("How does he handle a wrong answer?") and gets an answer drawn only from the approved cards, with citations to them. The portfolio answers for the candidate before the interview. Cheap to build; high novelty; the first thing a recruiter would share.
2. **Replay.** A scrubbable timeline of one session: watch the prompt, the output, the correction, the better output. Thirty seconds, no narration. Turns a card into a story. Best for the "shipped" cards.
3. **Fluency profile over time.** A small chart: judgment moments per month, tools adopted by date. Shows growth rather than a snapshot. Useful for career-changers whose AI skill is recent.
4. **Role-targeted views.** One portfolio, several published pages: the ops view leads with decomposition and verification; the marketing view leads with constraint-setting and shipped content. Same cards, different order and headline.
5. **Before/after pairs.** For shipped work: the spreadsheet it replaced beside the tool that replaced it. Operators understand this instantly.
6. **Peer attestations.** A colleague or client confirms a shipped card with one click and a sentence. Borrowed from LinkedIn recommendations, but attached to a specific artifact.
7. **Employer take-home.** The employer side: send a candidate a messy, realistic task; the candidate does it with their AI tools inside a recorded session; the employer gets the same card-and-profile report. This is the paid product if there is one. Needs consent flows and its own privacy work.
8. **Team fluency map.** For a company: the same import across a team to find who actually uses the tools well and who should teach. Different buyer; park it.
9. **Export to resume.** Generate the two or three resume bullets the cards support, with the link. Small, but it closes the loop with where the candidate started.
10. **"Red flag" self-check.** Before publishing, the tool points out anything that could read badly to a hiring manager: a leaked client name, a rude exchange with the model, an abandoned project with no outcome. The candidate decides. Prevents the single worst outcome, which is the portfolio hurting them.

## Build plan

*Revision 2 stack: a static web app (Vite + TypeScript, or plain HTML and JS) that parses the export zip in the browser with a zip library, computes stats and heuristic judgment moments client-side, renders the card to PNG with a canvas, and optionally calls Claude with a user-supplied key for card extraction. Deployed free on Vercel or GitHub Pages. No backend. The Python CLI below becomes an optional power-user path, not the first build.*

Built with Claude Code, by a non-programmer, which is itself the first shipped card. Keep the stack boring so the AI can carry it.

**Stack (original, v1)**

| Layer | Choice | Why |
| --- | --- | --- |
| Importer and extractor | Python CLI, SQLite | Easiest for Claude Code to write and test; runs locally; no server. |
| Extraction model | Claude via API, batched | One pass over sessions; prompt returns JSON cards. Cost: cents per hundred sessions. |
| Review UI | Local web app (FastAPI + plain HTML, or a small React page) | Approve, trim, annotate. Runs on localhost; no accounts. |
| Published page | Static HTML generated from approved cards, deployed to Vercel or GitHub Pages | Fast, free, no backend to secure. Optional password via Vercel. |
| Interviewer mode (later) | One serverless function calling Claude with the cards as context | Only piece that needs a server. |

**Order of work**

| Weekend | Deliverable | Done when |
| --- | --- | --- |
| 1 | Importers for ChatGPT, Claude, Claude Code into one schema; pattern redaction; Wrapped-card stats | Benjamin's full history loads in the browser; a card renders. |
| 2 | Card design and PNG export; heuristic judgment moments; review UI; optional LLM extraction with user key | 40+ candidate cards proposed; 10+ approved and annotated. |
| 3 | Portfolio page generator; provenance footer; deploy; CRE Base shipped card with repo and video links | Live URL in the resume header. Two strangers read it and name one thing to ask. |
| 4 (optional) | Interviewer mode; role-targeted views; compare mode | A recruiter can ask it a question. |

**Build rules**

- Dogfood only. No feature that Benjamin's own portfolio does not need until v0.1 ships.
- Every weekend ends with a commit and a short note in the repo README. The README is the case study.
- Record the build sessions. They are the "shipped" card for this product.

## Money

Decision: build it as a portfolio piece with a product story, not as a business. Revisit after 30 days live.

| Path | Who pays | Realistic range | Verdict |
| --- | --- | --- | --- |
| Free tool, open source | Nobody | $0; attention, GitHub stars, LinkedIn shares | Default. Maximizes the resume effect and inbound interest. |
| Candidate subscription | Job seekers, $9–19/month | Hundreds per month at best; churn on hire | Not worth the support load. Skip unless demand appears unprompted. |
| One-time publish fee | Candidates, $29–49 per portfolio | Low thousands if it spreads in a niche (ops, marketing ops, PM) | Possible later. Simple to add to the deploy step. |
| Employer take-home assessments | Companies, per candidate or per seat | Real pricing ($50–200 per assessment is the market for work-sample tools) | The only path to meaningful revenue. A different product with sales, compliance, and consent work. Keep the door open; do not build it first. |
| Career-coach or bootcamp licensing | Coaches, outplacement firms, bootcamps | Small, steady | Plausible channel if candidates like it. |

**Non-money returns, which are the point right now**

- A 2026-dated shipped product on the resume, built with AI, about AI fluency, that a hiring manager can click.
- An interview story no other candidate has.
- Content for LinkedIn that talent and HR people share, which is where ops referrals come from.
- Inbound: if it gets modest attention, offers find the candidate instead of the reverse.

## Risks and open questions

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Export formats change and importers break | High over a year | Normalize early; keep each importer small; test against a saved sample export. |
| Extraction proposes weak or embarrassing cards | Certain at first | The review queue is the product. Tune the prompt on Benjamin's own history before anyone else uses it. |
| A candidate leaks confidential data | Medium | Deny list, two-pass redaction, visible redaction markers, and the red-flag self-check before publish. |
| Hiring managers do not click | Medium | Put the link in the resume header, not the footer. Lead the page with the shipped card. Keep it to one page. |
| Platform terms restrict use of exports | Low for personal data the user exported | Only the user's own exports; local-first; no scraping. |
| Looks like a surveillance or scoring tool | Medium | No scores; the candidate controls everything shown; say so on the page. |
| Scope creep kills the MVP | High | The "Out for v0.1" list is binding. Weekend 3 ships or the plan is wrong. |

**Open questions**

- [ ] Does Claude Code's session format expose enough to reconstruct a build trail cleanly? Check one real session file before weekend 1.
- [ ] How long are typical ChatGPT and Claude exports for a heavy user, and does the browser handle a 200 MB zip without choking?
- [ ] Public or password-protected by default? Default public, password optional, is the current call.
- [ ] Should the CRE Base repo be fully public or a sanitized module? Decide before the shipped card is written.
- [ ] Final name. See below.

## Name candidates

The name should say "proof," not "AI." Check domain and trademark availability before committing.

| Name | Angle | Note |
| --- | --- | --- |
| Show Your Work | What a teacher demands; what a hiring manager wants | Working title. Plain, memorable, says the whole idea. Collides with a well-known book title. |
| Receipts | "I have receipts" | Punchy, slightly informal; fits the provenance footer. |
| Paper Trail | Evidence over time | Fits the replay and timeline features. |
| Worklog | What it literally is | Generic; easy to say in an interview. |
| Judgment | The thing being shown | Strong, maybe too abstract alone. |
| Shipped | Outcome-first | Overused in tech; better as a section name than the product. |
