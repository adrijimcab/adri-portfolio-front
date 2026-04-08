/**
 * Atom 1.0 feed for the blog.
 *
 * Served at /rss.xml via vercel.json rewrite. Atom over RSS 2.0 because the
 * spec is tighter, the content model is richer, and every modern reader
 * supports it.
 *
 * Posts currently come from a local mirror (`api/_blog-posts.ts`) because the
 * NestJS API does not yet expose a public `/blog/posts` listing endpoint.
 * See the TODO in `_blog-posts.ts` for the migration path.
 */
import { FEED_POSTS_SORTED, type BlogPostFeedEntry } from './_blog-posts.js';

const SITE_URL = 'https://adrianjimenezcabello.dev';
const FEED_URL = `${SITE_URL}/rss.xml`;
const AUTHOR_NAME = 'Adrián Jiménez Cabello';
const AUTHOR_EMAIL = 'hola@adrianjimenezcabello.dev';
const FEED_TITLE = 'Adrián Jiménez Cabello — Blog';
const FEED_SUBTITLE =
  'Notes on Angular, NestJS, architecture, and shipping production software.';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc3339(dateString: string): string {
  // Input format: yyyy-mm-dd. Anchor to midnight UTC for a deterministic feed.
  const parsed = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0).toISOString();
  }
  return parsed.toISOString();
}

function renderCategory(tag: string): string {
  return `    <category term="${escapeXml(tag)}" />`;
}

function renderEntry(post: BlogPostFeedEntry): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const updated = toRfc3339(post.date);
  const categories = (post.tags ?? []).map(renderCategory).join('\n');
  const categoriesBlock = categories.length > 0 ? `\n${categories}` : '';
  return `  <entry>
    <id>${escapeXml(url)}</id>
    <title>${escapeXml(post.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(url)}" />
    <updated>${updated}</updated>
    <published>${updated}</published>
    <author>
      <name>${escapeXml(AUTHOR_NAME)}</name>
      <email>${escapeXml(AUTHOR_EMAIL)}</email>
      <uri>${escapeXml(SITE_URL)}</uri>
    </author>
    <summary type="text">${escapeXml(post.description)}</summary>${categoriesBlock}
  </entry>`;
}

function renderFeed(posts: readonly BlogPostFeedEntry[]): string {
  const latestUpdated =
    posts.length > 0 ? toRfc3339(posts[0]!.date) : new Date().toISOString();
  const entries = posts.map(renderEntry).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <id>${escapeXml(SITE_URL)}/</id>
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>${escapeXml(FEED_SUBTITLE)}</subtitle>
  <link rel="alternate" type="text/html" href="${escapeXml(SITE_URL)}" />
  <link rel="self" type="application/atom+xml" href="${escapeXml(FEED_URL)}" />
  <updated>${latestUpdated}</updated>
  <author>
    <name>${escapeXml(AUTHOR_NAME)}</name>
    <email>${escapeXml(AUTHOR_EMAIL)}</email>
    <uri>${escapeXml(SITE_URL)}</uri>
  </author>
  <rights>© ${new Date().getUTCFullYear()} ${escapeXml(AUTHOR_NAME)}</rights>
  <generator uri="${escapeXml(SITE_URL)}">adri-portfolio-front</generator>
${entries}
</feed>
`;
}

export const runtime = 'edge';

export default function handler(_request: Request): Response {
  try {
    return new Response(renderFeed(FEED_POSTS_SORTED), {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[api/rss] failed to render feed:', error);
    return new Response('Failed to render Atom feed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
