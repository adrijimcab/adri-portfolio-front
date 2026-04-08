import type { BlogPost } from '../../app/features/blog/blog.types';

type RawPost = Omit<BlogPost, 'readingTimeMinutes'>;

const welcome: RawPost = {
  slug: 'welcome',
  title: 'Building this portfolio: Angular 21, NestJS, Supabase',
  description:
    'The stack, the decisions that took longer than they should have, and what I learned shipping it in a week.',
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

const shippingWithAgents: RawPost = {
  slug: 'shipping-with-agents',
  title: 'Shipping a production portfolio with AI sub-agents in one session',
  description:
    'What worked, what broke, and five rules I keep reaching for whenever I let autonomous agents touch a real codebase.',
  date: '2026-04-08',
  content: `## The setup

I spent one session building this portfolio end to end: auditing the codebase, implementing every feature from a competitor scrape, fixing the bugs I introduced, and deploying to three services. The catch: I did most of the execution through autonomous sub-agents running in parallel, while the main thread orchestrated, verified and committed.

This isn't a sales pitch for AI coding. It's a list of the things I had to learn the hard way for this to actually work.

## Rule 1: Delegate implementation, not decisions

Agents are great at writing a hundred lines of boilerplate across seven files. They are terrible at choosing between two architectures. Every time I handed a decision to an agent, I got a plausible-sounding answer that I then had to re-evaluate anyway.

The split I landed on: the main thread decides what to build and how it fits together. The agent decides which exact lines to type.

## Rule 2: Sandbox tooling is a real constraint

Half of my sub-agents couldn't run \`git commit\`. Half could. There was no documented way to know in advance. The pattern that eventually worked: agents write and stage files, the main thread finalizes commits. Treat every sub-agent as a writer, not a releaser.

## Rule 3: Trust the type checker, verify the runtime

I used \`IntersectionType\` from \`@nestjs/swagger\` to combine two DTOs. TypeScript happily compiled. The server happily deployed. And then three list endpoints started throwing "undefined is not iterable" in production because \`IntersectionType\` doesn't preserve class getters. The fix took thirty seconds once I understood it:

\`\`\`ts
// Before: relied on a getter that didn't survive IntersectionType
get range(): [number, number] {
  const from = this.skip;
  return [from, from + this.limit - 1];
}

// After: plain helper function, no class involved
export function computeRange(page?: number, limit?: number): [number, number] {
  const safePage = page ?? 1;
  const safeLimit = limit ?? 20;
  const from = (safePage - 1) * safeLimit;
  return [from, from + safeLimit - 1];
}
\`\`\`

Every time you rely on framework machinery to carry behavior through a transformation, add a real end-to-end smoke test.

## Rule 4: Parallel means different files

I tried running two sub-agents on the same repo in parallel. Both touched \`package.json\`. Both wrote components. Before spawning parallel agents now, I map the files each one will touch. If two agents would touch the same file, they run sequentially.

## Rule 5: Always verify in production, not in the build

\`npm run build\` passed. \`npm run lint\` was clean. TypeScript was happy. Nothing caught the \`IntersectionType\` bug because it was a runtime problem. Every production-affecting commit now goes through a smoke test of the real endpoints.

## What I'd do differently next time

Start with the hardest architectural decision first, with me alone, before any agent touches the repo. Once the skeleton is in place, unleash the agents on features. Planning quality drops noticeably when you delegate it.

The portfolio you're reading this on was built with about a dozen sub-agent invocations, two Railway rate-limit incidents, and one production hotfix. Worth it.
`,
};

const railwayMultiHop: RawPost = {
  slug: 'railway-trust-proxy',
  title: 'The throttler that never fired: Railway, trust proxy, and the hour I lost',
  description:
    'A short debugging story about rate limiting, ingress proxies, and why "trust proxy 1" is wrong on Railway.',
  date: '2026-04-08',
  content: `## The symptom

I had just hardened the API with \`@nestjs/throttler\`. The config looked fine. The route decorator looked fine. The response headers even showed \`x-ratelimit-limit: 5\` when hitting \`/auth/login\`. But no matter how many requests I fired, the 429 never came. Every call returned 401.

I bounced through three wrong explanations before I finally looked at the logs.

## The logs told me everything

Three consecutive requests to the same endpoint, from the same curl on the same machine, were showing up in Pino with different IPs:

\`\`\`
req {"id":3,"url":"/api/auth/login","ip":"::ffff:100.64.0.14"}
req {"id":4,"url":"/api/auth/login","ip":"::ffff:100.64.0.20"}
req {"id":5,"url":"/api/auth/login","ip":"::ffff:100.64.0.23"}
\`\`\`

Railway's ingress doesn't hand your container a single proxy hop. It hands you a fleet of internal gateway nodes, each with its own \`100.64.x.x\` address. Every request bounces through a different one. To Express, each request looked like a brand new client, so the throttler's per-IP bucket was always empty.

## The fix

I had set \`app.set('trust proxy', 1)\` — trust the first proxy in the chain. That's the recommended setting for a single-hop ingress like Vercel or Heroku. On Railway it's exactly wrong: \`1\` trusts only the first hop, so the IP Express reads is still whichever internal gateway the request bounced off, not the original client.

The correction is one character:

\`\`\`ts
// Before
app.set('trust proxy', 1);

// After — trust the full chain and read the first x-forwarded-for entry
app.set('trust proxy', true);
\`\`\`

With \`true\`, Express walks back to the start of \`x-forwarded-for\` and uses that as \`req.ip\`. The throttler suddenly saw the real client, accumulated hits, and fired the 429 on request six.

## The generalisation

Every time I've hit a rate limit bug in the last five years, the answer has been "you're behind a proxy you didn't know about". Cloudflare, Heroku, Fly, Railway — they all insert hops. The fix is always the same: look at what \`req.ip\` actually resolves to on the server, not what you think it should be.

If you're deploying a Nest or Express app on Railway today, add \`trust proxy\` to your setup. It takes ten seconds and it prevents an entire category of silent failures.
`,
};

const RAW_POSTS: readonly RawPost[] = [welcome, shippingWithAgents, railwayMultiHop];

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const POSTS: readonly BlogPost[] = RAW_POSTS.map((post) => ({
  ...post,
  readingTimeMinutes: calculateReadingTime(post.content),
})).sort((a, b) => (a.date < b.date ? 1 : -1));
