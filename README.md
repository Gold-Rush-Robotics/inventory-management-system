# Inventory Management System

This project is based on the T3 stack (Next.js + tRPC + Prisma + Tailwind), with Better Auth and Discord OAuth.

## Developer Setup (Start Here)

### 1) Prerequisites

- [Node.js 20+](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation) (repo uses `pnpm@10.33.0`)
- PostgreSQL, either:
  - via [Docker](https://www.docker.com/get-started/) (recommended), or
  - local Postgres installed directly

### 2) Clone and install dependencies

```bash
pnpm i
```

### 3) Configure environment variables

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

At minimum, set:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (usually `http://localhost:3000` in local dev)
- `BETTER_AUTH_DISCORD_CLIENT_ID`
- `BETTER_AUTH_DISCORD_CLIENT_SECRET`

`BETTER_AUTH_SECRET` can be anything, but I would recommend generating something from
[https://www.uuidgenerator.net/](https://www.uuidgenerator.net/) or [https://diceware.dmuth.org/](https://diceware.dmuth.org/)

### 3.5) Set up Discord OAuth

In the [Discord Developer Portal](https://discord.com/developers/applications):

1. Create an application (name it whatever you want).
2. Go into it -> OAuth2.
3. In the OAuth2 section:
   1. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
   2. Copy client ID and client secret into `.env`:
      - `BETTER_AUTH_DISCORD_CLIENT_ID`
      - `BETTER_AUTH_DISCORD_CLIENT_SECRET`
        - You will probably need to reset to generate a client secret

### 4) Start Postgres (if using Docker)

```bash
docker compose up -d
```

### 5) Push Prisma schema

```bash
pnpm db:push
```

This creates/updates your database schema and runs Prisma client generation.

### 6) Start the app

```bash
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000) (unless that port is in use).

### 7) Helpful commands

```bash
# --- General Scripts ---

pnpm dev           # start dev server

pnpm check         # lint + typecheck
pnpm lint:fix      # fix lint issues (that can be auto fixed)
pnpm format:write  # format project (with prettier)

pnpm preview       # production preview
pnpm build         # create production build


# --- Database scripts ---

pnpm db:generate   # Regenerates prisma types
pnpm db:migrate    # Creates a new migration (based on the changes from the previous migration and current schema.prisma)
pnpm db:push       # Pushes the current schema to the database + generate types

pnpm db:studio     # Built-in DB inspector
pnpm db:reset      # Drops the database, re-applies all migrations, and re-seeds (destructive)

pnpm db:deploy     # Applies unapplied migrations (e.g. for prod or after pulling changes)
```

## Project Map

### Frontend

- `src/app/layout.tsx`: root app shell and global wrappers
- `src/app/page.tsx`: main home page route
- `src/app/_components/`: other custom components used in the app
- `src/components/ui/`: UI components created by shadcn

### Backend

- `src/server/api/root.ts`: tRPC router composition root
- `src/server/api/routers/`: tRPC feature routers
- `src/server/api/trpc.ts`: tRPC context/procedures/middleware setup
- `src/server/db.ts`: Prisma client initialization
- `src/server/better-auth/`: Better Auth server/client configuration

### API Routes

- `src/app/api/trpc/[trpc]/route.ts`: tRPC HTTP handler
- `src/app/api/auth/[...all]/route.ts`: Better Auth route handler

### Database

- `prisma/schema.prisma`: data model and database schema
- `prisma/migrations/`: migration history
- For local setup or quick schema sync without a migration file, use `pnpm db:push`
- When you open a PR that has schema changes, run `pnpm db:migrate`
- In staging/production, apply migrations with `pnpm db:deploy`

## UI Components (shadcn)

Shadcn UI components live in `src/components/ui/` (for example `button.tsx`, `card.tsx`, `input.tsx`). Prefer composing new feature UI from these shared building blocks before introducing one-off component patterns.

## Next.js Basics in This Repo

- `layout.tsx` files define persistent UI wrappers for routes.
- `page.tsx` files define route content.
- `src/app/_components/` contains local, route-adjacent components (only used by the app route tree).
- `src/components/` is for reusable shared components across multiple routes/features.

## Other Resources

If you are not familiar with the different technologies used in this project, these docs are a good reference:

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

To learn more about the T3 stack:

- [T3 Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
- [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app)
