<!-- codeledger:pr-analysis -->
## ⚠️ CodeLedger PR Analysis — WARN

**PR:** Add promo code validation to billing service
**Author:** @marcus-webb-acme
**Branch:** `feat/promo-codes`

### Context Certification

| Signal | Status | Score |
|--------|--------|-------|
| Intent Sufficiency (ISC) | ✅ SUFFICIENT | `████████░░` 0.82 |
| Context Confidence (CCS) | ⚠️ NEEDS_ATTENTION | `██████░░░░` 0.64 |
| Truth Grade | B | FRESH remote, CI present |

### Top Findings

| # | Severity | Module | Finding |
|---|----------|--------|---------|
| 1 | **🟠 P1** | `runtime_validation` | Route handler `POST /billing/promo` accepts `promoCode` without runtime type guard — Zod schema or manual check required |
| 2 | **🟡 P2** | `platform_helpers` | Direct `new Date()` in `services/billing/promo-validator.ts:42` — use `packages/shared-utils/date.ts` instead |
| 3 | **🟡 P2** | `test_integrity` | Test `promo-codes.test.ts` mocks `StripeClient` but production code imports it via re-export — mock target mismatch |

<details>
<summary>📖 Run Explanation (Phase 2)</summary>

**Outcome:** WARN — 1 P1 finding requires attention before merge

**Why:**
- The billing service route handler at `services/billing/routes/promo.ts` accepts user input (`promoCode`, `discountPercent`) without runtime validation. This is a P1 because the billing service handles financial data.
- The shared-utils `date.ts` helper provides timezone-safe date handling, but the new promo-validator bypasses it with raw `new Date()`.
- The test mock targets the wrong import path — if `StripeClient` is re-exported through `packages/api-client`, the mock won't intercept production calls.

**Evidence:**
- **ISC Signal:** Task intent is clear (add promo validation), but no constraints specified for discount bounds or expiry rules → ISC 0.82
- **CCS Signal:** Bundle covered billing service files but missed `packages/validation/billing.ts` which defines the existing billing validators → CCS 0.64
- **ECL History:** 2 prior PRs to billing service by Marcus had similar runtime-validation findings (ECL entries #147, #152)

**Context Analysis:**
- ISC: 0.82 (SUFFICIENT — clear intent, missing constraints)
- CCS: 0.64 (NEEDS_ATTENTION — validation package not in bundle)
- Dependency coverage: 78% (missed validation package cross-reference)

</details>

<details>
<summary>🎯 Recommended Next Actions</summary>

1. **Add runtime validation to promo route** (confidence: 0.91)
   - Based on: P1 finding + 2 prior ECL entries showing same pattern in billing service
   - Suggested: Add Zod schema or use `packages/validation/billing.ts` validators

2. **Replace raw Date() with shared-utils helper** (confidence: 0.78)
   - Based on: Platform helper bypass finding + structural-trust wiring for `shared-utils/date.ts`

3. **Fix test mock target path** (confidence: 0.72)
   - Based on: Test integrity finding + re-export chain in `packages/api-client/index.ts`

</details>

<details>
<summary>🧭 Coach: Implementation Plan</summary>

**Intent:** Add promo code validation to billing service
**Resolved Targets:** 6 files
**Context Sufficient:** yes (ISC 0.82)

**Advice:**
- ⚠️ P1 (ECL) Runtime validation is missing on the promo route — this pattern failed in 2 prior billing PRs
- 💡 P2 (structural-trust) `packages/validation/billing.ts` already exports `validateBillingInput()` — extend it rather than creating new validators
- 💡 P2 (golden-pattern) Sara's payment processing pattern (GP-004) validates all financial inputs at the route boundary

**Plan:**
1. **Extend billing validators** — Add `validatePromoCode()` to `packages/validation/billing.ts` (rationale: single source of truth for billing validation, matches Sara's golden pattern GP-004)
2. **Wire into route handler** — Import and call at `services/billing/routes/promo.ts:15` before processing (rationale: P1 finding, financial data requires boundary validation)
3. **Fix date handling** — Replace `new Date()` with `packages/shared-utils/date.ts` at `services/billing/promo-validator.ts:42` (rationale: timezone safety, platform helper compliance)
4. **Update test mock** — Change mock target from `services/billing/stripe-client` to `packages/api-client` re-export (rationale: mock must intercept the actual import path)

</details>

---
*Powered by [CodeLedger](https://codeledger.dev) v0.10.8 · [What is this?](https://github.com/codeledgerECF/codeledger-blackbox/blob/main/docs/CODELEDGER_OVERVIEW.md) · Deterministic analysis, no LLM in the hot path*
