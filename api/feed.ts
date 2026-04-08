/**
 * JSON Feed v1.1 for the blog.
 *
 * Served at /feed.json via vercel.json rewrite.
 * Spec: https://www.jsonfeed.org/version/1.1/
 *
 * Same source of truth as the Atom feed (`api/rss.ts`) — see the TODO in
 * `_blog-posts.ts` for the migration to a public API endpoint.
 */
import { FEED_POSTS_SORTED, type BlogPostFeedEntry } from './_blog-posts.js';

const SITE_URL = 'https://adrianjimenezcabello.dev';
const FEED_URL = `${SITE_URL}/feed.json`;
const AUTHOR_NAME = 'Adrián Jiménez Cabello';
const AUTHOR_URL = SITE_URL;
const FEED_TITLE = 'Adrián Jiménez Cabello — Blog';
const FEED_DESCRIPTION =
  'Notes on Angular, NestJS, architecture, and shipping production software.';
const LANGUAGE = 'en';

interface JsonFeedAuthor {
  readonly name: string;
  readonly url: string;
}

interface JsonFeedItem {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly summary: string;
  readonly content_text: string;
  readonly date_published: string;
  readonly date_modified: string;
  readonly authors: readonly JsonFeedAuthor[];
  readonly tags?: readonly string[];
  readonly language: string;
}

interface JsonFeed {
  readonly version: 'https://jsonfeed.org/version/1.1';
  readonly title: string;
  readonly home_page_url: string;
  readonly feed_url: string;
  readonly description: string;
  readonly language: string;
  readonly authors: readonly JsonFeedAuthor[];
  readonly items: readonly JsonFeedItem[];
}

function toIso(dateString: string): string {
  const parsed = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0).toISOString();
  }
  return parsed.toISOString();
}

function toJsonFeedItem(post: BlogPostFeedEntry): JsonFeedItem {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const published = toIso(post.date);
  return {
    id: url,
    url,
    title: post.title,
    summary: post.description,
    content_text: post.description,
    date_published: published,
    date_modified: published,
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
    tags: post.tags,
    language: LANGUAGE,
  };
}

function buildFeed(posts: readonly BlogPostFeedEntry[]): JsonFeed {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: FEED_TITLE,
    home_page_url: SITE_URL,
    feed_url: FEED_URL,
    description: FEED_DESCRIPTION,
    language: LANGUAGE,
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
    items: posts.map(toJsonFeedItem),
  };
}

export function GET(_request: Request): Response {
  try {
    const feed = buildFeed(FEED_POSTS_SORTED);
    return new Response(JSON.stringify(feed, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[api/feed] failed to render JSON feed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to render JSON Feed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }
}
