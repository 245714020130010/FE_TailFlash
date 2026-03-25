# Project Guidelines

## Code Style
- TypeScript strict; keep `@/*` alias to the repo root per [tsconfig.json](tsconfig.json).
- Lint with Next.js + TypeScript + a11y + React Hooks rules; avoid `any`, unused vars, and import cycles per [.eslintrc.json](.eslintrc.json).
- Prettier formatting; lint-staged runs `eslint --fix` then `prettier --write` on staged JS/TS.

## Architecture
- Next.js App Router in [app](app); feature pages under `app/*` and shared UI in [components](components).
- UI uses Tailwind 4, Radix primitives, and lucide icons; theming via next-themes; forms via react-hook-form + Zod.
- Images are unoptimized and TypeScript build errors are ignored in [next.config.mjs](next.config.mjs); still fix TS issues locally.

## Build and Test
- Use pnpm: `pnpm install` → `pnpm dev` for local, `pnpm build` for production bundle, `pnpm start` to run it, `pnpm lint` before shipping.
- Node version not pinned; align with Next 16/React 19 requirements.

## Conventions
- Prefer server-safe code in the App Router; keep client components opt-in (`"use client"`) only when needed.
- Respect strict a11y and import ordering rules from ESLint; console only for `warn`/`error`.
- Refer to the project analysis in [docs/Phân tích ý tưởng.pdf](docs/Ph%C3%A2n%20t%C3%ADch%20%C3%BD%20t%C6%B0%E1%BB%9Fng.pdf) for product context.