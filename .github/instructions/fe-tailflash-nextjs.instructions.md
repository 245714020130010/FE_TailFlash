---
description: "Use when creating or editing Next.js App Router pages, React components, hooks, and UI logic in FE_TailFlash. Enforces TypeScript strictness, server-first App Router patterns, Tailwind 4 and Radix usage, and accessibility/import hygiene."
name: "FE TailFlash Next.js Standards"
applyTo: "app/**/*.{ts,tsx},components/**/*.{ts,tsx},hooks/**/*.{ts,tsx},lib/**/*.{ts,tsx}"
---
# FE TailFlash Next.js Rules

Treat the rules below as default preferences. They can be overridden when task requirements require a different implementation.

- Prefer Server Components by default in App Router. Add "use client" only when browser APIs, client-only hooks, or interactive state are required.
- Keep TypeScript strict. Avoid any, avoid unused variables, and preserve the @/* alias rooted at the repository root.
- Follow ESLint expectations for Next.js, TypeScript, React Hooks, accessibility, and import ordering. Prevent import cycles.
- Use existing stack conventions: Tailwind CSS v4 for styling, Radix primitives for UI behavior, lucide-react for icons, next-themes for theming.
- Use react-hook-form with Zod for form validation and schema typing when adding or updating forms.
- Keep code server-safe in App Router routes and shared modules unless a client boundary is explicitly needed.
- Limit console usage to warn and error only.
- Even though next.config.mjs allows ignored TypeScript build errors, still resolve TypeScript issues in changed files.
- Use pnpm-based workflow and run lint before finalizing changes.
