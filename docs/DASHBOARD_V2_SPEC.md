# Dashboard v2 Specification — demo.codeledger.dev

> Upgrade spec for the demo dashboard to showcase CodeLedger v0.10.8 features.

## Overview

The dashboard needs 7 new components to reflect v0.10.8 capabilities: three Phase 2 panels, a Release Truth timeline, Fleet Alerts view, Context Certification badges, and a Golden Patterns view. Existing panels (CIC History, Developer Scorecards, Named Incidents) remain unchanged.

---

## 1. New Panels

### 1.1 Phase 2: Explain Panel

**Data source:** `ExplainModel` JSON from `codeledger explain --json`

**Layout:**
- Card with outcome status badge (PASS/WARN/BLOCK)
- Collapsible "Why" section with bullet reasons
- "Evidence" section with key-value pairs (label → value with source attribution)
- "Context Analysis" section with ISC/CCS gauge visualizations

**Design:** Uses the `InsightPanelModel` structure — sections with `id`, `title`, `kind`, `summary`, `bullets`, `kv` pairs. Each section renders independently.

**Interaction:** Click any evidence item to drill into the ECL entry or verify finding it references.

### 1.2 Phase 2: Learnings Panel

**Data source:** `LearningsModel` JSON from `codeledger learnings --json`

**Layout:**
- Pattern cards showing: name, occurrence count, success rate bar, trend arrow, hotspot files
- Window label (e.g., "Last 30 days") displayed in header

**Design:** Grid of pattern cards, sortable by occurrence count / confidence / trend direction. Trend arrows: ↑ improving (green), → stable (gray), ↓ degrading (red).

**Interaction:** Click pattern card to see full history, contributing ECL entries, and linked PRs.

### 1.3 Phase 2: Next Actions Panel

**Data source:** `NextModel` JSON from `codeledger next --json`

**Layout:**
- Ranked list of action cards
- Each card: title, confidence score bar (10-segment), "Based on" references, expected impact badge

**Design:** Priority queue visual — highest confidence first, visual weight decreases down the list.

**Interaction:** Click action to see full rationale, evidence links, and suggested implementation.

---

## 2. Release Truth Timeline

**Data source:** `.codeledger/ecl.jsonl` entries filtered to release truth events

**Layout:**
- Horizontal timeline with event dots colored by type:
  - `VERIFY_RUN` = blue
  - `TRUTH_SNAPSHOT` = green
  - `EVIDENCE_CAPTURED` = gray
  - `RISK_ALERT` = red
  - `HOTSPOT_OBSERVED` = orange
- Swimlane per event type for dense periods
- Divergence chart below: ahead/behind counts over time

**Design:** Zoomable timeline with 1h / 1d / 7d / 30d range selector. Current truth grade displayed prominently at right edge.

**Interaction:** Click event dot to see full evidence payload, truth grade, and linked commit SHA.

---

## 3. Fleet Alerts View

**Data source:** `codeledger fleet alerts --json`

**Layout:**
- Alert cards with severity badge:
  - `CRITICAL` = red badge
  - `HIGH` = orange badge
  - `MEDIUM` = yellow badge
  - `LOW` = gray badge
- Alert type label, affected repo chips, timestamp

**Alert types:**
- `RISK_SPIKE` — WARN rate exceeds threshold
- `EVIDENCE_HEALTH_DROP` — test evidence rate drops
- `HOTSPOT_ESCALATION` — hotspot count exceeds threshold
- `CROSS_REPO_CONCENTRATION` — multiple repos at elevated risk simultaneously

**Design:** Feed-style layout, newest first. Repo tag chips link to per-repo detail view.

**Interaction:** Click alert to see affected repos, contributing findings, recommended remediation.

---

## 4. Context Certification Badge

**Data source:** ISC + CCS scores from `codeledger verify --json`

**Layout:** Compact inline badge:
```
ISC ████████░░ 0.82 | CCS ██████░░░░ 0.64 | Truth: B
```

**Placement:** PR overview card in the PR list view, and PR detail header.

**Color coding:**
- Green: score > 0.85
- Yellow: 0.65 ≤ score ≤ 0.85
- Red: score < 0.65

**Score bar renderer:** 10-segment bar using filled (█) and empty (░) block characters, or equivalent SVG rectangles for the web dashboard.

---

## 5. Golden Patterns View

**Data source:** `.codeledger/memory/golden-patterns.json`

**Layout:**
- Pattern cards showing:
  - Label and description
  - Author avatar + name
  - Confidence score bar
  - Verification count badge
  - Keyword tags
  - Typical files list
  - "Extracted from" source attribution

**Design:** Grid with search/filter by keyword, author, domain. Cards have subtle gold accent border.

**Interaction:** Click pattern to see:
- Full ECL history (contributing success entries)
- PRs where this pattern was referenced by coach
- Verification timeline

---

## 6. Updated Developer Scorecards

Add to each developer card:

| Metric | Description |
|--------|-------------|
| Golden Patterns Authored | Count of GP- entries attributed to this developer |
| Phase 2 Action Completion Rate | % of recommended next actions that were followed in subsequent PRs |
| Truth Grade Average | Average truth grade across their PRs (A=4, B=3, C=2, D=1, F=0) |
| Coach Compliance Rate | % of coach suggestions that appear in the final diff |

---

## 7. Data Contracts

### Phase 2 Panel Data

```typescript
interface ExplainPanelData {
  outcome: { status: 'PASS' | 'WARN' | 'BLOCK'; summary: string };
  why: Array<{ reason: string; evidence_id?: string }>;
  evidence: Array<{ label: string; value: string; source: string }>;
  contextAnalysis: {
    isc: number;  // 0-1
    ccs: number;  // 0-1
    truthGrade: string;  // A-F
  };
  confidenceBreakdown: Record<string, number>;
}

interface LearningsPanelData {
  windowLabel: string;  // e.g., "Last 30 days"
  topPatterns: Array<{
    name: string;
    occurrences: number;
    successRate: number;  // 0-1
    trend: 'improving' | 'stable' | 'degrading';
    hotspotFiles: string[];
  }>;
  recommendations: string[];
}

interface NextPanelData {
  actions: Array<{
    title: string;
    confidence: number;  // 0-1
    basedOn: string[];
    expectedImpact: string;
  }>;
}
```

### Release Truth

```typescript
interface TruthTimelineEvent {
  id: string;
  type: 'VERIFY_RUN' | 'TRUTH_SNAPSHOT' | 'EVIDENCE_CAPTURED'
      | 'RISK_ALERT' | 'HOTSPOT_OBSERVED';
  timestamp: string;  // ISO 8601
  commit_sha: string;
  truth_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  details: Record<string, unknown>;
}
```

### Fleet Alerts

```typescript
interface FleetAlert {
  id: string;
  type: 'RISK_SPIKE' | 'EVIDENCE_HEALTH_DROP'
      | 'HOTSPOT_ESCALATION' | 'CROSS_REPO_CONCENTRATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  repos: string[];
  timestamp: string;  // ISO 8601
  message: string;
  details: Record<string, unknown>;
}
```

### Golden Patterns

```typescript
interface GoldenPatternCard {
  id: string;       // e.g., "GP-004"
  label: string;
  description: string;
  author: string;   // GitHub username
  confidence: number;  // 0-1
  verifications: number;
  keywords: string[];
  typicalFiles: string[];
  extractedFrom: string;  // ECL source attribution
}
```

### Context Certification

```typescript
interface ContextCertificationBadge {
  isc: number;         // 0-1
  isc_status: 'SUFFICIENT' | 'WEAK' | 'INSUFFICIENT';
  ccs: number;         // 0-1
  ccs_status: 'CERTIFIED' | 'NEEDS_ATTENTION' | 'LOW';
  truth_grade: string; // A-F
  truth_summary: string;
}
```

---

## 8. Migration Path

### Step 1: Feature-flagged tabs
Add new panels as tabs behind a `v2` feature flag. Existing panels remain default.

### Step 2: Data ingestion
Update the data layer to consume new JSON artifact shapes:
- Parse `ExplainModel`, `LearningsModel`, `NextModel` from CI artifacts
- Ingest `.codeledger/ecl.jsonl` for truth timeline events
- Read `.codeledger/memory/golden-patterns.json` for pattern cards

### Step 3: Incremental rollout
1. Phase 2 panels (Explain, Learnings, Next) — highest demo impact
2. Context Certification badges on PR cards
3. Golden Patterns view
4. Release Truth timeline
5. Fleet Alerts view
6. Updated developer scorecards

### Step 4: Promote v2
Remove feature flag, make v2 panels the default view. Keep existing panels as-is.

---

## 9. Demo Mode vs Live Mode

| Panel | Demo Mode (fixture path) | Live Mode (API endpoint) |
|-------|--------------------------|--------------------------|
| Explain | `.github/fixtures/example-explain.json` | `codeledger serve` → `/api/explain/latest` |
| Learnings | `.github/fixtures/example-learnings.json` | `codeledger serve` → `/api/learnings` |
| Next | `.github/fixtures/example-next.json` | `codeledger serve` → `/api/next` |
| Truth Timeline | `.codeledger/ecl.jsonl` (committed fixtures) | `codeledger serve` → `/api/truth/timeline` |
| Fleet Alerts | `.github/fixtures/example-fleet-alerts.json` | `codeledger fleet alerts --json` |
| Golden Patterns | `.codeledger/memory/golden-patterns.json` | `codeledger serve` → `/api/patterns/golden` |
| Certification | Derived from verify fixture | `codeledger verify --json` |

In demo mode, the dashboard reads committed JSON fixtures from the repo. In live mode, it queries the `codeledger serve` HTTP API or runs CLI commands directly.

---

## 10. Priority Order

| Priority | Component | Rationale |
|----------|-----------|-----------|
| P0 | Context Certification badges | Visible on every PR card — immediate visual impact |
| P0 | Phase 2: Explain panel | Core value prop — "why did this happen?" |
| P1 | Phase 2: Next Actions panel | Actionable — "what should I do?" |
| P1 | Golden Patterns view | Compounding intelligence — key differentiator |
| P1 | Phase 2: Learnings panel | Pattern visibility |
| P2 | Release Truth timeline | Deep trust visualization |
| P2 | Fleet Alerts view | Enterprise feature showcase |
| P3 | Updated developer scorecards | Enhancement to existing panel |
