---
name: autonomous-code-repair
description: "Generate code and run an autonomous fix loop where AI decides next steps, identifies what is broken, applies fixes, and validates with lint/build/test until completion. Use for requests like: generate code, decide everything, what to do next, what needs fixing."
argument-hint: "Goal, target files/module, and constraints (stack, style, performance, deadline)."
user-invocable: true
---

# Autonomous Code Repair

## Outcome
Produce working code changes with minimal user steering by continuously:
1. Deciding the next best action.
2. Detecting failures and quality gaps.
3. Applying targeted fixes.
4. Re-validating until done.

Scope default: this repository (FE_TailFlash), including Next.js App Router conventions.
Autonomy default: Safe auto-fix mode.

## When To Use
- User asks AI to "decide everything" for implementation.
- User wants both new code generation and automatic fixing.
- User asks "what should I do next" and "what is broken" in the same flow.

## Required Inputs
- Desired outcome (feature, bugfix, refactor, optimization).
- Scope (specific files/folders, or full workspace).
- Hard constraints (language/framework/style/performance/security).
- Done criteria (tests pass, lint clean, behavior verified).

If inputs are incomplete, infer defaults from repository conventions and continue.

## Autonomous Workflow
1. Clarify objective in one sentence and list assumptions.
2. Discover relevant files, symbols, and existing patterns.
3. Build a short action plan with a single active step.
4. Implement the smallest viable change first.
5. Validate quickly: typecheck/lint/build/tests relevant to changed code.
6. If validation fails, classify issues:
   - Compile/type errors: fix before anything else.
   - Test failures: fix regressions and missing edge handling.
   - Lint/style/accessibility issues: fix in touched files.
   - Runtime/logical defects: add guards, constraints, and better state handling.
7. Re-run validation and repeat until done criteria are met.
8. Report:
   - What changed.
   - What was broken and how it was fixed.
   - What remains risky or unverified.
   - The best next action.

## Decision Rules
- Prefer minimal, reversible edits over broad rewrites.
- Preserve project conventions and existing architecture.
- Do not modify unrelated files.
- If multiple fixes are possible, choose the one with lowest regression risk.
- When blocked by missing requirements, proceed with explicit assumptions, then surface them.
- In Safe auto-fix mode, avoid large refactors unless smaller fixes cannot satisfy validation.

## Quality Gates
A task is complete only when all are true:
- Changed code compiles/typechecks.
- Relevant lint checks pass.
- Relevant tests pass or justified if unavailable.
- Frontend accessibility checks pass for touched UI paths when applicable.
- No new warnings/errors introduced in touched files.
- Final summary includes residual risks and concrete next step.

## Output Contract
Each run should return:
1. Plan used.
2. Files changed.
3. Issues found and fixed.
4. Validation results.
5. Next recommended step.
