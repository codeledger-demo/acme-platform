# Synthetic Reality Engine — Implementation Plan

**Version:** 1.0 | **Date:** April 5, 2026 | **Status:** Ready for Implementation

---

## Pre-Session Setup (Before Session 1)

### GitHub Organization & Infrastructure

1. **GitHub Org:** Create `codeledger-demo` organization
2. **Bot Accounts:** Create 3 GitHub bot accounts:
   - `sara-chen-acme` — Senior engineer persona
   - `marcus-webb-acme` — Mid-level engineer persona
   - `priya-k-acme` — Junior engineer persona
   - Each needs a PAT (`repo`, `workflow`, `read:org` scopes) stored as org-level secrets

3. **Repositories to Create (empty, initialized):**
   - `acme-platform` (public) — the synthetic monorepo
   - `acme-docs` (public) — supporting docs repo
   - `acme-data-pipeline` (public) — supporting data pipeline repo
   - `synthetic-reality-engine` (private) — simulator + scenario library
   - `demo-dashboard` (private) — prospect dashboard app

4. **Domain & DNS:** Configure `demo.codeledger.dev` → Vercel/Cloudflare Pages
5. **Database:** Provision PostgreSQL (Neon, Supabase, or Railway) with connection pooling
6. **Secrets Strategy:**
   - `SRE_SARA_TOKEN`, `SRE_MARCUS_TOKEN`, `SRE_PRIYA_TOKEN` — GitHub PATs
   - `SRE_CODELEDGER_LICENSE` — CodeLedger license key
   - `DASHBOARD_JWT_SECRET` — for signing invite links
   - `DATABASE_URL` — PostgreSQL connection string
   - All in GitHub Actions secrets on `synthetic-reality-engine`

7. **CodeLedger Installation:** Real CLI (published npm or vendored standalone) runs against `acme-platform`. Never mocked.

---

## Session Dependency Graph

```
Session 1 (Synthetic Repo)
    │
    ▼
Session 2 (Scenario Library) ────┐
    │                             │
    ▼                             ▼
Session 3 (Simulator) ────────▶ Session 4 (Drama Feed)
    │
    ▼
Session 5 (Dashboard Foundation)
    │
    ▼
Session 6 (Screens 1–3)
    │
    ▼
Session 7 (Screens 4–6)
    │
    ▼
Session 8 (Named Incidents)
    │
    ▼
Session 9 (Sandbox Lane)
```

Sessions 3 & 4 can partially parallelize. Sessions 6 & 7 are strictly sequential.

---

## Session 1: Synthetic Repo Scaffold

**Repository:** `acme-platform`
**Phase:** P1 (Weeks 1–2)

### What to Build

A realistic TypeScript monorepo (~40+ files) that compiles cleanly. Must produce meaningful CodeLedger signals (dependency graph, churn, test mapping).

### Directory Structure

```
acme-platform/
  package.json                    # pnpm workspace root
  pnpm-workspace.yaml
  tsconfig.base.json              # ES2022, NodeNext, strict
  .codeledgerignore               # exclude simulator metadata
  .codeledger/                    # initialized via `codeledger init`

  services/
    auth/
      src/
        index.ts                  # Auth service entry
        middleware/
          jwt-verify.ts           # JWT verification
          rate-limit.ts
          session.ts
        routes/
          login.ts
          register.ts
          oauth.ts
          password-reset.ts
        models/
          user.ts
          session.ts
        validators/
          auth-schemas.ts         # Zod schemas
        utils/
          token.ts
          hash.ts
      tests/
        login.test.ts
        jwt-verify.test.ts
        session.test.ts
      package.json
      tsconfig.json

    billing/
      src/
        index.ts
        stripe/
          client.ts               # Stripe client wrapper
          webhooks.ts
        models/
          subscription.ts
          invoice.ts
          plan.ts
        routes/
          subscriptions.ts
          invoices.ts
          checkout.ts
        validators/
          billing-schemas.ts
      tests/
        subscriptions.test.ts
        webhooks.test.ts
      package.json
      tsconfig.json

    notifications/
      src/
        index.ts
        channels/
          email.ts
          slack.ts
          in-app.ts
        templates/
          welcome.ts
          invoice.ts
          alert.ts
        queue/
          processor.ts
        models/
          notification.ts
          preference.ts
      tests/
        email.test.ts
        processor.test.ts
      package.json
      tsconfig.json

    reporting/
      src/
        index.ts
        generators/
          usage-report.ts
          billing-report.ts
          audit-report.ts
        queries/
          usage-queries.ts
          billing-queries.ts
        exporters/
          csv.ts
          pdf.ts
      tests/
        usage-report.test.ts
      package.json
      tsconfig.json

    webhooks/
      src/
        index.ts
        dispatcher.ts
        retry.ts
        models/
          endpoint.ts
          delivery.ts
        validators/
          webhook-schemas.ts
      tests/
        dispatcher.test.ts
        retry.test.ts
      package.json
      tsconfig.json

  packages/
    shared-utils/
      src/
        index.ts
        logger.ts
        errors.ts                 # AppError, ValidationError, etc.
        config.ts
        retry.ts
        date.ts
      tests/
        errors.test.ts
        retry.test.ts
      package.json
      tsconfig.json

    design-tokens/
      src/
        index.ts
        colors.ts
        spacing.ts
        typography.ts
        breakpoints.ts
      package.json
      tsconfig.json

    validation/
      src/
        index.ts
        schemas/
          user.ts
          billing.ts
          webhook.ts
        middleware.ts
      tests/
        schemas.test.ts
      package.json
      tsconfig.json

    api-client/
      src/
        index.ts
        client.ts
        endpoints/
          auth.ts
          billing.ts
          reporting.ts
        types.ts
      tests/
        client.test.ts
      package.json
      tsconfig.json

  apps/
    web/
      src/
        app/
          layout.tsx
          page.tsx
        components/
          dashboard/MetricsCard.tsx, UsageChart.tsx
          auth/LoginForm.tsx, RegisterForm.tsx
          billing/PlanSelector.tsx, InvoiceTable.tsx
          common/Button.tsx, Input.tsx, Modal.tsx
        lib/api.ts
        hooks/useAuth.ts, useBilling.ts
      package.json, tsconfig.json, next.config.js

    admin/
      src/
        App.tsx
        pages/Users.tsx, Billing.tsx, Settings.tsx
        components/UserTable.tsx, AuditLog.tsx
      package.json, tsconfig.json

    mobile/
      src/
        App.tsx
        screens/Login.tsx, Dashboard.tsx, Profile.tsx
        components/MetricCard.tsx
        navigation/index.tsx
      package.json, tsconfig.json

  infra/
    terraform/
      main.tf, variables.tf, outputs.tf
      modules/vpc/main.tf, rds/main.tf, ecs/main.tf
    k8s/
      base/deployment.yaml, service.yaml, ingress.yaml
      overlays/staging/kustomization.yaml, production/kustomization.yaml
    ci/.github/workflows/ci.yml, deploy.yml
```

### Key Technical Decisions

1. **TypeScript strict mode** — `ES2022`, `NodeNext`, `strict: true`, `noUncheckedIndexedAccess: true`
2. **ESM with `.js` extensions** — matches CodeLedger's import scanner convention
3. **Real (minimal) dependencies** — `express`/`fastify`, `zod`, `stripe` (types only), `react`, `next`. Must `pnpm install` successfully.
4. **Cross-package imports** — services import from `packages/` (e.g., `import { AppError } from '@acme/shared-utils'`) to create a real dependency graph
5. **Test files** — follow `**/*.test.*` pattern for CodeLedger's test mapping
6. **File sizes** — key files should be 100–300 lines to exercise CodeLedger's excerpt strategy
7. **`.codeledgerignore`** — exclude `*.scenario.yaml`, `.sre/`, `DRAMA.md`

### Acceptance Criteria

- [ ] `pnpm install && pnpm build` passes with zero errors
- [ ] `codeledger init` succeeds
- [ ] `codeledger scan` produces valid `RepoIndex` with 80+ files, non-trivial `DepGraph`, and test mappings
- [ ] `codeledger activate --task "fix auth JWT validation"` produces bundle with auth files ranked highest
- [ ] All `.ts` files compile under strict mode

### Risks

- Building enough cross-package import edges to make the dependency graph interesting without over-engineering
- Ensuring the repo feels authentic to prospects viewing it

---

## Session 2: Scenario Library v1

**Repository:** `synthetic-reality-engine`
**Phase:** P1–P2

### What to Build

The YAML scenario library — the single source of truth for all simulated activity. 60–100 scenarios covering all 6 story arcs.

### Directory Structure

```
synthetic-reality-engine/
  package.json
  tsconfig.json

  scenarios/
    arc-1-clean-baseline/          # 001–010 (10 scenarios)
    arc-2-sprint-squeeze/          # 020–029 (10 scenarios)
    arc-3-the-incident/            # 030–039 (10 scenarios)
    arc-4-the-reckoning/           # 040–049 (10 scenarios)
    arc-5-recovery/                # 050–059 (10 scenarios)
    arc-6-new-feature/             # 060–069 (10 scenarios)

  schemas/
    scenario.schema.json           # JSON Schema for validation

  templates/
    code/                          # 50+ Handlebars code templates
      ai-refactor-jwt.ts.template
      ai-ghost-token-refresh.ts.template
      clean-service-handler.ts.template
      tech-debt-shortcut.ts.template
      ...
    pr-bodies/
      ai-refactor-pr-body.md.template
      clean-feature-pr-body.md.template
      hotfix-pr-body.md.template
    commit-messages/
      conventional-commits.ts

  src/
    types/
      scenario.ts
      persona.ts
      arc.ts
      drama.ts
    validation/
      validate-scenarios.ts
    personas/
      sara-chen.ts
      marcus-webb.ts
      priya-k.ts
```

### Scenario YAML Schema

```yaml
# Example: scenarios/arc-3-the-incident/031-ai-generated-refactor.yaml
id: "arc3-031-ai-gen-refactor"
arc: 3
arc_name: "The Incident"
sequence: 31
title: "AI-Generated Auth Refactor"
narrative: "Dev3 uses AI to refactor the auth service, introducing ghost files"

persona: "priya-k"

timing:
  day_of_week: [1, 2, 3, 4, 5]
  hour_range: [9, 17]
  delay_after_previous_min: 120
  delay_after_previous_max: 480

commits:
  - message: "refactor(auth): modernize JWT verification pipeline"
    files:
      - path: "services/auth/src/middleware/jwt-verify.ts"
        action: "modify"
        template: "ai-refactor-jwt"
        lines_changed: 45
      - path: "services/auth/src/middleware/token-refresh.ts"
        action: "create"                    # ghost file
        template: "ai-ghost-token-refresh"
        lines_changed: 120

pull_request:
  title: "refactor(auth): modernize JWT verification"
  body_template: "ai-refactor-pr-body"
  labels: ["refactor", "auth", "ai-assisted"]
  reviewers: ["sara-chen-acme"]

  expected_codeledger:                      # descriptive, NOT prescriptive
    cic_outcome: "incomplete"
    cic_ghost_files: ["services/auth/src/middleware/token-refresh.ts"]
    review_intelligence_findings: ["P1:runtime_validation"]
    release_authority: "not_ready"

drama_feed:
  headline: "AI-Generated Auth Refactor Flagged"
  severity: "high"

annotations:
  named_incident: "the-auth-incident"
  incident_phase: "trigger"
  demo_highlight: true
```

### Persona Definitions

```typescript
export const saraChen: PersonaConfig = {
  github_username: 'sara-chen-acme',
  role: 'Senior Engineer',
  coding_style: {
    commit_prefix: 'conventional',
    test_coverage: 'thorough',
    pr_description: 'detailed',
    code_quality: 'high',
    review_thoroughness: 'comprehensive',
  },
  cic_pass_rate_target: 0.97,
  typical_files_per_commit: [2, 6],
  active_hours: [8, 18],
  timezone: 'America/New_York',
};
```

### Key Technical Decisions

1. **YAML over JSON** — more readable for 60–100 scenario files; validated against JSON Schema at build time
2. **`expected_codeledger` is descriptive, not prescriptive** — used by Drama Feed and integration tests, never for mocking
3. **Templates with parameterization** — Handlebars-style placeholders for realistic variation
4. **Arc state machine** — arcs numbered 1–6, cycle. Transitions are deterministic by sequence number.

### Acceptance Criteria

- [ ] All 60+ YAML files validate against JSON Schema
- [ ] `pnpm run validate-scenarios` passes
- [ ] Each scenario has: id, arc, persona, commits, expected_codeledger
- [ ] 3 persona definitions with distinct coding styles
- [ ] Code templates produce valid TypeScript when rendered

### Risks

- 60–100 scenarios is ambitious for one session. Prioritize Arcs 1–3 (30 scenarios), backfill 4–6 in Session 8.
- Template quality — generated TypeScript must compile. Each template needs review.

---

## Session 3: Activity Simulator

**Repository:** `synthetic-reality-engine` (continued)
**Phase:** P2

### What to Build

Node.js service that reads scenarios and executes them against `acme-platform` via GitHub API.

### Directory Structure

```
synthetic-reality-engine/
  src/
    simulator/
      engine.ts                    # Main simulation loop
      scheduler.ts                 # Cron scheduling + timing jitter
      state-machine.ts             # Drama State Machine (arc tracking)
    github/
      client.ts                    # Octokit wrapper with persona switching
      commits.ts                   # Create commits via GitHub API
      pull-requests.ts             # Create/update PRs
      reviews.ts                   # Post PR reviews
      labels.ts
    templates/
      renderer.ts                  # Handlebars template engine
      code-generator.ts            # Generate valid TS from templates
    codeledger/
      runner.ts                    # Execute CodeLedger commands
      cic-trigger.ts               # Trigger CIC after PR creation
      release-trigger.ts
      output-parser.ts
    state/
      store.ts                     # Persistent state (Gist-backed)
      timeline.ts                  # Event timeline for Drama Feed
    config/
      index.ts
      secrets.ts

  .github/
    workflows/
      simulate.yml                 # Cron: 4x/day weekdays
      simulate-manual.yml          # Manual dispatch for testing
      codeledger-integration.yml   # Runs CIC after simulator commits
```

### Core Engine Logic

```typescript
async function runSimulationStep(): Promise<void> {
  const state = await loadState();
  const nextScenario = getNextScenario(state.currentArc, state.lastScenarioId);

  if (!nextScenario) {
    await transitionArc((state.currentArc % 6) + 1);
    return;
  }

  if (!isTimingValid(nextScenario.timing, state.lastExecutedAt)) {
    return; // Too soon, skip this cron tick
  }

  const persona = getPersona(nextScenario.persona);
  const octokit = createOctokitForPersona(persona);

  for (const commit of nextScenario.commits) {
    const renderedFiles = await renderTemplates(commit.files);
    await createCommit(octokit, commit.message, renderedFiles);
  }

  if (nextScenario.pull_request) {
    const pr = await createPullRequest(octokit, nextScenario.pull_request);
    await triggerCodeLedgerWorkflow(pr.number);
  }

  await saveState({ ...state, lastScenarioId: nextScenario.id, lastExecutedAt: new Date().toISOString() });
  await emitTimelineEvent(nextScenario);
}
```

### GitHub Actions Cron Workflow

```yaml
name: Simulate Activity
on:
  schedule:
    - cron: '0 9,11,14,16 * * 1-5'    # 4x/day weekdays
  workflow_dispatch:
    inputs:
      scenario_id:
        description: 'Force a specific scenario'
        required: false
```

### CodeLedger Integration Workflow (in acme-platform)

```yaml
# acme-platform/.github/workflows/codeledger-pr.yml
name: CodeLedger PR Check
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  cic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
      - run: npm install -g codeledger
      - run: codeledger complete-check --task "${{ github.event.pull_request.title }}" --json > cic-result.json
      - run: codeledger verify --json > verify-result.json
      - name: Post CIC results as PR comment
        uses: actions/github-script@v7
```

### State Management

Simulation state stored in a private GitHub Gist:
- `currentArc`, `lastScenarioId`, `lastExecutedAt`
- `personaStats: Record<string, { commits, prs, cicPasses, cicFails }>`
- `arcHistory: Array<{ arc, startedAt, completedAt }>`

### Key Technical Decisions

1. **GitHub Contents/Git Data API** (not `git push`) — avoids cloning; allows persona-specific author attribution
2. **State in Gist** — simplest persistent store; updated atomically via Gist API
3. **Timing jitter** — randomized delay within scenario's `delay_after_previous_min/max` window
4. **CodeLedger runs in `acme-platform` CI** — real output, not in the simulator
5. **`.codeledgerignore` in `acme-platform`** — exclude simulator metadata from CIC

### Acceptance Criteria

- [ ] `pnpm run simulate --dry-run` processes Arc 1 scenarios without hitting GitHub API
- [ ] Manual dispatch creates a commit in `acme-platform` as `sara-chen-acme`
- [ ] CodeLedger CIC runs against resulting PR and produces a real `CompletionRecord`
- [ ] State persists correctly between cron runs
- [ ] Timing jitter produces realistic-looking commit timestamps

### Risks

- GitHub API rate limits (5000 req/hr per token) — budget ~50 calls/step × 4–8 steps/day is well within limits
- GitHub Actions cron delay (5–60 min) — jitter already accounts for this
- Template rendering producing invalid TypeScript — add a build-check step

---

## Session 4: Drama Feed Renderer

**Repository:** `synthetic-reality-engine` (continued)
**Phase:** P2

### What to Build

Auto-updating README section in `acme-platform` between `<!-- DRAMA:START -->` and `<!-- DRAMA:END -->` markers.

### Directory Structure

```
synthetic-reality-engine/
  src/
    drama-feed/
      renderer.ts                  # Main renderer
      headlines.ts                 # Narrative headline generation
      scorecards.ts                # Developer scorecard computation
      badge.ts                     # SVG health badge generation
      readme-updater.ts            # Idempotent README update
    drama-feed/templates/
      headline.md.hbs
      scorecard.md.hbs
      health-summary.md.hbs

  .github/workflows/
    drama-feed.yml                 # Runs after CIC, updates README
```

### README Output Format

```markdown
<!-- DRAMA:START -->
## Living Development Feed

**Current Arc:** Sprint Squeeze (Arc 2)
**Team Health:** 🟡 72/100
**Last Activity:** 3 hours ago

### Recent Headlines
- **[P1] AI-Generated Auth Refactor Flagged** — CIC detected 1 unreferenced file...
- **Marcus Webb hits 7 consecutive WARN PRs** — Sprint debt accumulating...
- **Sara Chen's refactor sprint passes all gates** — v2.4.1: `ready_hardened`...

### Developer Scorecards
| Developer | CIC Pass Rate | PRs (30d) | Trend |
|-----------|--------------|-----------|-------|
| Sara Chen | 97% | 12 | +2% |
| Marcus Webb | 76% | 8 | -4% |
| Priya K | 58% | 6 | +4% |

![Team Health](https://raw.githubusercontent.com/codeledger-demo/acme-platform/main/.github/badges/health.svg)
<!-- DRAMA:END -->
```

### Key Technical Decisions

1. **Idempotency via content hash** — SHA-256 of rendered content; skip commit if identical
2. **`[skip ci]` on feed commits** — prevent triggering CIC on drama feed updates
3. **Timeline data source** — reads simulator timeline events + actual CodeLedger output from `.codeledger/`
4. **Hand-crafted SVG badge** — no external dependencies; CodeLedger theme colors
5. **`workflow_run` trigger** — fires when CIC workflow completes; total delay well under 5 minutes

### Acceptance Criteria

- [ ] README update is idempotent (running twice with no events produces zero commits)
- [ ] Headlines reference real CIC outcomes from `.codeledger/` data
- [ ] Developer scorecards compute from actual CIC history
- [ ] Badge SVG renders correctly in GitHub README preview
- [ ] Feed updates within 5 minutes of CIC completion

### Risks

- GitHub SVG caching (5–10 min delay in preview). Mitigation: cache-busting query parameter.
- Concurrent README updates from simultaneous CIC checks. Mitigation: `concurrency` group in workflow.

---

## Session 5: Dashboard Foundation

**Repository:** `demo-dashboard`
**Phase:** P3

### What to Build

React/Next.js application infrastructure at `demo.codeledger.dev` — auth, data layer, shell. No individual screens yet.

### Directory Structure

```
demo-dashboard/
  package.json
  tsconfig.json
  next.config.ts                       # Next.js 14+ App Router
  tailwind.config.ts

  src/
    app/
      layout.tsx
      page.tsx
      (auth)/invite/[token]/page.tsx   # JWT invite handler
      (dashboard)/
        layout.tsx                     # Dashboard shell
        page.tsx                       # Redirect to /team-health
    lib/
      auth/
        jwt.ts                        # JWT verification (jose)
        middleware.ts                  # Edge middleware
        invite.ts                     # Invite link generation
      db/
        client.ts                     # PostgreSQL client
        schema.sql
        migrations/001-initial.sql
      api/
        codeledger-data.ts
        timeline-queries.ts
        github-data.ts
      sync/
        ecl-sync.ts                   # Sync .codeledger/ → PostgreSQL
        cic-history-sync.ts
        release-history-sync.ts
        lessons-sync.ts
    components/
      shell/
        Sidebar.tsx
        Header.tsx
        TimeWindowSelector.tsx        # 30/60/90/1yr selector
      shared/
        MetricCard.tsx
        TrendBadge.tsx
        LoadingSkeleton.tsx
        ErrorBoundary.tsx
    hooks/
      useTimeWindow.ts
      useRealtimeData.ts
    types/
      dashboard.ts
      codeledger.ts
```

### Database Schema

```sql
CREATE TABLE cic_history (
  id SERIAL PRIMARY KEY,
  run_id TEXT UNIQUE NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL,
  task TEXT NOT NULL,
  completion_state TEXT NOT NULL,
  claim_count INT NOT NULL,
  verified_claim_count INT NOT NULL,
  mismatch_count INT NOT NULL,
  drift_warning_count INT NOT NULL,
  persona TEXT NOT NULL,
  pr_number INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE release_history (
  id SERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL,
  release_state TEXT NOT NULL,
  confidence_score FLOAT NOT NULL,
  finding_count INT NOT NULL,
  p0_count INT NOT NULL,
  p1_count INT NOT NULL,
  version_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  trigger_files TEXT[],
  first_seen TIMESTAMPTZ NOT NULL,
  last_triggered TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ecl_events (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ecl_events_timestamp ON ecl_events(timestamp);

CREATE TABLE health_snapshots (
  id SERIAL PRIMARY KEY,
  ahs FLOAT NOT NULL,
  dri FLOAT NOT NULL,
  eds FLOAT NOT NULL,
  sts FLOAT NOT NULL,
  overall FLOAT NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invite_tokens (
  id SERIAL PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);
```

### JWT Auth

Invite JWTs contain: `{ sub: "prospect-viewer", email, exp, scope: "read-only", iat }`. Edge middleware validates on every `(dashboard)/*` route. All API routes enforce `scope: "read-only"`. No write endpoints exist.

### Data Sync

GitHub Actions cron every 15 minutes fetches `.codeledger/` data from `acme-platform` → inserts into PostgreSQL.

### Key Technical Decisions

1. **Next.js App Router** — server components, edge middleware, API routes. Deploy to Vercel.
2. **PostgreSQL over direct ECL reads** — sub-500ms queries, historical persistence, SELECT-only DB user
3. **CodeLedger design tokens** — adopt serif font, color palette (`#0b6e4f`, `#bc6c25`, `#a23b2a`)
4. **SSE for live updates** — poll every 60s. No WebSocket complexity needed.

### Acceptance Criteria

- [ ] `pnpm dev` starts with auth middleware active
- [ ] `/invite/<valid-jwt>` sets cookie, redirects to dashboard shell
- [ ] Any `/dashboard/*` route without valid cookie redirects to error page
- [ ] Database schema migrates cleanly; sync job populates tables
- [ ] Dashboard shell renders with sidebar + header
- [ ] Load time < 2s on production

---

## Session 6: Dashboard Screens 1–3

**Phase:** P3

### Screen 1 — Team Health Overview

- Overall health score (0–100) with trend
- Per-developer cards: name, CIC pass rate, PR count (30d), trend direction
- 30-day health trend sparkline from `health_snapshots`
- Recent activity feed (last 10 events)

### Screen 2 — CIC History

- Filterable timeline of all CIC checks
- CompletionState badge (green: verified+, amber: implemented/wired, red: incomplete/edited)
- Click to expand: full claim list, drift warnings
- Filters: by persona, completion state, date range

### Screen 3 — Lessons Ledger Feed

- Chronological feed of lessons
- Each card: title, summary, category, severity, trigger count
- Named incident lessons highlighted
- "Wisdom growth" metric: CIC passes attributable to ledger-guided corrections

### Key Technical Decisions

1. **Server Components** for data fetching — no API routes for initial load
2. **CompletionState color mapping** from CodeLedger's type ladder
3. **Time Window Selector** as React context consumed by all screens

### Acceptance Criteria

- [ ] Team Health shows per-developer CIC pass rates matching raw data
- [ ] CIC History loads 100+ entries in < 500ms
- [ ] Lessons feed displays active lessons with correct trigger counts
- [ ] All screens respect time window selector
- [ ] Responsive on mobile

---

## Session 7: Dashboard Screens 4–6

**Phase:** P4

### Screen 4 — Time Horizon Analytics (Flagship View)

The primary screen for engineering managers and VPs.

- **Time Horizon Selector:** 30 Days / 60 Days / 90 Days / 1 Year / Custom range
- **All 6 metric panels refresh per horizon:**
  - CIC Pass Rate Trend (line chart)
  - Drift Suppressed (cumulative count)
  - Lessons Ledger Growth (start vs today)
  - Release Gate Decisions (PASS/BLOCK/WARN counts)
  - Developer Context Scores (start vs today)
  - Architecture Health Delta (+/- indicator)
  - Estimated Risk Exposure Avoided (dollar-framed)
- **Timeline Scrubber:** D3-based horizontal timeline with arc boundaries, draggable
- **Named incident markers** on timeline axis — click to jump and replay
- **"Before CodeLedger / After CodeLedger" toggle** — simulated counterfactual baseline
- ECL-backed time travel — never reconstruct, always query append-only store

### Screen 5 — Architecture Drift Map

- **Service Graph:** D3 force-directed graph (auth, billing, notifications, reporting, webhooks)
- **Drift Overlay:** Color services by CIC pass rate or review intelligence findings
- **File Heatmap:** Click service → treemap of files by churn score
- Auth module glows red during/after Arc 3

### Screen 6 — Release Gate History

- Timeline of `release-check` runs
- `ReleaseState` progression ladder visualization
- Per-release finding breakdown by category
- Confidence scores over time
- "What would have shipped" diff view for BLOCKed releases

### Additional DB Tables

```sql
CREATE TABLE repo_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL,
  dep_graph JSONB NOT NULL,
  file_count INT NOT NULL,
  churn_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_findings (
  id SERIAL PRIMARY KEY,
  finding_id TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT,
  detected_at TIMESTAMPTZ NOT NULL,
  disposition TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Technical Decisions

1. **D3 for scrubber + drift map** — custom interactive visualizations; `'use client'` components
2. **DepGraph sync** — parse CodeLedger scan output, store as JSONB in `repo_snapshots`
3. **Arc boundary detection** — from simulator state file or timeline event annotations

### Acceptance Criteria

- [ ] Timeline scrubber is draggable, updates all charts in < 500ms
- [ ] Drift map renders 5-service graph with edges and color-coded drift
- [ ] Release gate history shows full promotion ladder per release
- [ ] All screens respect global time window selector
- [ ] D3 visualizations responsive on resize

---

## Session 8: Named Incidents & Annotations

**Repositories:** `synthetic-reality-engine` + `demo-dashboard`
**Phase:** P4

### What to Build

#### In `synthetic-reality-engine`:

```
src/
  incidents/
    definitions.ts                 # Named incident definitions
    auth-incident.ts
    sprint-debt-event.ts
    priya-turnaround.ts
    clean-release.ts
  annotations/
    annotator.ts                   # Attach annotations to timeline events
    incident-detector.ts           # Detect when incident arc is active
```

#### 4 Named Incidents:

| Incident | Arc | Key Moment | CodeLedger Feature |
|----------|-----|------------|-------------------|
| The Auth Incident | 3 | Ghost file detected in auth refactor | CIC FAIL + Release Authority BLOCK |
| The Sprint Debt Event | 2–4 | Marcus accumulates 7 WARN PRs | Architecture drift + health score drop |
| The Priya Turnaround | 5 | CIC pass rate climbs 54% → 71% | Positive CIC trend + Context Broker improvement |
| The Clean Release | 6 | v2.4.1 ships clean | Release Authority PASS + health recovery to 91 |

#### In `demo-dashboard`:

```
src/
  app/(dashboard)/incidents/
    page.tsx                       # Incident gallery
    [id]/page.tsx                  # Incident detail view
  components/
    incidents/
      IncidentGallery.tsx
      IncidentTimeline.tsx
      IncidentMoments.tsx
    annotations/
      AnnotationLayer.tsx          # Reusable overlay for any chart
      AnnotationMarker.tsx
      AnnotationTooltip.tsx
```

- Incident detail page: narrative, actual CodeLedger output at each key moment, before/after comparison, lessons encoded, PR links
- Annotation markers appear on Time Horizon scrubber at incident timestamps
- Complete remaining Arcs 4–6 scenario YAML if not done in Session 2

### Acceptance Criteria

- [ ] All 4 named incidents have complete definitions with scenario mappings
- [ ] Incident gallery shows 4 cards with key stats
- [ ] Incident detail shows real CodeLedger output (from DB, not mocked)
- [ ] Annotation markers on Time Horizon timeline at incident timestamps
- [ ] Arcs 4–6 scenarios complete

---

## Session 9: Sandbox Lane

**Repository:** `demo-dashboard`
**Phase:** P5

### What to Build

Prospects trigger real CodeLedger CIC checks against pre-prepared `acme-platform` branches.

```
src/
  app/(dashboard)/sandbox/page.tsx
  app/api/sandbox/
    trigger/route.ts
    status/[id]/route.ts
    result/[id]/route.ts
  components/sandbox/
    ScenarioSelector.tsx
    SandboxRunner.tsx
    SandboxResult.tsx
    CompletionLadder.tsx
    DiffPreview.tsx
  lib/sandbox/
    executor.ts
    scenarios.ts
    rate-limiter.ts
```

### Pre-Prepared Branches

In `acme-platform`, create branches:
- `sandbox/auth-ghost-files` — produces CIC `incomplete` (ghost file detection)
- `sandbox/clean-feature` — produces CIC `verified` (clean pass)
- `sandbox/release-block` — produces Release Authority `not_ready`

### Flow

1. Prospect selects scenario → 2. API dispatches GitHub Actions workflow on pre-prepared branch → 3. Dashboard polls status every 2s → 4. Result displays with completion ladder visualization

### Rate Limiting

```sql
CREATE TABLE sandbox_runs (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  workflow_run_id BIGINT,
  status TEXT DEFAULT 'pending',
  result JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

Max 10 runs/day per invite token. Cache results for 1 hour.

### Key Technical Decisions

1. **GitHub Actions as sandbox runtime** — isolation, no server infra, ~10s startup + ~5s CIC = < 15s total
2. **Pre-prepared branches** (not dynamic) — reproducible results, no temporary worktree complexity
3. **Result caching** — if scenario ran within last hour, return cached result
4. **Concurrent limit** — max 3 simultaneous dispatches

### Acceptance Criteria

- [ ] Prospect selects scenario and triggers CIC check
- [ ] Progress indicator shows while check runs
- [ ] Result displays within 15 seconds
- [ ] Result shows real CodeLedger CIC output (CompletionRecord, claims, mismatches)
- [ ] Completion ladder visualization correct
- [ ] Rate limiter blocks after 10 runs/day
- [ ] Cached results return instantly

---

## Cross-Cutting Concerns

### Bootstrap / Seed Script

Before demo readiness, a bootstrap script must:
- Run simulator in fast-forward mode (all Arcs 1–6 immediately)
- Sync all CodeLedger output to PostgreSQL
- Seed named incident data
- Create sandbox branches

### Monitoring

- Uptime monitoring on `demo.codeledger.dev` (Checkly/UptimeRobot)
- GitHub Actions failure alerts (Slack webhook)
- Database query performance monitoring

### Security

- JWT tokens: HS256, >= 256-bit secret, 7/14 day expiry
- All API routes validate JWT before processing
- No mutation endpoints in dashboard
- Bot PATs scoped to minimum permissions
- `.env` never committed

### Cycle Management

When Arc 6 completes, simulator loops to Arc 1:
- Increment `cycle_count` in state
- Reset persona stats (keep historical data)
- `[Cycle N]` prefix on Drama Feed headlines

---

## Hard Implementation Constraints (Pass to Every Session)

1. The Scenario Library is the single source of truth — the simulator must never generate activity outside defined scenarios
2. All CodeLedger output is real — never mock or stub CIC results, Lessons Ledger entries, or Release Authority decisions
3. The Drama Feed README update must be idempotent — running twice must not duplicate content
4. The Timeline Scrubber must query the ECL append-only store — never reconstruct historical state
5. Bot persona credentials must never appear in committed code — always GH Actions secrets
6. The dashboard must enforce read-only at the query layer — no write endpoints exposed
7. The acme-platform codebase must use TypeScript and be syntactically valid at all times
8. Simulator commits are excluded from CodeLedger CIC processing via `.codeledgerignore`

---

## Critical Reference Files in CodeLedger Product

When implementing, reference these files for type/API compatibility (read-only, never modify):

| File | Purpose |
|------|---------|
| `packages/types/src/index.ts` | All type definitions (CompletionRecord, CompletionState, ReleaseState, LessonsLedger, etc.) |
| `packages/cli/src/completion-integrity/types.ts` | CIC internal types for dashboard display |
| `packages/cli/src/release-check/engine.ts` | Release Authority model for scenario triggers + dashboard |
| `packages/insight-ui/src/theme.ts` | Design system (CSS vars, fonts, colors) for dashboard consistency |

---

## Phase → Session Mapping

| Phase | Sessions | Timeline | Deliverable |
|-------|----------|----------|-------------|
| P1 | 1, 2 | Weeks 1–2 | Synthetic repo + scenarios, CodeLedger running |
| P2 | 3, 4 | Weeks 3–4 | Simulator operational, Drama Feed live |
| P3 | 5, 6 | Weeks 5–6 | Dashboard MVP (Health, CIC, Lessons) |
| P4 | 7, 8 | Weeks 7–8 | Time Horizon Analytics, Drift Map, Named Incidents |
| P5 | 9 | Weeks 9–10 | Sandbox Lane |
