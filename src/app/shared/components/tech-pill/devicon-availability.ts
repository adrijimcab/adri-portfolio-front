/**
 * Devicon availability cache + alternative icon sources.
 *
 * Some tech slugs in the database reference devicon assets that don't
 * exist on jsdelivr (e.g. `highcharts`, `webcomponents`). For those, we
 * combine three strategies so every pill renders SOMETHING without
 * triggering CORB warnings:
 *
 *   1. STATIC_BLOCKLIST — slugs we know for sure are missing from
 *      devicon (probed manually). These never go through the devicon
 *      fetch path at all.
 *   2. BRAND_ICON_CDN — slugs that exist in `simple-icons` but not in
 *      devicon. Rendered via the alternate CDN URL.
 *   3. GENERIC_ICON_SVG — inline SVG fallbacks (Heroicons/Lucide-style)
 *      for slugs that no public brand CDN ships. Rendered via srcdoc
 *      data URI so the component behaves like a normal <img>.
 *
 * The runtime Set (plus localStorage persistence) still captures any
 * NEW failures discovered after shipping — so future broken slugs are
 * quarantined to a single request across the whole session.
 */

const STORAGE_KEY = 'devicon-failed-v1';

/**
 * Confirmed missing from devicon (both -original and -plain return 403).
 * Verified against the live jsdelivr endpoint.
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
 * Slugs where devicon only ships `-plain.svg` (no -original). Without
 * this map the first render would request `-original`, get a 403, CORB
 * would log a warning, and only THEN the component would fall back to
 * `-plain`. The override short-circuits the doomed first request.
 */
export const VARIANT_OVERRIDES: Readonly<Record<string, 'original' | 'plain'>> = {
  jest: 'plain',
};

/**
 * Slugs with a brand icon hosted by simple-icons (jsdelivr mirror).
 * Used when devicon is missing but a proper brand mark exists elsewhere.
 */
export const BRAND_ICON_CDN: Readonly<Record<string, string>> = {
  amazonwebservices:
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonwebservices.svg',
  cypress: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/cypress.svg',
  reactivex:
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/reactivex.svg',
};

/**
 * Inline SVG fallbacks for slugs that have no public brand icon at all.
 * Kept small and monochromatic so they inherit the pill color naturally
 * when injected as a data URI.
 */
const rawSvg = (path: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

export const GENERIC_ICON_SVG: Readonly<Record<string, string>> = {
  highcharts: rawSvg(
    '<path d="M3 3v18h18"/><path d="M7 17l4-6 4 4 4-8"/>',
  ),
  webcomponents: rawSvg(
    '<path d="M12 2l3 3-3 3-3-3 3-3z"/><path d="M19 9l3 3-3 3-3-3 3-3z"/><path d="M5 9l3 3-3 3-3-3 3-3z"/><path d="M12 16l3 3-3 3-3-3 3-3z"/>',
  ),
  websocket: rawSvg(
    '<path d="M7 7l-4 5 4 5"/><path d="M17 7l4 5-4 5"/><path d="M14 5l-4 14"/>',
  ),
};

export function getInlineIconDataUri(slug: string): string | null {
  const svg = GENERIC_ICON_SVG[slug];
  if (!svg) return null;
  // encodeURIComponent keeps the data URI compatible with every browser
  // without the 20% overhead of base64 and stays inside a single <img src>.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ============================================================================
// Runtime availability cache — fallback when a NEW slug breaks in production
// ============================================================================

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
    // corrupt cache is not fatal
  }
}

function persistToStorage(): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...blockedSet]));
  } catch {
    // storage quota / private mode
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

/**
 * Returns true if the slug has ANY icon source — devicon, simple-icons
 * CDN, or an inline SVG fallback. Used by the component to decide
 * whether to render an <img> at all.
 */
export function hasAnyIconSource(slug: string): boolean {
  if (!slug) return false;
  if (BRAND_ICON_CDN[slug]) return true;
  if (GENERIC_ICON_SVG[slug]) return true;
  return !isSlugFailed(slug);
}
