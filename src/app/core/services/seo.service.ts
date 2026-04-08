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
    // Control characters (U+0000..U+001F, U+007F) are intentionally stripped for SEO/JSON-LD safety.
    // eslint-disable-next-line no-control-regex
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

  setJsonLd(data: Record<string, unknown>, id: string) {
    const selector = `script[type="application/ld+json"]#${id}`;
    const existing = this.doc.querySelector(selector);
    if (existing) {
      existing.textContent = JSON.stringify(data);
    } else {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(data);
      this.doc.head.appendChild(script);
    }
  }

  setPersonSchema(profile: { full_name: string; title: string; email?: string | null; location?: string | null; url?: string }) {
    const address: Record<string, string> = profile.location
      ? { '@type': 'PostalAddress', addressLocality: profile.location, addressCountry: 'ES' }
      : { '@type': 'PostalAddress', addressCountry: 'ES' };

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://adrianjimenezcabello.dev/#person',
      name: profile.full_name,
      givenName: 'Adrián',
      familyName: 'Jiménez Cabello',
      alternateName: ['Adrian Jimenez', 'Adrián Jiménez', 'Adri Jiménez'],
      jobTitle: profile.title,
      url: 'https://adrianjimenezcabello.dev',
      image: 'https://adrianjimenezcabello.dev/og-image.png',
      address,
      nationality: { '@type': 'Country', name: 'Spain' },
      knowsAbout: [
        'Angular', 'NestJS', 'React', 'TypeScript', 'Node.js',
        'Supabase', 'PostgreSQL', 'Tailwind CSS', 'SSR',
        'Full Stack Development', 'Frontend Architecture',
        'Clean Architecture', 'Design Patterns',
      ],
      sameAs: [
        'https://www.linkedin.com/in/adrianjimenezcabello',
        'https://github.com/adrijimcab',
      ],
    };

    if (profile.email) {
      schema['email'] = profile.email;
    }

    this.setJsonLd(schema, 'schema-person');
  }

  setWebSiteSchema() {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://adrianjimenezcabello.dev/#website',
      url: 'https://adrianjimenezcabello.dev/',
      name: 'Adrián Jiménez Cabello',
      description: 'Portfolio personal de Adrián Jiménez Cabello, Full Stack Developer especializado en Angular, NestJS y React.',
      inLanguage: ['es', 'en'],
      author: { '@id': 'https://adrianjimenezcabello.dev/#person' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://adrianjimenezcabello.dev/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }, 'schema-website');
  }

  setProfessionalServiceSchema() {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': 'https://adrianjimenezcabello.dev/#service',
      name: 'Full Stack Development Services',
      provider: { '@id': 'https://adrianjimenezcabello.dev/#person' },
      areaServed: { '@type': 'Country', name: 'Spain' },
      serviceType: ['Web Development', 'Frontend Development', 'Backend Development'],
    }, 'schema-service');
  }
}
