#!/usr/bin/env node

// Build a composite CodeLedger PR comment from multiple JSON analysis artifacts.
// Usage: node build-pr-comment.mjs --verify <path> --truth <path> --explain <path>
//        --next <path> --coach <path> --pr-title <title> --out <path>

import { readFileSync, writeFileSync } from 'node:fs';

// --- Argument parsing ---

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const verifyPath  = getArg('verify');
const truthPath   = getArg('truth');
const explainPath = getArg('explain');
const nextPath    = getArg('next');
const coachPath   = getArg('coach');
const prTitle     = getArg('pr-title') || 'Unknown PR';
const prAuthor    = getArg('pr-author') || 'unknown';
const prBranch    = getArg('pr-branch') || 'unknown';
const outPath     = getArg('out') || 'codeledger-pr-body.md';

// --- Helpers ---

function loadJSON(path) {
  if (!path) return null;
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function scoreBar(score) {
  if (typeof score !== 'number' || isNaN(score)) return '`░░░░░░░░░░` —';
  const filled = Math.round(Math.max(0, Math.min(1, score)) * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return `\`${bar}\` ${score.toFixed(2)}`;
}

function statusIcon(level) {
  if (level === 'pass' || level === 'PASS') return '✅';
  if (level === 'warn' || level === 'WARN') return '⚠️';
  if (level === 'fail' || level === 'FAIL' || level === 'block' || level === 'BLOCK') return '🛑';
  return '🔎';
}

function severityLabel(sev) {
  if (sev === 'P0' || sev === 'p0') return '**🔴 P0**';
  if (sev === 'P1' || sev === 'p1') return '**🟠 P1**';
  if (sev === 'P2' || sev === 'p2') return '**🟡 P2**';
  return `**${sev}**`;
}

// --- Load all artifacts ---

const verify  = loadJSON(verifyPath);
const truth   = loadJSON(truthPath);
const explain = loadJSON(explainPath);
const next    = loadJSON(nextPath);
const coach   = loadJSON(coachPath);

// --- Determine overall status ---

let overallStatus = 'PASS';
if (verify?.findings?.some(f => f.severity === 'P0' || f.severity === 'P1')) {
  overallStatus = 'WARN';
}
if (verify?.blocked) {
  overallStatus = 'BLOCK';
}

// --- Build comment ---

const lines = [];
const marker = '<!-- codeledger:pr-analysis -->';

lines.push(marker);
lines.push(`## ${statusIcon(overallStatus)} CodeLedger PR Analysis — ${overallStatus}`);
lines.push('');
lines.push(`**PR:** ${prTitle}`);
lines.push(`**Author:** @${prAuthor}`);
lines.push(`**Branch:** \`${prBranch}\``);
lines.push('');

// --- Context Certification ---

lines.push('### Context Certification');
lines.push('');
lines.push('| Signal | Status | Score |');
lines.push('|--------|--------|-------|');

const isc = verify?.isc ?? verify?.intentSufficiency ?? null;
const ccs = verify?.ccs ?? verify?.contextConfidence ?? null;
const truthGrade = truth?.truth_grade ?? truth?.truthGrade ?? '—';

const iscScore = isc != null && typeof isc === 'object' ? isc.score : isc;
const ccsScore = ccs != null && typeof ccs === 'object' ? ccs.score : ccs;

const iscStatus = (typeof iscScore === 'number' && iscScore >= 0.75) ? '✅ SUFFICIENT'
  : (typeof iscScore === 'number' && iscScore >= 0.50) ? '⚠️ WEAK' : '❌ INSUFFICIENT';
const ccsStatus = (typeof ccsScore === 'number' && ccsScore >= 0.85) ? '✅ CERTIFIED'
  : (typeof ccsScore === 'number' && ccsScore >= 0.65) ? '⚠️ NEEDS_ATTENTION' : '❌ LOW';

lines.push(`| Intent Sufficiency (ISC) | ${iscStatus} | ${scoreBar(iscScore)} |`);
lines.push(`| Context Confidence (CCS) | ${ccsStatus} | ${scoreBar(ccsScore)} |`);
lines.push(`| Truth Grade | ${truthGrade} | ${truth?.summary ?? ''} |`);
lines.push('');

// --- Top Findings ---

const findings = verify?.findings ?? [];
const topFindings = findings.filter(f => !f.baselined && !f.suppressed).slice(0, 5);

if (topFindings.length > 0) {
  lines.push('### Top Findings');
  lines.push('');
  lines.push('| # | Severity | Module | Finding |');
  lines.push('|---|----------|--------|---------|');
  topFindings.forEach((f, i) => {
    const sev = severityLabel(f.severity || 'P2');
    const mod = f.module || f.invariant || '—';
    const msg = (f.message || f.summary || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(`| ${i + 1} | ${sev} | \`${mod}\` | ${msg} |`);
  });
  lines.push('');
} else {
  lines.push('### Findings');
  lines.push('');
  lines.push('No new findings. All checks passed.');
  lines.push('');
}

// --- Phase 2: Explain ---

if (explain && !explain.error) {
  lines.push('<details>');
  lines.push('<summary>📖 Run Explanation (Phase 2)</summary>');
  lines.push('');

  const outcome = explain.outcome ?? explain;
  if (outcome.status || outcome.summary) {
    lines.push(`**Outcome:** ${outcome.status ?? overallStatus} — ${outcome.summary ?? ''}`);
    lines.push('');
  }

  const reasons = explain.why ?? explain.reasons ?? [];
  if (reasons.length > 0) {
    lines.push('**Why:**');
    reasons.forEach(r => {
      const text = typeof r === 'string' ? r : r.reason || r.text || JSON.stringify(r);
      lines.push(`- ${text}`);
    });
    lines.push('');
  }

  const evidence = explain.evidence ?? [];
  if (evidence.length > 0) {
    lines.push('**Evidence:**');
    evidence.forEach(e => {
      const label = e.label || e.key || 'Signal';
      const value = e.value || e.detail || JSON.stringify(e);
      lines.push(`- **${label}:** ${value}`);
    });
    lines.push('');
  }

  const ctx = explain.contextAnalysis ?? {};
  if (ctx.isc !== undefined || ctx.ccs !== undefined) {
    lines.push('**Context Analysis:**');
    lines.push(`- ISC: ${ctx.isc ?? '—'}, CCS: ${ctx.ccs ?? '—'}`);
    lines.push('');
  }

  lines.push('</details>');
  lines.push('');
}

// --- Phase 2: Next Actions ---

const actions = next?.actions ?? [];
if (actions.length > 0) {
  lines.push('<details>');
  lines.push('<summary>🎯 Recommended Next Actions</summary>');
  lines.push('');
  actions.forEach((a, i) => {
    const title = a.title || a.action || `Action ${i + 1}`;
    const conf = typeof a.confidence === 'number' ? ` (confidence: ${a.confidence.toFixed(2)})` : '';
    lines.push(`${i + 1}. **${title}**${conf}`);
    const basedOn = a.basedOn ?? a.based_on ?? [];
    basedOn.forEach(b => lines.push(`   - ${b}`));
  });
  lines.push('');
  lines.push('</details>');
  lines.push('');
}

// --- Coach: Implementation Plan ---

if (coach && !coach.error) {
  lines.push('<details>');
  lines.push('<summary>🧭 Coach: Implementation Plan</summary>');
  lines.push('');

  const ctx = coach.context ?? {};
  if (ctx.intent || coach.intent) {
    lines.push(`**Intent:** ${ctx.intent || coach.intent}`);
  }
  if (ctx.resolved_targets !== undefined) {
    const count = Array.isArray(ctx.resolved_targets) ? ctx.resolved_targets.length : ctx.resolved_targets;
    lines.push(`**Resolved Targets:** ${count} files`);
  }
  if (ctx.context_sufficient !== undefined || coach.context_sufficient !== undefined) {
    lines.push(`**Context Sufficient:** ${ctx.context_sufficient ?? coach.context_sufficient ?? '—'}`);
  }
  lines.push('');

  const advice = coach.advice ?? [];
  if (advice.length > 0) {
    lines.push('**Advice:**');
    advice.forEach(a => {
      const sev = a.severity === 'warn' ? '⚠️' : a.severity === 'error' ? '🛑' : '💡';
      const src = a.source ? ` (${a.source})` : '';
      const msg = a.message || a.text || JSON.stringify(a);
      lines.push(`- ${sev}${src} ${msg}`);
    });
    lines.push('');
  }

  const plan = coach.plan ?? [];
  if (plan.length > 0) {
    lines.push('**Plan:**');
    plan.forEach((s, i) => {
      const title = s.title || s.step || `Step ${i + 1}`;
      const rationale = s.rationale ? ` — ${s.rationale}` : '';
      lines.push(`${i + 1}. **${title}**${rationale}`);
    });
    lines.push('');
  }

  lines.push('</details>');
  lines.push('');
}

// --- Footer ---

lines.push('---');
lines.push('*Powered by [CodeLedger](https://codeledger.dev) v0.10.8 · [What is this?](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md) · Deterministic analysis, no LLM in the hot path*');

// --- Write output ---

const body = lines.join('\n');
writeFileSync(outPath, body, 'utf8');
console.log(`PR comment written to ${outPath} (${body.length} bytes)`);
