# Acme Platform — Deployment Setup

This document covers setting up `acme-platform` as a real GitHub repository under the `codeledger-demo` organization, configuring CI, and connecting it to the Synthetic Reality Engine simulator.

## Prerequisites

- GitHub organization `codeledger-demo` (or your chosen org name)
- A Personal Access Token with `repo` and `workflow` scopes for repo creation
- The `gh` CLI installed and authenticated, OR access to the GitHub web UI
- Local clones of all 3 SRE repos (acme-platform, synthetic-reality-engine, demo-dashboard)

## 1. Create the GitHub Repository

```bash
gh repo create codeledger-demo/acme-platform \
  --public \
  --description "CodeLedger demo: synthetic engineering team monorepo" \
  --homepage https://demo.codeledger.dev
```

Or via the UI:
- Owner: `codeledger-demo`
- Name: `acme-platform`
- Visibility: Public
- Initialize: empty (we'll push our local commits)

## 2. Push the Local Commits

```bash
cd /path/to/acme-platform
git remote add origin git@github.com:codeledger-demo/acme-platform.git
git branch -M main
git push -u origin main
```

## 3. Create Bot Persona Accounts

Create three GitHub accounts (or GitHub App installations) to act as the personas:

| Persona | GitHub Username | Role |
|---------|----------------|------|
| Sara Chen | `sara-chen-acme` | Senior Engineer, 97% CIC pass |
| Marcus Webb | `marcus-webb-acme` | Mid-Level Engineer, 76% CIC pass |
| Priya K | `priya-k-acme` | Junior Engineer, 54% CIC pass |

For each account:
1. Sign up at github.com with a unique email
2. Add a clearly illustrative avatar (per PRD §10.2 transparency requirement)
3. Set the bio to: "Bot persona for the CodeLedger demo engineering team"
4. Generate a Personal Access Token with `repo`, `workflow`, `read:org` scopes
5. Invite the bot to the `codeledger-demo` org as a member with write access to `acme-platform`

## 4. Install the CodeLedger PR Check Workflow

The workflow is already in `.github/workflows/codeledger-pr.yml` and runs on every PR. No action needed beyond pushing the repo.

## 5. Configure CodeLedger

The simulator triggers `codeledger complete-check` and `codeledger verify` via GitHub Actions. Make sure the CodeLedger CLI is installable in CI:

- Either: publish CodeLedger to npm and let `npm install -g codeledger` work
- Or: add a vendored CLI binary to the repo and update the workflow to use it

The workflow file is at `.github/workflows/codeledger-pr.yml`.

## 6. Connect to the Simulator

Once acme-platform is live on GitHub:

1. In `synthetic-reality-engine` repo, set the secret:
   ```
   ACME_REPO=codeledger-demo/acme-platform
   ```
2. Add the bot persona PATs as secrets in `synthetic-reality-engine`:
   ```
   SRE_SARA_TOKEN=ghp_...
   SRE_MARCUS_TOKEN=ghp_...
   SRE_PRIYA_TOKEN=ghp_...
   ```
3. Enable GitHub Actions on `synthetic-reality-engine`. The cron in `simulate.yml` will fire 4x/day on weekdays.

## 7. Verify the End-to-End Chain

After the first cron run:
1. Check `synthetic-reality-engine` Actions tab for a green "Simulate Activity" run
2. Check `acme-platform` for a new PR opened by one of the bot personas
3. Check that `codeledger-pr.yml` ran on the PR and posted a comment
4. Check that `drama-feed.yml` triggered after `codeledger-pr.yml` completed
5. Verify acme-platform's README was updated between the `<!-- DRAMA:START -->` and `<!-- DRAMA:END -->` markers

## Transparency Requirements (PRD §10.2)

The README already includes the synthetic-demo notice. Make sure:
- Bot accounts have illustrative avatars (not photos of real people)
- Bot bios clearly identify them as demo accounts
- The README transparency notice stays at the top, above the Drama Feed

## Troubleshooting

**No commits appearing**: Check that all 3 `SRE_*_TOKEN` secrets are set in `synthetic-reality-engine` and that `ACME_REPO` env var is correct.

**CodeLedger PR Check failing**: The `npm install -g codeledger` step may fail if the package isn't published. Switch to a vendored binary or a published package.

**Drama feed not updating**: Check that `drama-feed.yml`'s `workflow_run.workflows` list matches the exact name of `codeledger-pr.yml` (the `name:` field at the top).

## Related

- `synthetic-reality-engine/SETUP.md` — simulator deployment
- `demo-dashboard/SETUP.md` — dashboard deployment
