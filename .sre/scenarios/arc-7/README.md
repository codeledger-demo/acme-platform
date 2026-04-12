# Arc 7: Feature Showcase

Arc 7 exercises CodeLedger v0.10.8 capabilities through five sub-scenarios. Unlike Arcs 1-6 which tell a linear story, Arc 7 scenarios are independent and can run in any order.

## Scenarios

| ID | Name | Key Feature | Actors |
|----|------|-------------|--------|
| 7A | Golden Patterns | Pattern promotion + coach references | Sara → Marcus |
| 7B | Fleet Alerts | Cross-repo risk-spike detection | Marcus (trigger) |
| 7C | Truth Control Plane | Truth grade progression C→B→A | Sara (release) |
| 7D | Phase 2 Explainability | explain/learnings/next post-incident | Priya (fix) |
| 7E | Coach Implementation | Evidence-cited implementation plan | Marcus |

## Dependencies

```
7A: none (self-contained, creates golden pattern state)
7B: none (self-contained, uses seeded fleet manifest)
7C: none (self-contained, uses seeded ECL state)
7D: requires Arc 3 incident to have run (references Priya's auth incident)
7E: requires 7A to have run (references golden patterns in coach output)
```

## Execution

Each scenario is a YAML file consumed by the Synthetic Reality Engine. The SRE:
1. Reads the scenario steps
2. Executes bot actions (commits, PRs, comments) via GitHub API
3. Runs CodeLedger CLI commands and captures output
4. Posts captured output as PR comments or GitHub issues
5. Updates the Living Development Feed in README.md

## Expected PR Comment Format

All scenarios produce PR comments using the v0.10.8 composite format:
- Context Certification (ISC + CCS score bars + Truth Grade)
- Top Findings table
- Expandable Phase 2 sections (Explain, Next Actions, Coach)

See `.github/fixtures/example-pr-comment.md` for the full template.
