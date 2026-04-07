import type { BlogPost } from '../../app/features/blog/blog.types';

type RawPost = Omit<BlogPost, 'readingTimeMinutes'>;

const welcome: RawPost = {
  slug: 'welcome',
  title: 'Building this portfolio: Angular 21, NestJS, Supabase',
  description:
    'Stack, decisions, gotchas and what I learned shipping a production portfolio in a week.',
  date: '2026-04-07',
  content: `## Why this exists

I needed a portfolio that wasn't just another Next.js template with a hero, a grid of cards, and a contact form glued on top. I wanted something I could keep iterating on, that would teach me Angular's newest pieces, and that would force me to actually ship a backend. So I gave myself a week, picked a stack I had opinions about, and started building.

This post is a quick tour of the stack, three decisions that took me longer than expected, and what I'd do differently next time.

## The stack

The frontend is **Angular 21 in standalone, signals-only, zoneless mode with SSR**. No NgModules anywhere. Server output is set to \`server\` so I get static prerendering for the marketing pages and on-demand SSR for everything dynamic. Tailwind 4 for styling — the new engine is genuinely faster and the config-as-CSS workflow is easier to live with than v3.

The backend is **NestJS** running on Railway. It exposes a thin REST surface over Supabase, with row-level security as the primary authorization boundary. Auth is Supabase Auth, sessions are JWTs, and the admin panel sits behind a route guard plus an interceptor that attaches the access token. Vercel handles the frontend, with preview deploys on every push.

## Decision 1: A real Content Security Policy from day one

I usually retrofit CSP at the end of a project and pay for it in whack-a-mole hashes. This time I started with a strict policy in \`vercel.json\` and built around it. No \`unsafe-inline\` for scripts, nonces for the few inline scripts I actually need, explicit \`connect-src\` for the API. It took an afternoon to get the dark-mode bootstrap script working with a nonce, but after that every new feature had to play by the rules from the start.

The lesson isn't "CSP is hard" — it's that retrofitting any security policy is harder than designing for it.

## Decision 2: RLS as the only authorization layer

Every Supabase table has row-level security on. The NestJS layer doesn't enforce ownership in code — it just forwards the user JWT to Supabase and lets Postgres reject anything the user shouldn't touch. Less code, fewer places for a bug to hide, and the policy lives next to the schema.

A typical policy looks like this:

\`\`\`sql
create policy "owners can manage their projects"
on public.projects
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
\`\`\`

That's the entire authorization rule for that table. No middleware, no service-layer checks, no \`if (project.ownerId !== user.id)\` scattered through controllers. When I add a new endpoint I just write the query and trust Postgres to do the right thing.

## Decision 3: Killing the dark-mode flicker

Anything that reads \`localStorage\` to pick a theme on the client will flash the wrong color on first paint. The fix is the oldest trick in the book — a tiny inline script in \`index.html\` that runs before Angular bootstraps:

\`\`\`typescript
(function () {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored ?? (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset['theme'] = theme;
  } catch (_) {
    document.documentElement.dataset['theme'] = 'dark';
  }
})();
\`\`\`

The catch is that with a strict CSP this script needs a nonce, and with SSR you also have to make sure Angular doesn't overwrite the attribute on hydration. I ended up writing a tiny \`ThemeService\` that reads the same attribute on the client and never assumes a starting state. No flash, no hydration mismatch, no \`[attr.data-theme]\` binding fighting the bootstrap script.

## What I'd do differently

Honestly, not much for v1. The piece I keep going back and forth on is whether the blog itself should live in the database (so I could edit it from the admin panel) or stay in the repo as Markdown. For now Markdown wins — Git history is the editorial workflow, and there's no ceremony to publish.

If you want to see how any of this is wired up, the code is on [GitHub](https://github.com/adrijimcab). Issues and pull requests welcome.
`,
};

const RAW_POSTS: readonly RawPost[] = [welcome];

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const POSTS: readonly BlogPost[] = RAW_POSTS.map((post) => ({
  ...post,
  readingTimeMinutes: calculateReadingTime(post.content),
})).sort((a, b) => (a.date < b.date ? 1 : -1));
