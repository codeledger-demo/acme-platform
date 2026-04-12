# CodeLedger Demo Video Script
## Target: NotebookLM Audio/Video → LinkedIn
## Audience: Developers & Engineering Managers
## Tone: Conversational, credible, no hype. Two hosts discovering something real.
## Length: ~4-5 minutes

---

### OPENING

Imagine you're reviewing a pull request from a junior developer on your team. The code looks fine. The tests pass. Your mid-level engineer approved it during a sprint crunch. You merge it.

Three days later, production auth is broken. Turns out the AI-assisted refactor introduced a file that nothing imports — a ghost file. The tests passed because they were testing the old code path. The reviewer missed it because the diff looked clean.

Now imagine a system that would have caught that — not with another AI model guessing at code quality, but with deterministic math. No LLM in the scoring loop. Just graph analysis, git history, and a memory that compounds over time.

That's CodeLedger. And we built a living demo so you can see exactly what it does before you install anything.

---

### THE DEMO — WHAT YOU'RE LOOKING AT

So here's what's different about this demo. It's not a sandbox. It's not a video walkthrough of someone else's repo. It's a real GitHub repository with three synthetic developers — Sara, Marcus, and Priya — who open pull requests every weekday. Real commits. Real CI pipeline. Real CodeLedger analysis on every PR.

Sara is the senior engineer. Ninety-seven percent of her completions pass integrity checks. She writes tests first. Her patterns are so consistent that CodeLedger automatically extracts them as golden patterns — validated approaches the rest of the team can reference.

Marcus is solid most of the time. Mid-level. But when the sprint burns, he cuts corners. Skips runtime validation. The system catches it and shows him exactly how Sara handled the same problem.

Priya is junior. She leans on AI code completion. Her pass rate starts at fifty-four percent. But here's the thing — you can watch her improve over time. The system tracks that trajectory. By the end of the story arc, she's at seventy-one percent and climbing.

---

### WHAT CODELEDGER ACTUALLY DOES ON EACH PR

Every pull request in the demo gets a CodeLedger analysis comment. And it's not a basic lint report. It has four layers.

First — Context Certification. Two scores: Intent Sufficiency and Context Confidence. These tell you whether the task description was clear enough and whether the system had enough context to evaluate the change. Visual score bars, zero to one, fully deterministic.

Second — a Truth Grade. A through F. This answers: how confident are we in the evidence behind this analysis? Is the remote fresh? Has CI run? Is the worktree clean? Truth degrades when evidence is missing and recovers when it arrives.

Third — Top Findings. Severity-ranked, with the specific module and an evidence-cited description. Not vibes. Not suggestions. Traceable signals.

And fourth — three expandable sections that are new in this release. Run Explanation tells you why the analysis produced this result, citing specific entries from the evidence ledger. Next Actions ranks what you should do, with confidence scores. And the Coach section gives you an ordered implementation plan that references golden patterns and structural trust rules.

Every single number in that comment is a pure function. You can read the source code that produces it. There is no language model in the scoring path.

---

### THE COMPOUNDING EFFECT

Here's what gets engineering managers' attention. This isn't a static tool. It learns.

When Sara's billing PRs consistently pass with high confidence, the system automatically promotes her approach to golden pattern status. The next time Marcus works on a similar billing task and skips validation, the coach doesn't just flag the problem — it shows Sara's validated pattern as the proven way to do it. That's compounding intelligence. The team's best practices propagate without meetings, without wikis, without tribal knowledge that walks out the door.

The evidence ledger tracks outcomes across sessions. Patterns emerge: this file is a hotspot, this developer has a recurring gap in this area, this type of change has failed three times in the last month. All of that feeds back into scoring. The system gets sharper the more you use it.

---

### FLEET-LEVEL AWARENESS

For engineering managers running multiple repos — the demo also shows fleet-level risk detection. When a shared dependency update causes warning spikes across services, CodeLedger fires a risk alert. Not from a machine learning model. From deterministic pattern matching on event streams. You can see which repos are affected, what the blast radius looks like, and what the concentration risk is across your organization.

---

### THE TRUTH CONTROL PLANE

One more thing worth seeing. The Truth Timeline shows how confidence evolves through a release cycle. Sara's release prep starts at a C grade — stale remote, no CI evidence. She pushes. Grade improves to B. CI passes. Grade reaches A. Every state transition is a verifiable event with an evidence chain. This is how CodeLedger answers the question every engineering leader asks before a deploy: how confident are we that this is safe to ship?

---

### CLOSING

So — the demo is live. Three synthetic developers. Seven story arcs. Real CodeLedger output on every pull request. A dashboard with twenty pages of metrics, from team health to golden patterns to fleet risk alerts.

It takes about ten minutes to understand what CodeLedger does by looking at it. No signup. No sales call required.

The prospect guide walks you through it step by step. Link is in the post.

And if you want to run it on your own repo after — that takes about sixty seconds.

---

## LINKS FOR POST

- **Demo repo (start here):** https://github.com/codeledger-demo/acme-platform/blob/main/PROSPECT_GUIDE.md
- **Live dashboard:** https://demo.codeledger.dev
- **Example PR comment:** https://github.com/codeledger-demo/acme-platform/pull/29
- **Install on your repo:** https://codeledger.dev/install
