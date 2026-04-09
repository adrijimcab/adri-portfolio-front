/**
 * Dynamic Open Graph image generator.
 *
 * Usage: GET /api/og?title=...&description=...&type=blog|project|page
 *
 * Returns a 1200x630 PNG rendered via @vercel/og (Satori + Resvg).
 * Cached on Vercel's CDN — the URL carries every variant so cache hits are cheap.
 *
 * Uses Satori-compatible object literals instead of JSX — no React or TSX needed.
 * Satori accepts { type, props: { children, style, ... } } nodes directly.
 */
import { ImageResponse } from '@vercel/og';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 400;
const DEFAULT_TITLE = 'Adrián Jiménez Cabello';
const DEFAULT_DESCRIPTION = 'Full Stack Developer — Angular, NestJS, React';
const SITE_DOMAIN = 'adrianjimenezcabello.dev';

const TYPE_LABELS = {
  blog: 'Blog post',
  project: 'Project',
  page: 'Portfolio',
};

/**
 * Strip HTML tags, trim, and clamp length.
 */
function sanitize(value, fallback, maxLength) {
  if (!value) return fallback;
  const stripped = value.replace(/<[^>]*>/g, '').trim();
  if (stripped.length === 0) return fallback;
  return stripped.length > maxLength ? `${stripped.slice(0, maxLength - 1)}…` : stripped;
}

function parseType(value) {
  if (value === 'blog' || value === 'project' || value === 'page') return value;
  return 'page';
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || 'adrianjimenezcabello.dev'}`);
    const title = sanitize(url.searchParams.get('title'), DEFAULT_TITLE, MAX_TITLE_LENGTH);
    const description = sanitize(
      url.searchParams.get('description'),
      DEFAULT_DESCRIPTION,
      MAX_DESCRIPTION_LENGTH,
    );
    const ogType = parseType(url.searchParams.get('type'));
    const typeLabel = TYPE_LABELS[ogType];

    const imageResponse = new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '80px',
            backgroundColor: '#0a0a0a',
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(99, 102, 241, 0.25), transparent 60%), radial-gradient(ellipse 80% 60% at 100% 100%, rgba(236, 72, 153, 0.18), transparent 60%)',
            color: '#fafafa',
            fontFamily: 'Inter, sans-serif',
          },
          children: [
            // Top row: type label + AJC monogram
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        padding: '10px 22px',
                        borderRadius: '999px',
                        border: '1px solid rgba(250, 250, 250, 0.18)',
                        backgroundColor: 'rgba(250, 250, 250, 0.06)',
                        fontSize: 24,
                        fontWeight: 500,
                        color: '#d4d4d8',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                      },
                      children: typeLabel,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 88,
                        height: 88,
                        borderRadius: '999px',
                        border: '2px solid rgba(250, 250, 250, 0.22)',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        fontSize: 30,
                        fontWeight: 700,
                        color: '#fafafa',
                        letterSpacing: '1px',
                      },
                      children: 'AJC',
                    },
                  },
                ],
              },
            },
            // Middle: title + description
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: 28 },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: title.length > 80 ? 64 : 80,
                        fontWeight: 800,
                        lineHeight: 1.05,
                        color: '#fafafa',
                        letterSpacing: '-2px',
                        textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                      },
                      children: title,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 32,
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: '#a1a1aa',
                        display: 'flex',
                      },
                      children: description,
                    },
                  },
                ],
              },
            },
            // Bottom row: domain + "Full Stack Developer"
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  fontSize: 26,
                  color: '#a1a1aa',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontWeight: 600, color: '#fafafa' },
                      children: SITE_DOMAIN,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', gap: 12 },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: 10,
                              height: 10,
                              borderRadius: '999px',
                              backgroundColor: '#22c55e',
                              display: 'flex',
                            },
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex' },
                            children: 'Full Stack Developer',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { width: 1200, height: 630 },
    );
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, immutable, no-transform, max-age=31536000');
    res.status(200).send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('[api/og] failed to generate image:', message, error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`Failed to generate OG image: ${message}`);
  }
}
