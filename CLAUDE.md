# Project

## CodeLedger Integration

This repo uses [CodeLedger](https://github.com/codeledgerECF/codeledger-blackbox) for deterministic context selection.
CodeLedger is a **real CLI tool** — not a prompt technique. All commands must run in a real shell.

### Activate Before Every Task

Before starting ANY task, run activate first. This selects the most relevant files for the task.

```bash
npx codeledger activate --task "one-line description of the task"
```

Then read `.codeledger/active-bundle.md` — prioritize files listed there.

### Core Rules

1. **Execute via shell** — never simulate, fabricate, or approximate CodeLedger output. If a command fails, say so.
2. **Verify results** — check exit codes. Show errors to the user. Suggest `npx codeledger init` for missing config.
3. **`.codeledger/` is read-only** — never create/edit files there. Use CLI commands instead (`activate`, `session-progress`, `session-summary`).

### Mid-Session Commands

| Command | When to use |
|---------|-------------|
| `npx codeledger progress-check` | After completing a stage — see bundle coverage |
| `npx codeledger refine --learned "..."` | When you discover new context or task shifts |
| `npx codeledger review-coverage` | Mid-review — check which bundle files are unread |

### All Commands

`activate`, `scan`, `bundle`, `refine`, `progress-check`, `session-progress`, `session-summary`,
`review-coverage`, `doctor`, `verify`, `manifest`, `intent`, `checkpoint`, `setup-ci`, `vendor`

Run `npx codeledger help` for details on any command.

**Trigger phrases:** If the user asks for a "session summary" or "how did the bundle do" — run `npx codeledger session-summary`. Do not construct the output yourself.

### Hooks (Automatic)

Hooks in `.claude/hooks.json` run automatically: bundle on session start, recall/precision on commit, progress snapshot before compaction, recap on session end.

### Multi-Session

If `CODELEDGER_SESSION` is set, pass `--session $CODELEDGER_SESSION` to commands.
Session bundle: `.codeledger/sessions/{session-id}/active-bundle.md`.
