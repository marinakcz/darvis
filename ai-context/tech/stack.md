# Darvis — Stack

## Runtime

| Tech | Version | Notes |
|------|---------|-------|
| Next.js | 16.2.0 | App Router, src/, Turbopack |
| React | 19.2.4 | React Compiler enabled (babel-plugin-react-compiler) |
| TypeScript | ^5 | strict, bundler moduleResolution, target ES2017 |
| Tailwind CSS | ^4 | PostCSS plugin (@tailwindcss/postcss) |
| Node | 20+ | (inferred from ES2017 target) |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| drizzle-orm | ^0.45.1 | SQL ORM (type-safe queries) |
| @neondatabase/serverless | ^1.0.2 | Neon Postgres driver (HTTP) |
| @base-ui/react | ^1.3.0 | Headless primitives (used by shadcn) |
| shadcn | ^4.1.0 | Component toolkit |
| class-variance-authority | ^0.7.1 | CVA for variant styles |
| clsx | ^2.1.1 | Conditional classnames |
| tailwind-merge | ^3.5.0 | Merge Tailwind classes |
| tw-animate-css | ^1.4.0 | Animation utilities |
| lucide-react | ^0.577.0 | Icons |
| nanoid | ^5.1.7 | Short unique IDs (offer tokens) |
| @vercel/blob | ^2.3.1 | File/blob storage |
| pointfeedback | github:RutgerGeerlings/pointfeedback | Visual feedback widget |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| drizzle-kit | ^0.31.10 | DB migrations & studio |
| eslint + eslint-config-next | ^9 / 16.2.0 | Linting |
| babel-plugin-react-compiler | 1.0.0 | React Compiler |

## Path Aliases

| Alias | Maps to |
|-------|---------|
| `@/*` | `./src/*` |

## Database

- **Provider:** Neon Postgres (serverless HTTP driver)
- **ORM:** Drizzle ORM with `drizzle-orm/neon-http` adapter
- **Schema:** `src/lib/db/schema.ts` (customers, jobs, jobRooms, jobItems, offers, jobEvents)
- **Connection:** `src/lib/db/index.ts` — `neon(process.env.DATABASE_URL!)`

## Deploy

- **Platform:** Vercel (local dev default, deploy only for client sharing)
- **Repo:** github.com/marinakcz/darvis
