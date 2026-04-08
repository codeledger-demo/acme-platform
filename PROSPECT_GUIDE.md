# Welcome to the CodeLedger Living Demo

> **You're looking at a real, running engineering team.** Not a deck. Not a video. Not a sandbox with canned data. This is a repository with 10+ months of git history, a CI pipeline, and three developers who open PRs every weekday — and CodeLedger has been watching all of it.
>
> It takes ~8 minutes to understand what CodeLedger does by looking at this. Here's the tour.

## Who lives in this repo

Three developers on the "Acme Platform" team. They're bot personas, but their commits, PRs, reviews, and failure modes are real code CodeLedger evaluated in real CI runs.

| | Developer | Role | Typical pattern |
|---|---|---|---|
| 🟢 | **Sara Chen** | Senior Engineer | Writes tests first. Reviews everything in `services/auth/`. ~97% CIC pass rate. |
| 🟡 | **Marcus Webb** | Mid-level Engineer | Solid most of the time. Cuts corners when the sprint is burning. ~76% CIC pass rate. |
| 🔴 | **Priya K** | Junior / Contractor | Well-intentioned. Leans heavily on AI code completion. Low test coverage. Improves over time. Starts at 54% CIC pass rate. |

You'll see their names on commits below, in the PR history, and as the authors of the "Lessons Ledger" entries CodeLedger generated from their mistakes.

## The 8-minute tour

### Minute 1 — Scroll this README

Scroll down to the **Living Development Feed** section (it's auto-updated whenever the team ships anything). You'll see:

- The current "arc" the team is in (one of six story arcs from onboarding through an incident to recovery)
- The current team health score
- The most recent PR headlines
- A scorecard per developer

If you hit refresh in an hour, some of this will be different. It's real.

### Minute 2 — Look at the git history

Click the [Commits tab](../../commits/main) or run locally:

```bash
git log --oneline --all --graph | head -50
```

You'll see commits authored by `Sara Chen`, `Marcus Webb`, and `Priya K` interleaved. Check the author email — they're real GitHub bot accounts, not forgeries. The history is continuous — not a dump.

### Minute 3 — Read one of Priya's PRs

Go to the [closed PRs page](../../pulls?q=is%3Apr+is%3Aclosed+author%3Apriya-k-acme) and open any PR authored by `priya-k-acme`. Pay attention to:

- **The PR body** — minimal, sometimes just the commit message
- **The CodeLedger PR Check comment** — tells you what CodeLedger thought of it
- **The files changed** — look for the subtle issues a senior reviewer would catch but Marcus (her usual reviewer) missed when deadlines were tight

### Minute 4 — Read "The Auth Incident"

Find the PR titled something like *"refactor(auth): modernize JWT verification pipeline"* (authored by Priya). This is the scenario CodeLedger was designed to catch:

- Priya used AI to refactor auth middleware
- The AI generated a `token-refresh.ts` file that isn't imported by anything (a "ghost file")
- Marcus approved the PR while distracted by a sprint deadline
- CodeLedger's CIC ran and flagged it

Read the CIC output in the PR comment. That's the core product in one PR.

### Minute 5 — Open the full dashboard

**The Drama Feed in this README is the *free* view**. The full experience is at:

→ **https://demo.codeledger.dev** *(publicly accessible — no login required)*

When you get there, the recommended click path is:

1. **Team Health Overview** — 20 seconds to get oriented. Look at Priya's card vs Sara's.
2. **Time Horizon Analytics** — *the flagship view*. Click through 30d → 60d → 90d → 1yr. Watch every metric panel change.
3. **Named Incidents → The Auth Incident** — the same PR you read in Minute 4, but with the full dashboard context: timeline, before/after metrics, linked CIC results, related lessons.
4. **Lessons Ledger Feed** — see what CodeLedger learned from each failure. This is the "wisdom growth" metric.
5. **CIC History** — filter by Priya, then filter by `CompletionState: incomplete`. Count the bugs CodeLedger caught before they hit prod.
6. **Fleet Insights** (Enterprise tier) — cross-repo risk aggregation and spike alerts.
7. **Sandbox Lane** — *try it yourself*. Pick one of the pre-prepared scenarios and run a real CIC check. Takes under 15 seconds.

### Minute 6 — Understand what you're NOT seeing

Things the demo deliberately leaves out:

- **Your code.** None of this is your repo. It's a synthetic monorepo ([see the structure](services/)).
- **Fake data.** Every metric in the dashboard is derived from actual CodeLedger output against real CI runs — or from deterministic fixtures clearly labeled as such in demo mode.
- **LLM hand-waving.** Every score, every decision, every "block" verdict is a pure function you can read in [`packages/engine/src/graph/calculators.ts`](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/packages/engine/src/graph/calculators.ts) in the CodeLedger source. No model in the hot path.

### Minute 7 — Scan the story arcs

The team's history is structured as six story arcs. You're probably seeing one of them "live" right now depending on where the cron has advanced to:

| Arc | What happens | What CodeLedger does |
|-----|--------------|---------------------|
| 1. Clean Baseline | Team ships cleanly. Memory builds up. | High CIC pass rates. Architecture map stabilizes. |
| 2. Sprint Squeeze | Q4 deadline. Marcus cuts corners. | WARN events begin. 2 Lessons Ledger entries created. |
| 3. **The Incident** | Priya's AI-generated auth refactor. | Release Authority BLOCKS the deploy. |
| 4. The Reckoning | Team debriefs. Sara tightens guardrails. | Architecture map corrected. |
| 5. Recovery | Priya climbs from 54% → 71% CIC pass rate. | Positive trend visible in dashboard. |
| 6. Clean Release | v2.4.1 ships with `ready_hardened` state. | First clean release in 6 weeks. |

Plus **Arc 7 — Feature Showcase**, a side-story arc that exercises the latest CodeLedger features (Semantic Fortress, Change Capsule, Golden Patterns, Fleet risk spike alerts).

### Minute 8 — Decide your next step

You've now seen:
- Real git activity from a synthetic team
- CIC output on every PR
- The dashboard that visualizes it all
- The narrative of a team that failed and recovered
- The latest v0.9.2 features (if Arc 7 has run yet)

If you want to go deeper, three options:

1. **Book a 30-minute walkthrough** — we'll run the Sandbox Lane live against your choice of scenario and answer questions → **https://codeledger.dev/demo**
2. **Try CodeLedger on your own repo** — instructions at **https://codeledger.dev/install**
3. **Read the engineering overview** (7 pages, no fluff) → **[CodeLedger Overview](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md)**

## Transparency

This repository is part of a public demonstration system. To be fully clear:

- **All commits are synthetic** — produced by the Synthetic Reality Engine simulator (repo: `codeledger-demo/synthetic-reality-engine`, private) running on GitHub Actions.
- **Sara, Marcus, and Priya are bot accounts** — they use illustrative avatars, not photos of real people.
- **No real customer data** appears anywhere in this system.
- **CodeLedger output in PR comments is real** — it comes from running the actual `codeledger` CLI against this repo in CI. (When the CLI is not yet published to npm, the workflow posts a clearly-labeled "stub mode" comment instead.)
- **The dashboard** at `demo.codeledger.dev` renders from deterministic fixtures in demo mode, or from real data when connected to a live PostgreSQL instance. The UI is the same either way.

## Questions we expect you to ask

**"Could I run this on my own repo?"**
Yes. That's the whole point of CodeLedger. This demo exists so you can see what you'd get before you install it. The product itself is at `github.com/codeledgerECF/codeledger-blackbox`.

**"How is this different from [Sonar/CodeClimate/LGTM/Snyk/etc.]?"**
Those tools score code. CodeLedger scores *changes* and decides whether a specific change is safe to ship *given the history of this repo*. Scoring is deterministic. Decisions are explainable. Memory compounds over time. Read the [CodeLedger Overview](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md) for the full architectural argument.

**"Does it use GPT-4 / Claude / etc.?"**
Not in the hot path. There is no LLM in any scoring decision. The math is in `packages/engine/src/graph/calculators.ts` and is pure functional code. LLMs are what the developer uses to write code — CodeLedger is the verification layer that runs after.

**"How often does this demo update?"**
Every weekday, 4 times a day, on cron (9am / 11am / 2pm / 4pm Pacific). Plus whenever the sales team manually fires a scenario for a live walkthrough.

**"Can I see the source of the simulator?"**
The simulator is in a private repo (`codeledger-demo/synthetic-reality-engine`). Ask your sales contact for read access if you want to inspect how the demo produces its activity.

---

*CodeLedger · Intelligent Context AI Inc. · [codeledger.dev](https://codeledger.dev)*
