<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rentora client

Early-stage marketing site for an equipment-rental brand. Only the home page exists; nav links to `/equipment`, `/about`, `/contact`, `/signin`, and `/register` are not implemented yet.

## Commands

- `npm run dev` — Turbopack dev server on http://localhost:3000.
- `npm run lint` — ESLint 9 flat config. `next build` does **not** lint in Next 16, so run this separately.
- `npx next typegen && npx tsc --noEmit` — typecheck. `typegen` must come first: `.next/types` goes stale (it can reference deleted routes) and bare `tsc` then fails on generated files.
- `npm run build` — production build plus TypeScript; the authoritative verification. There is no test suite and no `typecheck` script.
- Use npm only (`package-lock.json`). The `cn` dependency requires Node >= 22.

## Structure

- `src/app/layout.tsx` — root `<html>`/`<body>`, Geist fonts, metadata.
- `src/app/(root)/` — public-site route group. Its `layout.tsx` renders `<Navbar />`; `page.tsx` is `/`. Add new public pages here, not directly under `src/app/`.
- `src/components/allComponents/` — hand-written page sections (Hero, Navbar).
- `src/components/ui/` — shadcn-generated primitives. Add more with `npx shadcn add <component>`; `components.json` uses the `base-nova` style.
- Path alias `@/*` → `src/*`.

## UI stack gotchas

- shadcn here is built on **Base UI** (`@base-ui/react`), not Radix. Compose with the `render` prop (`<Button render={<Link href="/x" />}>…`), **not** `asChild`; `asChild` does not exist and fails typecheck/build.
- Class merging uses the `cn` package (compiled clsx + tailwind-merge): `import { cn } from "cn"`. shadcn files import from `"cn"` directly; `src/lib/utils.ts` only re-exports it.
- Tailwind v4 is CSS-first: theme and tokens live in `src/app/globals.css`; there is no `tailwind.config.*` or PostCSS config. CSS runs through the `@tailwindcss/turbopack` loader set in `next.config.ts` — do not add `@tailwindcss/postcss`.
- Brand accent is hard-coded as `#80bd50` (hover `#6da640`); shadcn theme tokens are neutral. Hero/nav buttons override radius (`rounded-none`) and size inline.
- Font wiring is incomplete: `layout.tsx` exposes Geist as `--font-geist-sans`, but `globals.css` maps `--font-sans` to itself, so `font-sans` does not resolve to Geist. Fix the theme variable if typography matters.

## Next.js 16 specifics

- `cacheComponents`, `partialPrefetching`, and `reactCompiler` are enabled in `next.config.ts`. Data is dynamic by default: put dynamic reads inside `<Suspense>` and opt into caching with `use cache` plus `cacheLife`/`cacheTag`. `runtime = "edge"` is unsupported with Cache Components.
- Route props use generated global helpers (`LayoutProps<"/">`, `PageProps<"/route">`) — never import them; they exist after `next typegen`, `next dev`, or `next build`.
- Images are local files in `public/` referenced by literal filename. No `images.remotePatterns` is configured, so remote `next/image` URLs need a config change first.
