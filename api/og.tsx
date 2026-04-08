/**
 * Dynamic Open Graph image generator.
 *
 * Usage: GET /api/og?title=...&description=...&type=blog|project|page
 *
 * Returns a 1200x630 PNG rendered via @vercel/og (Satori + Resvg).
 * Cached on Vercel's CDN — the URL carries every variant so cache hits are cheap.
 *
 * JSX is compiled with the classic factory (`h` / `Fragment` below) configured
 * in api/tsconfig.json. Satori consumes `{ type, props }` shaped nodes, so we
 * avoid pulling in React just to render static markup.
 */
import { ImageResponse } from '@vercel/og';

type VNodeProps = Record<string, unknown> & { children?: unknown };
interface VNode {
  readonly type: string;
  readonly props: VNodeProps;
  readonly key: string | null;
}

// Classic JSX factory — referenced by api/tsconfig.json (`jsxFactory: "h"`).
function h(type: string, props: VNodeProps | null, ...children: unknown[]): VNode {
  const flat = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
  const finalChildren = flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat;
  return {
    type,
    props: { ...(props ?? {}), children: finalChildren },
    key: null,
  };
}
const Fragment = 'fragment';

export const config = {
  runtime: 'nodejs',
};

type OgType = 'blog' | 'project' | 'page';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 400;
const DEFAULT_TITLE = 'Adrián Jiménez Cabello';
const DEFAULT_DESCRIPTION = 'Full Stack Developer — Angular, NestJS, React';
const SITE_DOMAIN = 'adrianjimenezcabello.dev';

const TYPE_LABELS: Record<OgType, string> = {
  blog: 'Blog post',
  project: 'Project',
  page: 'Portfolio',
};

/**
 * Strip HTML tags, trim, and clamp length.
 * Cheap sanitization so user-supplied query strings can't inject markup into
 * downstream consumers that might echo them back unescaped.
 */
function sanitize(value: string | null, fallback: string, maxLength: number): string {
  if (!value) return fallback;
  const stripped = value.replace(/<[^>]*>/g, '').trim();
  if (stripped.length === 0) return fallback;
  return stripped.length > maxLength ? `${stripped.slice(0, maxLength - 1)}…` : stripped;
}

function parseType(value: string | null): OgType {
  if (value === 'blog' || value === 'project' || value === 'page') return value;
  return 'page';
}

// Suppress "unused" warnings for the JSX factory symbols — they're referenced
// by the compiler, not by name in this file.
void Fragment;

export function GET(request: Request): Response {
  try {
    const url = new URL(request.url);
    const title = sanitize(url.searchParams.get('title'), DEFAULT_TITLE, MAX_TITLE_LENGTH);
    const description = sanitize(
      url.searchParams.get('description'),
      DEFAULT_DESCRIPTION,
      MAX_DESCRIPTION_LENGTH,
    );
    const ogType = parseType(url.searchParams.get('type'));
    const typeLabel = TYPE_LABELS[ogType];

    return new ImageResponse(
      (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
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
              }}
            >
              {typeLabel}
            </div>
            <div
              style={{
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
              }}
            >
              AJC
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div
              style={{
                fontSize: title.length > 80 ? 64 : 80,
                fontWeight: 800,
                lineHeight: 1.05,
                color: '#fafafa',
                letterSpacing: '-2px',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
                display: 'flex',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#a1a1aa',
                display: 'flex',
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              fontSize: 26,
              color: '#a1a1aa',
            }}
          >
            <div style={{ display: 'flex', fontWeight: 600, color: '#fafafa' }}>{SITE_DOMAIN}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '999px',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                }}
              />
              <div style={{ display: 'flex' }}>Full Stack Developer</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('[api/og] failed to generate image:', message, error);
    return new Response(`Failed to generate OG image: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
