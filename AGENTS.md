<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rentora client

Early-stage equipment-rental platform. Working today: Better Auth email/password sign-up and sign-in, session-aware navbar, `/dashboard` role redirect, and placeholder dashboard pages for all three roles. Still missing: the Express API, equipment/favorites/bookings/payments data, Stripe, and most public pages (see the requirements section at the bottom).

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

## Backend repo (`../rentora-server`)

The Express API is a **separate repo/folder**, `D:\project\Assaignment 9\rentora-server`.
It is not inside this Next app and `npm run dev` here does not start it.

- ESM (`"type": "module"`), Express 5, `mongodb` driver 7, `cors`, `dotenv`.
  JWT, Stripe, and ImgBB packages are **not** installed yet.
- Everything currently lives in `index.js`: `cors()` with no origin allow-list,
  `express.json()`, a Mongo client that connects to db `rentora` at import time
  (`connectToMongoDB`), `GET /` returning "Hello, World!", listening on
  `PORT || 5000`. Its `.env` only has `MONGODB_URI` today.
- No `dev`/`start` script yet — run `node index.js` (or `node --watch index.js`).
- Same MongoDB database (`rentora`) and same `user` collection the Next app's
  Better Auth adapter writes to, so both processes must use the same
  `MONGODB_URI`. Never duplicate the auth collections from Express.
- When growing it, split `index.js` into `config/`, `middlewares/`, `routes/`,
  `controllers/`, `utils/` while keeping `connectToMongoDB` and the `rentora` db
  handle working. Tighten CORS to the Next dev origin(s) and add a JSON error
  handler before exposing real endpoints.

## Rentora — assignment requirements (condensed source of truth)

When asked to build a feature, implement it against this section, keep the existing
auth/dashboard code working, and tick or add checklist items as work lands. If a
requirement here conflicts with the current code, the requirement wins — but flag
the change instead of silently rewriting large parts of the app.

**Stack**
- Frontend: Next 16 App Router, TypeScript, Tailwind v4, shadcn (Base UI), Framer Motion, sonner toasts.
- Auth: Better Auth with the MongoDB adapter, JWT for API calls, Google login, RBAC.
- Backend: a **separate Express + MongoDB app** at `../rentora-server` (own `package.json`; target layout `routes/`, `controllers/`, `middlewares/`, `config/`, `utils/`). Business APIs and Stripe webhooks belong there, not in Next route handlers. See the backend section above.
- Payments: Stripe Checkout + signature-verified webhook.
- Images: ImgBB upload or direct image URL.
- Env vars live in `.env` / `.env.local` and are never committed: Mongo URI, Better Auth URL/secret, Google OAuth client id/secret, ImgBB key, Stripe secret key + webhook secret, Express port, and the API base URL used by the frontend. Frontend reads the API through a `NEXT_PUBLIC_*` variable; the backend keeps its own `.env` in `../rentora-server`.

**Roles:** `customer` | `owner` | `admin`. New users get `customer` (Better Auth already
defaults this and blocks client input). Only an admin changes roles; never from
registration or profile updates.

**Routes**
- Public: `/`, `/equipment`, `/sign-in`, `/sign-up`, `/about` (optional), `/contact` (optional).
- Private: `/equipment/[id]`.
- `/dashboard/customer/{my-rentals,favorites,profile}`
- `/dashboard/owner/{add-equipment,my-equipment,my-equipment-rental,analytics,profile}`
- `/dashboard/admin/{all-users,all-equipment,all-rentals,analytics,profile}`

**Collections:** `user` (Better Auth-owned, plus `role`, phone, address), `equipment`,
`favorites`, `bookings`, `payments`. Use one spelling per field everywhere — equipment
has `ownerId`, `status`, `price`, `rentalType`; bookings have `customerId`, `ownerId`,
`equipmentId`, `rentalDuration`, `totalAmount`, `paymentStatus`, `bookingStatus`;
payments have `bookingId`, `stripeSessionId`, `stripePaymentIntentId`, `amount`.

**Non-negotiable rules**
- The server never trusts client `ownerId`, `role`, `totalAmount`, or `paymentStatus`; re-derive them from the JWT and DB.
- Express middleware: `verifyToken` (401 when missing/invalid), then `verifyRenter` / `verifyOwner` / `verifyAdmin` (403 when the role is wrong). Every private route carries the right pair. Better Auth session cookies are **not** JWTs — enable the JWT plugin (or sign explicitly) and verify with the matching config.
- Equipment starts `pending`; only an admin moves it to `approved`/`rejected`. Owners can never approve their own listings. Public pages return approved equipment only.
- Guests clicking "View Details" are sent to `/sign-in`; signed-in users go to `/equipment/[id]`.
- Booking total = price × duration in the correct unit (daily/weekly/monthly) × quantity, recomputed on the server; dates and quantity are validated there too. Availability is re-checked so concurrent bookings cannot oversell.
- The Stripe webhook is the only source of truth for `paid`. Verify its signature, make handling idempotent (no duplicate payment rows on retries), and record failed/cancelled/expired outcomes.
- Search (name/title, category, location), filters (category, rental type, price range, availability), sorting (price asc/desc, newest) and pagination all run in MongoDB — never fetch everything and filter in the client.
- Owner APIs and dashboards scope by the authenticated owner; customers can read only their own bookings and favorites, and only delete their own favorite records.
- Analytics come from real collections with aggregations, scoped by owner where relevant; revenue counts paid payments only.
- No email verification and no password recovery — do not build or link them.

**Frontend features still to build:** homepage banner, exactly 6 featured equipment (limit 6), 6 categories linking to filtered `/equipment`, why-choose-us, 4+ static reviews, Framer Motion on these sections; footer; All Equipment grid with search/filter/sort/pagination; detail page with favorites + booking modal; loading, empty, 404 and error states; toasts for every mutation listed in the brief; profile editing for all roles.

**Progress checklist (keep updated)**
- [x] Better Auth email/password, `role` additional field, sign-in/sign-up UI, session-aware navbar, `/dashboard` role redirect, dashboard shells
- [ ] JWT plugin + Google provider + password rules (uppercase, lowercase, 6+) + redirect to `/sign-in` after signup + remove the dead forgot-password link
- [ ] Express app, Mongo connection, JWT/role middleware, env wiring — skeleton exists in `../rentora-server` (`index.js`: Express 5 + Mongo `rentora`, equipment GET/POST/PATCH/DELETE, image upload). JWT/role middleware still pending.
- [ ] Equipment CRUD + admin approval + public list (search/filter/sort/pagination) + details page — owner create/update/delete and availability toggle done; admin approval, public list and details pending
- [ ] Favorites, booking validation, Stripe Checkout + webhook
- [ ] Customer / owner / admin dashboards with real data, analytics + charts
- [ ] Homepage sections, footer, `/equipment`, loading/error/404 states, responsive + animation pass

