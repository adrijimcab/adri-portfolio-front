<p align="center">
  <img src="public/favicon-512x512.png" width="80" alt="AJC Logo" />
</p>

<h1 align="center">adrianjimenezcabello.dev</h1>

<p align="center">
  My personal portfolio — built to showcase real engineering, not just pretty pixels.<br/>
  Angular 21 SSR on Vercel, NestJS API on Railway, Supabase Postgres with pgvector.<br/>
  <strong>Every architectural decision is intentional. Every pattern is production-grade.</strong>
</p>

<p align="center">
  <a href="https://adrianjimenezcabello.dev">Live Site</a> ·
  <a href="https://adrianjimenezcabello.dev/rss.xml">RSS Feed</a> ·
  <a href="https://adrianjimenezcabello.dev/sitemap.xml">Sitemap</a> ·
  <a href="https://www.linkedin.com/in/adrianjimenezcabello">LinkedIn</a>
</p>

---

## What makes this different

This isn't a template. I built every layer from scratch because I wanted a portfolio that actually demonstrates what I do — **clean architecture, solid engineering practices, and thoughtful product thinking**.

A recruiter can read the code and see exactly how I work. A fellow dev can find patterns worth borrowing. That's the point.

## Tech Stack

| Layer        | Technology                                                     | Why                                                                                                                |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Frontend** | Angular 21 SSR, Tailwind 4, Signals, View Transitions          | Server-rendered for SEO, signals for reactivity without RxJS overhead, View Transitions for native page animations |
| **Backend**  | NestJS 11, Pino, Helmet, Throttler, Terminus                   | Modular architecture with repository pattern, structured logging, real healthchecks against Supabase               |
| **Database** | Supabase (Postgres 15+), pgvector, RLS                         | Row-Level Security on every table, pgvector for the AI chatbot's semantic search, audit triggers on 11 tables      |
| **AI**       | Vercel AI Gateway, Claude 3.5 Haiku, text-embedding-3-small    | RAG chatbot that answers questions about my experience using my actual portfolio data                              |
| **Hosting**  | Vercel (front), Railway (API), Supabase (DB), Cloudflare (DNS) | Each service where it runs best — no vendor lock-in, no over-engineering                                           |

## Features

### For visitors

- **AI Chatbot** — "Ask Adrian" widget powered by RAG over my real portfolio data. Streaming responses via SSE, with clickable source citations
- **Blog** with syntax highlighting (Shiki), copy-to-clipboard on code blocks, and callout/admonition blocks
- **Dynamic sitemap**, RSS (Atom), and JSON Feed for content syndication
- **Dynamic OG images** generated per page via `@vercel/og`
- **Command palette** (`Cmd+K` or `?`) with vim-style navigation shortcuts (`g h`, `g p`, `g b`, `t` for theme toggle, `gg` for scroll top)
- **Guestbook** — sign with GitHub OAuth and leave a message
- **Lab** — experiments and micro-demos showcasing CSS, WebGL, and interaction patterns
- **/now page** — what I'm currently working on, reading, and available for
- **Dark/light theme** with flicker-free SSR, respecting `prefers-color-scheme`
- **i18n** with URL-based routing (`/es/...`, `/en/...`), hreflang tags, and language guard
- **Scroll-driven CSS animations** with progressive enhancement and reduced-motion support
- **Spotify "Now Playing"** integration

### Under the hood (for fellow engineers)

- **Hexagonal architecture** — domain entities, repository ports, HTTP adapters. The frontend has a clean `core/domain → core/application → core/infrastructure` split
- **GenericCrudComponent** — 10 admin editors collapsed into a single reusable pattern with typed `CrudResource<T>` contracts
- **Route resolvers + TransferState** — SEO meta and JSON-LD schemas render server-side (verified with `curl`). Google sees unique titles, descriptions, and structured data per page
- **JSON-LD structured data** — `Person`, `WebSite`, `BlogPosting`, `CreativeWork`, `BreadcrumbList`, `ItemList`, `ProfessionalService`
- **Zero `any`** in the entire codebase. ESLint strict with 0 errors, 0 warnings across both repos
- **124 automated tests** (95 API + 29 front) with Vitest and Jest
- **Husky + lint-staged** pre-commit hooks with prettier + eslint
- **Security hardened** — Helmet, CORS restricted, JWT in-memory (not localStorage), CSP with SHA-256 hash, RLS on every DB table, audit log with append-only enforcement, `SECURITY DEFINER` functions with pinned `search_path`
- **0 vulnerabilities** (`npm audit --audit-level=high` clean on both repos)
- **Vercel Functions** as `.mjs` edge-compatible handlers for sitemap, RSS, feed, and OG generation
- **@nestjs/config + Zod** — all environment variables validated at boot with typed schema. App refuses to start with invalid config
- **Terminus healthcheck** — real ping to Supabase, not a fake 200
- **Correlation IDs** in Pino logs via `x-request-id` propagation
- **Selective caching** — CacheInterceptor only on public read endpoints, not on mutations
- **API versioning** — `/api/v1/*` forward-compatible middleware

## Architecture

```
Browser (Angular 21 SSR)
  ├── Vercel CDN (static + prerendered)
  ├── Vercel Functions (sitemap, rss, feed, og)
  └── SSR on-demand via api/ssr.mjs
          │
          ▼
NestJS API (Railway)
  ├── 15 feature modules (repository pattern)
  ├── ChatModule (RAG: embed → pgvector match → streamText)
  ├── GuestbookModule (GitHub OAuth verification)
  ├── ReindexWorker (pg LISTEN + cron fallback)
  └── Pino structured logging + Terminus health
          │
          ▼
Supabase Postgres
  ├── 19 tables with RLS on every one
  ├── pgvector (portfolio_chunks + match RPC)
  ├── Audit triggers on 11 mutable tables
  ├── chat_logs (append-only analytics)
  └── guestbook_entries (public read, service-role write)
```

## Local Development

```bash
# Prerequisites: Node 24+, npm 10+

# Frontend
cd adri-portfolio-front
npm install
npm start                    # http://localhost:4200

# API
cd adri-portfolio-api
cp .env.example .env         # fill in Supabase + Resend keys
npm install
npm run start:dev            # http://localhost:3000

# Database
cd adri-portfolio-db
supabase start               # local Supabase instance
supabase db push --local     # apply all migrations
```

## Quality Gates

Every commit passes through:

```
eslint (0 errors, 0 warnings) → prettier → build → vitest/jest → husky pre-commit
```

Pre-push additionally runs `npm run build && npm run test:run`.

## Project Structure

```
adri-portfolio-front/
├── api/                    # Vercel Functions (.mjs)
│   ├── ssr.mjs             # Angular SSR handler
│   ├── og.mjs              # Dynamic OG image generation
│   ├── sitemap.mjs         # Dynamic XML sitemap
│   ├── rss.mjs             # Atom feed
│   └── feed.mjs            # JSON Feed v1.1
├── src/app/
│   ├── core/
│   │   ├── domain/         # Entities, repository ports
│   │   ├── infrastructure/ # HTTP adapters
│   │   ├── services/       # SEO, Theme, Translate, Portfolio, Markdown, Auth
│   │   ├── interceptors/   # Auth, Cache (LRU)
│   │   └── guards/         # Auth, Language
│   ├── features/           # Landing, Blog, Projects, CV, Uses, Stack, Now, Lab, Guestbook, Admin
│   └── shared/             # GenericCrud, ChatWidget, CommandPalette, Navbar, Footer, etc.
├── e2e/                    # Playwright specs
└── public/                 # Static assets, manifest, security.txt
```

---

## Changelog

### 2026-04-09

**Major session — full audit + implementation cycle**

#### Security & Hardening

- Resolved 5 HIGH severity npm vulnerabilities via overrides strategy
- Supabase `config.toml`: production `site_url`, disabled open signup, enabled email confirmation and MFA TOTP
- Tightened RLS policies: `is_visible` filter on `github_repos`, `social_links`, `sections_config`
- Hardened `log_audit_event()` with pinned `search_path` and append-only enforcement
- JWT moved from `localStorage` to in-memory storage (XSS surface eliminated)
- CSP updated from `'unsafe-inline'` to SHA-256 hash for the theme detection script
- API Helmet CSP simplified to `default-src 'none'` (pure JSON API)
- Added `security.txt` at `/.well-known/security.txt`

#### SEO

- **Fixed critical SSR issue**: `SeoService` now runs server-side via Route Resolvers + TransferState (verified with curl — each page has unique title + meta + JSON-LD)
- Added JSON-LD schemas: `Person`, `WebSite`, `BlogPosting`, `CreativeWork`, `BreadcrumbList`, `ItemList`, `ProfessionalService`
- Dynamic sitemap, RSS (Atom), and JSON Feed via Vercel Functions
- Dynamic OG image generation via `@vercel/og` (Satori + Resvg)
- PWA manifest, dual `theme-color` with `prefers-color-scheme`, `lang="es"`
- Removed broken hreflang (replaced with proper URL-based i18n routing)

#### Quality

- ESLint 9 flat config with strict Angular rules — **0 errors, 0 warnings** across both repos
- Vitest setup with 29 front-end tests covering services, interceptors, guards, and chat widget
- Jest API tests expanded to 95 (from 65) — covers ChatModule, GuestbookModule, and all repositories
- `@nestjs/config` + Zod schema validation for all environment variables
- Terminus healthcheck with real Supabase ping
- Husky + lint-staged + Prettier pre-commit hooks
- `takeUntilDestroyed()` sweep across all non-admin components
- `PortfolioService` refactored from 10 eager HTTP calls to lazy pull-based signals
- `@angular/material` removed (unused, -300KB from bundle)

#### Architecture

- Hexagonal core: domain entities, repository port (`PortfolioRepository`), HTTP adapter
- `GenericCrudComponent<T>` + `CrudResource<T>` — 10 admin editors collapsed into reusable pattern
- Selective `CacheInterceptor` (only public read endpoints)
- Correlation ID propagation in Pino via `x-request-id`
- API versioning middleware (`/api/v1/*` → `/api/*` forward-compatible)
- `@defer (on viewport)` on 7 landing sections + `@defer (on interaction)` for chat widget

#### New Features

- **AI Chatbot "Ask Adrian"** — RAG pipeline with Vercel AI Gateway (Claude Haiku), pgvector semantic search, SSE streaming, Angular widget with sources badges
- **Guestbook** with GitHub OAuth — visitors authenticate and leave messages
- **i18n routing** — `/es/...` and `/en/...` URL prefixes with language guard, hreflang tags, and legacy redirects
- `/now` page — current focus, readings, availability
- `/lab` page — experiments showcase
- **Command palette** with real vim-style shortcuts (`g h/p/b/u/s/n/l/c`, `gg`, `t`, `?`)
- **Blog enhancements** — copy-to-clipboard on code blocks, callout/admonition blocks (`[!NOTE]`, `[!WARNING]`, `[!TIP]`), extracted `MarkdownService`
- **CSS scroll-driven animations** with `animation-timeline: scroll()` and `view()` (progressive enhancement)
- Semantic CSS variables for theme tokens (eliminated all `!important` overrides)
- `NgOptimizedImage` on project images, `loading="lazy"` on external CDN images
- Tightened bundle budgets (490kB warn / 520kB error)
- 11/14 mutable tables with audit triggers
- Singleton constraint on `profile` table
- Cleaned up legacy `update_updated_at()` duplicate function

#### Database Migrations Applied

- `20260408000010_tighten_visibility_rls.sql`
- `20260408000011_harden_audit_log.sql`
- `20260408000012_chatbot_rag.sql` (pgvector + portfolio_chunks + match RPC + 7 triggers + chat_logs)
- `20260409000001_expand_audit_triggers.sql`
- `20260409000002_schema_cleanup.sql`
- `20260409000003_guestbook.sql`

---

<p align="center">
  Built by <a href="https://www.linkedin.com/in/adrianjimenezcabello">Adrián Jiménez Cabello</a> — Full Stack Developer, Madrid
</p>
