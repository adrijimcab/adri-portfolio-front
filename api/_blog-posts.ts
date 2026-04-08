/**
 * Blog post metadata mirror for Vercel functions.
 *
 * TODO(adrián): The canonical blog posts live in
 * `src/content/posts/posts.ts`, but Vercel functions cannot import from
 * `src/app/**` (different build context). The NestJS API does NOT yet expose a
 * `/blog/posts` endpoint — only view-count endpoints under `/blog/posts/:slug`.
 *
 * Until the API exposes a public `/blog/posts` list endpoint, this file holds a
 * hand-maintained copy of post metadata for RSS / JSON Feed / sitemap.
 * When the API catches up:
 *   1. Delete this file
 *   2. Update rss.ts, feed.ts and sitemap.ts to fetch from `${API_URL}/blog/posts`
 *
 * The `_` prefix keeps Vercel from treating this file as a routable function.
 */

export interface BlogPostFeedEntry {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** ISO 8601 date (yyyy-mm-dd) */
  readonly date: string;
  /** Optional list of tags/categories */
  readonly tags?: readonly string[];
}

export const FEED_POSTS: readonly BlogPostFeedEntry[] = [
  {
    slug: 'welcome',
    title: 'Building this portfolio: Angular 21, NestJS, Supabase',
    description:
      'The stack, the decisions that took longer than they should have, and what I learned shipping it in a week.',
    date: '2026-04-07',
    tags: ['angular', 'nestjs', 'supabase', 'architecture'],
  },
  {
    slug: 'shipping-with-agents',
    title: 'Shipping with AI agents: what actually worked',
    description:
      'Multi-agent workflows, specification-driven development, and the discipline of letting the model do the work — without losing the architectural plot.',
    date: '2026-04-05',
    tags: ['ai', 'workflow', 'agents', 'productivity'],
  },
  {
    slug: 'railway-trust-proxy',
    title: 'Railway, trust proxy, and the multi-hop rate limiter',
    description:
      'A production bug with express-rate-limit behind Railway’s proxy chain — and why `trust proxy: true` is almost never the right answer.',
    date: '2026-04-03',
    tags: ['nestjs', 'railway', 'security', 'rate-limiting'],
  },
];

export const FEED_POSTS_SORTED: readonly BlogPostFeedEntry[] = [...FEED_POSTS].sort((a, b) =>
  a.date < b.date ? 1 : -1,
);
