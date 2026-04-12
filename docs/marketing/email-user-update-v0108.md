# Email: CodeLedger v0.10.8 — What's New

**Subject line options:**
- CodeLedger v0.10.8: your context engine now explains itself
- What changed, what repeats, what to do next — CodeLedger v0.10.8
- CodeLedger v0.10.8 shipped. Here's what it means for your workflow.

**From:** Ash @ CodeLedger
**To:** CodeLedger users

---

Hey,

Quick update — v0.10.8 is live. This one is worth reading because it changes how you interact with CodeLedger after a run.

### The short version

CodeLedger now tells you **why** it produced a result, **what patterns** are emerging across your sessions, and **what to do next** — ranked by confidence. All deterministic. No LLM. Three new commands: `explain`, `learnings`, `next`.

### What's actually new

**Phase 2 Explainability** — three new commands that make the system interrogable.

`codeledger explain` answers: why did this run produce this result? It cites specific evidence ledger entries, verify findings, and scoring signals. If you got a WARN, it tells you exactly which signals contributed and what the confidence breakdown looks like.

`codeledger learnings` answers: what keeps happening? It surfaces recurring patterns from your ECL history — which failure modes repeat, which files are hotspots, which trends are improving or degrading. This is the view that makes engineering managers pay attention.

`codeledger next` answers: what should I do? Ranked actions with confidence scores, each linked to the evidence that supports them. Not generic advice. Specific to your repo, your team's history, your current signals.

All three support `--surface ide` for structured IDE panel output and `--json` for CI integration.

**Truth Control Plane** — continuous truth assessment on every run. You'll see a Truth Grade (A through F) in your session summaries and PR comments. It reflects evidence freshness: is your remote current, has CI run, is the worktree clean. Truth degrades when evidence goes stale and recovers as it accumulates. This is how CodeLedger answers "how confident should I be in this result?"

**Golden Patterns** — `memory seed-patterns` now extracts your team's best practices automatically. When a developer's PRs consistently pass with high confidence, zero failure vectors, and multiple verifications, the pattern is promoted to golden status. The coach then references these patterns when anyone on the team works on a similar task. Your institutional knowledge compounds without meetings.

**Cross-Layer Coach improvements** — `coach --intent` now fuses the symbol graph, local ECL, and institutional ECL to produce evidence-cited implementation plans. Every piece of advice traces back to a specific ledger entry or structural trust rule.

### What you should do

**If you're on the CLI:** Run `codeledger init --force` in your repo to upgrade hooks and vendored state. Your existing memory ledgers and ECL history are preserved.

**After your next meaningful run:** Try `codeledger explain` to see the new output. Then `codeledger next` to see what it recommends.

**If you manage a team:** Run `codeledger learnings --limit 5` to see what patterns are emerging across your contributors. This is the highest-signal view for engineering leads.

**If you use hooks (Claude Code, etc.):** The new commands are wired into the session lifecycle automatically. After git commits, you'll see richer session summaries. The stop hook now includes the Phase 2 recap. No action needed — it just works.

### The living demo

We also shipped a public demo you can share with colleagues who are evaluating CodeLedger. It's a synthetic engineering team — three developers, seven story arcs, real CodeLedger output on every PR.

- **Start here:** [Prospect Guide](https://github.com/codeledger-demo/acme-platform/blob/main/PROSPECT_GUIDE.md) (10-minute walkthrough)
- **Dashboard:** [demo.codeledger.dev](https://demo.codeledger.dev) — includes new Phase 2 panels (Explain, Learnings, Next Actions, Truth Timeline, Golden Patterns)
- **Example PR comment:** [PR #29](https://github.com/codeledger-demo/acme-platform/pull/29) — real v0.10.8 analysis output

If someone on your team asks "what does CodeLedger actually do?" — send them the prospect guide. It takes ten minutes and requires no installation.

### What's coming

- Insight Packs — tiered knowledge packs for prompt coaching (Tier 4 seeded from public patterns, enterprise tiers from your org's history)
- Distribution surfaces — Phase 2 output in Slack, GitHub PR comments, and Atlassian (already in preview)
- Fleet dashboards for multi-repo visibility (team/enterprise tier)

### Version details

```
v0.10.8 — 2026-04-12
  Phase 2: explain, learnings, next (deterministic, IDE panel support)
  Truth Control Plane (continuous truth loop, evidence-graded confidence)
  Golden Patterns (automatic extraction from ECL success history)
  Coach improvements (symbol graph + ECL fusion, evidence-cited plans)
  Intelligence transparency in init, scan, activate, session-summary
  Context certification PLG artifacts
  Evidence-based progress estimates

v0.10.7 — Activation freshness, pattern trust view, refresh command
v0.10.6 — IP protection (npm wrapper distribution, hardened binaries)
```

Upgrade: `codeledger init --force` in your repo, or `npm install -g codeledger` for the global CLI.

---

Thanks for building with CodeLedger. If something in this release breaks your workflow or surprises you, reply to this email — I read every one.

Ash
Intelligent Context AI
