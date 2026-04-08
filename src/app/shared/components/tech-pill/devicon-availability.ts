/** Process-wide set of devicon slugs that returned 403/404. */
const failedSlugs = new Set<string>();

export function markSlugFailed(slug: string): void {
  failedSlugs.add(slug);
}

export function isSlugFailed(slug: string): boolean {
  return failedSlugs.has(slug);
}
