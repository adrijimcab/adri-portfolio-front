/**
 * Devicon availability cache.
 *
 * Some tech slugs in the database reference devicon assets that don't exist
 * on jsdelivr (e.g. `highcharts`, `websocket`, etc.). Those fetches return
 * 403 with an HTML error page, which triggers a Chromium CORB warning every
 * time — one per broken <img>. To prevent the console spam we combine two
 * layers:
 *
 *  1. A hardcoded blocklist of slugs that we already know are broken.
 *     These are never requested — the <img> element never renders.
 *  2. A persistent Set stored in localStorage that accumulates slugs
 *     reported as failed at runtime. Survives reloads, so a tab that has
 *     visited the site once will never re-request the same broken asset.
 */

const STORAGE_KEY = 'devicon-failed-v1';

/**
 * Slugs confirmed missing from devicon CDN (both -original AND -plain
 * return 403). Verified 2026-04-08 against the live jsdelivr endpoint.
 * These NEVER render <img>, so there is zero CORB noise for them.
 */
const STATIC_BLOCKLIST: readonly string[] = [
  'amazonwebservices',
  'cypress',
  'highcharts',
  'reactivex',
  'webcomponents',
  'websocket',
];

/**
 * Slugs where devicon only ships `-plain.svg` (no -original). Without this
 * map we'd request `-original` first, get a 403, CORB would log a warning,
 * and only then fall back to `-plain`. Using the override avoids the first
 * failed request entirely.
 */
export const VARIANT_OVERRIDES: Readonly<Record<string, 'original' | 'plain'>> = {
  jest: 'plain',
};

const blockedSet = new Set<string>(STATIC_BLOCKLIST);

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function hydrateFromStorage(): void {
  if (!hasLocalStorage()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (typeof entry === 'string') blockedSet.add(entry);
      }
    }
  } catch {
    // swallow — corrupt cache is not fatal
  }
}

function persistToStorage(): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...blockedSet]));
  } catch {
    // swallow — storage quota / private mode
  }
}

let hydrated = false;

export function markSlugFailed(slug: string): void {
  if (!slug) return;
  if (!hydrated && hasLocalStorage()) {
    hydrateFromStorage();
    hydrated = true;
  }
  blockedSet.add(slug);
  persistToStorage();
}

export function isSlugFailed(slug: string): boolean {
  if (!slug) return false;
  if (!hydrated && hasLocalStorage()) {
    hydrateFromStorage();
    hydrated = true;
  }
  return blockedSet.has(slug);
}
