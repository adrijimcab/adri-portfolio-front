import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

const MAX_TITLE_LEN = 200;
const MAX_DESC_LEN = 500;
const MAX_URL_LEN = 2048;

/**
 * Strip control chars, HTML brackets, JS protocol, and clamp length.
 * Defense-in-depth: Angular's interpolation already escapes, but meta tags
 * and JSON-LD bypass that boundary, so we sanitize at the source.
 */
function sanitizeText(value: string | null | undefined, maxLen: number): string {
  if (!value) return '';
  return value
    .replace(/[<>\u0000-\u001F\u007F]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

function sanitizeUrl(value: string | null | undefined): string {
  const cleaned = sanitizeText(value, MAX_URL_LEN);
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) return '';
  return cleaned;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);

  updateMeta(config: { title?: string; description?: string; image?: string; url?: string }) {
    const safeTitle = sanitizeText(config.title, MAX_TITLE_LEN);
    const safeDescription = sanitizeText(config.description, MAX_DESC_LEN);
    const safeImage = sanitizeUrl(config.image);
    const safeUrl = sanitizeUrl(config.url);

    if (safeTitle) {
      this.title.setTitle(safeTitle);
      this.meta.updateTag({ property: 'og:title', content: safeTitle });
      this.meta.updateTag({ name: 'twitter:title', content: safeTitle });
    }
    if (safeDescription) {
      this.meta.updateTag({ name: 'description', content: safeDescription });
      this.meta.updateTag({ property: 'og:description', content: safeDescription });
      this.meta.updateTag({ name: 'twitter:description', content: safeDescription });
    }
    if (safeImage) {
      this.meta.updateTag({ property: 'og:image', content: safeImage });
      this.meta.updateTag({ name: 'twitter:image', content: safeImage });
    }
    if (safeUrl) {
      this.meta.updateTag({ property: 'og:url', content: safeUrl });
    }
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setJsonLd(data: Record<string, unknown>) {
    const existingScript = this.doc.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(data);
    } else {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      this.doc.head.appendChild(script);
    }
  }

  setPersonSchema(profile: { full_name: string; title: string; email?: string | null; location?: string | null; url?: string }) {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.full_name,
      jobTitle: profile.title,
      email: profile.email ?? undefined,
      address: profile.location ? { '@type': 'PostalAddress', addressLocality: profile.location } : undefined,
      url: profile.url ?? 'https://adrianjimenezcabello.dev',
      sameAs: [
        'https://www.linkedin.com/in/adrianjimenezcabello',
        'https://github.com/adrijimcab',
      ],
    });
  }
}
