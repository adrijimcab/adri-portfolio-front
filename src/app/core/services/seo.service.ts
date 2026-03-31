import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  updateMeta(config: { title?: string; description?: string; image?: string; url?: string }) {
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
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
      url: profile.url ?? 'https://adri-portfolio-front.vercel.app',
      sameAs: [
        'https://www.linkedin.com/in/adrianjimenezcabello',
        'https://github.com/adrijimcab',
      ],
    });
  }
}
