/**
 * JSON Feed v1.1 for the blog.
 *
 * Served at /feed.json via vercel.json rewrite.
 * Spec: https://www.jsonfeed.org/version/1.1/
 *
 * Same source of truth as the Atom feed (`api/rss.mjs`) — see the TODO in
 * `_blog-posts.mjs` for the migration to a public API endpoint.
 */
import { FEED_POSTS_SORTED } from './_blog-posts.mjs';

const SITE_URL = 'https://adrianjimenezcabello.dev';
const FEED_URL = `${SITE_URL}/feed.json`;
const AUTHOR_NAME = 'Adrián Jiménez Cabello';
const AUTHOR_URL = SITE_URL;
const FEED_TITLE = 'Adrián Jiménez Cabello — Blog';
const FEED_DESCRIPTION =
  'Notes on Angular, NestJS, architecture, and shipping production software.';
const LANGUAGE = 'en';

function toIso(dateString) {
  const parsed = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0).toISOString();
  }
  return parsed.toISOString();
}

function toJsonFeedItem(post) {
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

function buildFeed(posts) {
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

export default function handler(_req, res) {
  try {
    const feed = buildFeed(FEED_POSTS_SORTED);
    res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(JSON.stringify(feed, null, 2));
  } catch (error) {
    console.error('[api/feed] failed to render JSON feed:', error);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).send(JSON.stringify({ error: 'Failed to render JSON Feed' }));
  }
}
