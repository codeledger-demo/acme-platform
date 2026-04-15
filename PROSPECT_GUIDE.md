# Welcome to the CodeLedger Living Demo

---

> **What problem are we solving?**
>
> **The Problem** — AI coding agents waste 40–60% of their context window on irrelevant files. Every session starts cold. Institutional knowledge lives in people's heads and disappears when they leave. There is no risk signal before a merge.
>
> **The Solution** — CodeLedger is a deterministic context control plane for software development. It scores every file in a repository, selects only what the current task requires, captures outcomes, and promotes successful patterns into reusable institutional memory.
>
> **The Intelligence Layer** — The Task Intelligence Engine does not start from zero. It is seeded from day one with a curated ontology pack of golden patterns — distilled from peer organizations and leading engineering teams at organizations including Google, SAP, and Salesforce. As your team uses CodeLedger, your own earned patterns layer on top, making the system progressively more tailored to your codebase, your conventions, and your standards.
>
> **The Principle** — No cloud. No training pipeline. No behavior change required. Engineering management installs it once. Every developer and every AI agent benefits automatically — from collective intelligence on day one, and from your own institutional memory from day two onward.
>
> *Logs are history. Ledger is intelligence.*

---


> **You're looking at a real, running engineering team.** Not a deck. Not a video. Not a sandbox with canned data. This is a repository with 10+ months of git history, a CI pipeline, and three developers who open PRs every weekday — and CodeLedger has been watching all of it.
>
> It takes ~10 minutes to understand what CodeLedger does by looking at this. Here's the tour.

## Who lives in this repo

Three developers on the "Acme Platform" team. They're bot personas, but their commits, PRs, reviews, and failure modes are real code CodeLedger evaluated in real CI runs.

| | Developer | Role | Typical pattern |
|---|---|---|---|
| 🟢 | **Sara Chen** | Senior Engineer | Writes tests first. Reviews everything in `services/auth/`. ~97% CIC pass rate. Authors most golden patterns. |
| 🟡 | **Marcus Webb** | Mid-level Engineer | Solid most of the time. Cuts corners when the sprint is burning. ~76% CIC pass rate. Coach frequently references Sara's patterns in his PRs. |
| 🔴 | **Priya K** | Junior / Contractor | Well-intentioned. Leans heavily on AI code completion. Low test coverage. Improves over time. Starts at 54% CIC pass rate. |

You'll see their names on commits below, in the PR history, and as the authors of the "Lessons Ledger" entries CodeLedger generated from their mistakes.

## The 10-minute tour

### Minute 1 — Scroll this README

Scroll down to the **Living Development Feed** section (it's auto-updated whenever the team ships anything). You'll see:

- The current "arc" the team is in (one of seven story arcs from onboarding through an incident to recovery)
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
- **The CodeLedger PR Analysis comment** — tells you what CodeLedger thought of it
- **The files changed** — look for the subtle issues a senior reviewer would catch but Marcus (her usual reviewer) missed when deadlines were tight

### Minute 4 — Read "The Auth Incident"

Find the PR titled something like *"refactor(auth): modernize JWT verification pipeline"* (authored by Priya). This is the scenario CodeLedger was designed to catch:

- Priya used AI to refactor auth middleware
- The AI generated a `token-refresh.ts` file that isn't imported by anything (a "ghost file")
- Marcus approved the PR while distracted by a sprint deadline
- CodeLedger's CIC ran and flagged it

Read the CIC output in the PR comment. That's the core product in one PR.

### Minute 5 — Open a PR comment (new style)

Open any recent PR and look at the **CodeLedger PR Analysis** comment. The v0.10.10 comment format has these sections:

1. **Context Certification** — ISC (Intent Sufficiency) and CCS (Context Confidence) as visual score bars, plus a Truth Grade (A–F)
2. **Top Findings** — severity-ranked table with module and evidence-cited description
3. **Run Explanation** (expandable) — WHY the findings occurred, with evidence from ECL history
4. **Recommended Next Actions** (expandable) — ranked by confidence score, with "based on" references
5. **Coach: Implementation Plan** (expandable) — ordered steps with rationale citing golden patterns and structural trust

Every score is deterministic. Every finding cites evidence. No LLM in the hot path.

### Minute 6 — Truth & Confidence

Look at the **Truth Grade** in the Context Certification section. Truth isn't binary — it's a continuous assessment:

| Grade | What it means |
|-------|---------------|
| **A** | FRESH remote, CI evidence present, clean worktree |
| **B** | Recent fetch, CI evidence present or pending |
| **C** | Stale fetch or missing CI evidence |
| **D** | Significant divergence or missing evidence |
| **F** | No remote tracking or broken state |

Watch how truth degrades when CI hasn't run yet and recovers when evidence arrives. In Arc 7C (Truth Control Plane), you can see Sara's release PR truth grade progress from C→B→A as evidence accumulates.

### Minute 7 — Phase 2 Intelligence

Expand the **Run Explanation** details on a WARN PR (Marcus's PRs often have WARNs). You'll see:

- **WHY** the finding occurred — evidence-cited, referencing specific ECL entries and verify findings
- **What PATTERNS are emerging** — learnings from ECL history showing recurring issues
- **What ACTIONS to take next** — ranked by confidence, each linked to evidence

The framing: *Logs tell you what happened. Ledger tells you what it means. Explain tells you why. Learnings show what repeats. Next tells you how to win.*

All synthesis is deterministic — derived from ECL ledger history, CCS/ISC factors, and failure hotspots. No LLM.

### Minute 8 — Golden Patterns & Coach

Find a PR where the Coach section references a **golden pattern** (look for "GP-" identifiers). Golden patterns are Sara's validated engineering approaches — automatically extracted from ECL success entries with high confidence and zero failures.

When Marcus works on a similar task, the coach doesn't just flag problems — it shows the proven way:

> *"💡 (golden-pattern) Sara's payment processing pattern (GP-004) validates all financial inputs at the route boundary"*

This is compounding intelligence: Sara's best practices automatically guide the rest of the team.

### Minute 9 — Fleet View

**The fleet view shows cross-repo risk detection.** In Arc 7B, a shared dependency update triggers WARN findings across multiple services. The fleet alert system detects the concentration:

- **RISK_SPIKE** alerts fire when WARN rate exceeds thresholds
- **CROSS_REPO_CONCENTRATION** alerts fire when multiple repos hit elevated risk simultaneously
- All detection is deterministic — pattern matching on event streams, not ML models

See the full fleet dashboard at [demo.codeledger.dev](https://demo.codeledger.dev) under the Fleet Insights tab.

### Minute 10 — Decide your next step

You've now seen:
- Real git activity from a synthetic team
- CIC and verify output on every PR
- Phase 2 explainability (explain, learnings, next) — all deterministic
- Truth Control Plane with evidence-graded confidence
- Golden patterns compounding across the team
- Fleet-level risk detection
- The dashboard that visualizes it all
- The narrative of a team that failed and recovered

If you want to go deeper, three options:

1. **Book a 30-minute walkthrough** — we'll run the Sandbox Lane live against your choice of scenario and answer questions → **https://codeledger.dev/demo**
2. **Try CodeLedger on your own repo** — instructions at **https://codeledger.dev/install**
3. **Read the engineering overview** (7 pages, no fluff) → **[CodeLedger Overview](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md)**

## The story arcs

The team's history is structured as seven story arcs. You're probably seeing one of them "live" right now depending on where the cron has advanced to:

| Arc | What happens | What CodeLedger does |
|-----|--------------|---------------------|
| 1. Clean Baseline | Team ships cleanly. Memory builds up. | High CIC pass rates. Architecture map stabilizes. |
| 2. Sprint Squeeze | Q4 deadline. Marcus cuts corners. | WARN events begin. 2 Lessons Ledger entries created. |
| 3. **The Incident** | Priya's AI-generated auth refactor. | Release Authority BLOCKS the deploy. |
| 4. The Reckoning | Team debriefs. Sara tightens guardrails. | Architecture map corrected. |
| 5. Recovery | Priya climbs from 54% → 71% CIC pass rate. | Positive trend visible in dashboard. |
| 6. Clean Release | v2.4.1 ships with `ready_hardened` state. | First clean release in 6 weeks. |
| 7A. Golden Patterns | Sara's clean billing PRs create validated patterns. | Pattern promoted to golden status, referenced in Marcus's next PR. |
| 7B. Fleet Alerts | Dependency update spikes WARN rate across repos. | Cross-repo RISK_SPIKE alert with severity HIGH. |
| 7C. Truth Control Plane | Release cycle truth grade progression. | Continuous truth loop: C→B→A with evidence chain. |
| 7D. Post-Incident Intelligence | Explain/learnings/next after Priya's incident fix. | Phase 2 explainability: deterministic post-mortem, pattern analysis, action recommendations. |
| 7E. Coach Guidance | Marcus gets implementation advice from symbol graph. | Evidence-cited plan with golden pattern references and ECL history. |
| 7F. Shadow Validation | Sara refactors the scoring pipeline and validates with shadow. | Parallel truth evaluation: 96% match, 0% critical, SAFE TO EXPAND. |
| 7G. Doctrine Block | Priya tries to build a parallel billing dashboard. | Two-phase stop triggered. Guided to extend existing system instead. |
| 7H. Release Verify | Team catches stale standalone bundle before v2.5.0. | SHA256 mismatch detected. Feature propagation completed before release. |
| 7I. Integrity Trinity | Full integrity check passes across all three domains. | Architecture PASS, Implementation PASS, Release PASS. Ships with evidence. |
| 7J. Agent Performance | VP reviews per-agent scorecard on the dashboard. | Claude Code 89% FPS vs Cursor 76%. Deterministic, not vibes. |

## What you're NOT seeing

Things the demo deliberately leaves out:

- **Your code.** None of this is your repo. It's a synthetic monorepo ([see the structure](services/)).
- **Fake data.** Every metric in the dashboard is derived from actual CodeLedger output against real CI runs — or from deterministic fixtures clearly labeled as such in demo mode.
- **LLM hand-waving.** Every score, every decision, every "block" verdict is a pure function you can read in [`packages/engine/src/graph/calculators.ts`](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/packages/engine/src/graph/calculators.ts) in the CodeLedger source. No model in the hot path. Phase 2 explainability (explain, learnings, next) and the Cross-Layer Coach are also fully deterministic — derived from ECL ledger history and scoring signals.
- **Stale analysis.** Every truth grade and evidence chain is computed fresh per PR. Truth degrades when evidence is missing and recovers when it arrives.
- **Manual pattern curation.** Golden patterns are extracted automatically from ECL success history. When Sara's PRs consistently pass with high confidence, the pattern is promoted to golden status without human intervention.

## Questions we expect you to ask

**"Could I run this on my own repo?"**
Yes. That's the whole point of CodeLedger. This demo exists so you can see what you'd get before you install it. The product itself is at `github.com/codeledgerECF/codeledger-blackbox`.

**"How is this different from [Sonar/CodeClimate/LGTM/Snyk/etc.]?"**
Those tools score code. CodeLedger scores *changes* and decides whether a specific change is safe to ship *given the history of this repo*. Scoring is deterministic. Decisions are explainable. Memory compounds over time. Read the [CodeLedger Overview](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md) for the full architectural argument.

**"Does it use GPT-4 / Claude / etc.?"**
Not in the hot path. There is no LLM in any scoring decision, Phase 2 analysis, or coach output. The math is in `packages/engine/src/graph/calculators.ts` and is pure functional code. Phase 2 explainability derives patterns from ECL ledger history. The coach fuses symbol graph, local ECL, and institutional ECL — all deterministic. LLMs are what the developer uses to write code — CodeLedger is the verification layer that runs after.

**"What are golden patterns?"**
Validated engineering approaches automatically extracted from ECL success history. When a developer's PRs consistently pass with high confidence (>0.85), zero failure vectors, and 2+ verifications, the pattern is promoted to golden (North Star) status. The coach then references these patterns when other developers work on similar tasks. Sara authors most golden patterns in this demo.

**"What is the Truth Control Plane?"**
A continuous truth assessment system that grades every PR and release on a scale of A–F. The grade reflects evidence freshness: remote state, CI results, worktree cleanliness. Truth degrades when evidence is stale and recovers as evidence accumulates. Every state transition emits a verifiable event. This is how CodeLedger answers "how confident are we that this is safe to ship?"

**"How often does this demo update?"**
Every weekday, 4 times a day, on cron (9am / 11am / 2pm / 4pm Pacific). Plus whenever the sales team manually fires a scenario for a live walkthrough.

**"Can I see the source of the simulator?"**
The simulator is in a private repo (`codeledger-demo/synthetic-reality-engine`). Ask your sales contact for read access if you want to inspect how the demo produces its activity.

## Transparency

This repository is part of a public demonstration system. To be fully clear:

- **All commits are synthetic** — produced by the Synthetic Reality Engine simulator (repo: `codeledger-demo/synthetic-reality-engine`, private) running on GitHub Actions.
- **Sara, Marcus, and Priya are bot accounts** — they use illustrative avatars, not photos of real people.
- **No real customer data** appears anywhere in this system.
- **CodeLedger output in PR comments is real** — it comes from running the actual `codeledger` CLI (v0.10.10, vendored at `.codeledger/bin/`) against this repo in CI.
- **The dashboard** at `demo.codeledger.dev` renders from deterministic fixtures in demo mode, or from real data when connected to a live PostgreSQL instance. The UI is the same either way.

---

*CodeLedger · Intelligent Context AI Inc. · [codeledger.dev](https://codeledger.dev)*
