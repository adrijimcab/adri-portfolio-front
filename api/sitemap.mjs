/**
 * Dynamic sitemap.xml generator.
 *
 * Served at /sitemap.xml via vercel.json rewrite. Combines the hard-coded list
 * of static Angular routes with dynamic entries fetched from the NestJS API
 * (projects + certifications). If the API is slow or unreachable we still
 * serve the static routes — better a partial sitemap than a 500.
 */

const SITE_URL = 'https://adrianjimenezcabello.dev';
const API_URL = 'https://adri-portfolio-api-production.up.railway.app/api';
const FETCH_TIMEOUT_MS = 5000;

const STATIC_ENTRIES = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/projects', changefreq: 'weekly', priority: 0.9 },
  { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
  { loc: '/cv', changefreq: 'monthly', priority: 0.7 },
  { loc: '/stack', changefreq: 'monthly', priority: 0.6 },
  { loc: '/uses', changefreq: 'monthly', priority: 0.6 },
  { loc: '/now', changefreq: 'weekly', priority: 0.6 },
  { loc: '/lab', changefreq: 'monthly', priority: 0.5 },
];

/**
 * Minimal XML text escaper for sitemap `<loc>` values. Per RFC 3986 URL
 * chars rarely need escaping, but `&` MUST be escaped to produce valid XML.
 */
function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

async function fetchWithTimeout(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[api/sitemap] fetch ${path} failed:`, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchProjectEntries() {
  const payload = await fetchWithTimeout('/projects');
  if (!payload?.data) return [];
  return payload.data
    .filter((p) => typeof p.slug === 'string' && p.slug.length > 0)
    .map((project) => ({
      loc: `/projects/${project.slug}`,
      lastmod: toIsoDate(project.updated_at),
      changefreq: 'monthly',
      priority: 0.7,
    }));
}

function buildBlogEntries(posts) {
  return posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    lastmod: toIsoDate(post.date),
    changefreq: 'monthly',
    priority: 0.6,
  }));
}

function renderEntry(entry) {
  const parts = [
    `    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
  ];
  if (entry.lastmod) {
    parts.splice(1, 0, `    <lastmod>${entry.lastmod}</lastmod>`);
  }
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

function renderSitemap(entries) {
  const body = entries.map(renderEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const runtime = 'edge';

export default async function handler(_request) {
  try {
    const { FEED_POSTS_SORTED } = await import('./_blog-posts.mjs');
    const projectEntries = await fetchProjectEntries();
    const blogEntries = buildBlogEntries(FEED_POSTS_SORTED);

    const allEntries = [
      ...STATIC_ENTRIES,
      ...projectEntries,
      ...blogEntries,
    ];

    return new Response(renderSitemap(allEntries), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[api/sitemap] failed, serving static fallback:', error);
    return new Response(renderSitemap(STATIC_ENTRIES), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
