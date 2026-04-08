import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    // Clean any JSON-LD scripts from previous tests
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  describe('updateMeta', () => {
    it('sets the document title when a title is provided', () => {
      service.updateMeta({ title: 'Adrián Jiménez - Portfolio' });
      expect(document.title).toBe('Adrián Jiménez - Portfolio');
    });

    it('strips HTML angle brackets and javascript: protocol from title', () => {
      service.updateMeta({ title: '<script>alert(1)</script>javascript:evil' });
      expect(document.title).not.toContain('<');
      expect(document.title).not.toContain('>');
      expect(document.title.toLowerCase()).not.toContain('javascript:');
    });

    it('defaults og:type to website when not specified', () => {
      service.updateMeta({ title: 'Home' });
      const tag = document.querySelector('meta[property="og:type"]');
      expect(tag?.getAttribute('content')).toBe('website');
    });

    it('respects an explicit og:type value', () => {
      service.updateMeta({ title: 'Post', type: 'article' });
      const tag = document.querySelector('meta[property="og:type"]');
      expect(tag?.getAttribute('content')).toBe('article');
    });

    it('rejects non-http URLs for og:url (only https/http allowed)', () => {
      service.updateMeta({ title: 'X', url: 'javascript:alert(1)' });
      const tag = document.querySelector('meta[property="og:url"]');
      // If no valid URL, the tag is not set with a bad value
      expect(tag?.getAttribute('content') ?? '').not.toContain('javascript:');
    });
  });

  describe('setPersonSchema', () => {
    it('serializes a Person schema with sameAs LinkedIn and GitHub', () => {
      service.setPersonSchema({ full_name: 'Adrián Jiménez Cabello', title: 'Full Stack' });
      const script = document.querySelector('script#schema-person');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent ?? '{}') as Record<string, unknown>;
      expect(json['@type']).toBe('Person');
      expect(Array.isArray(json['sameAs'])).toBe(true);
      const sameAs = json['sameAs'] as string[];
      expect(sameAs.some((u) => u.includes('linkedin.com'))).toBe(true);
      expect(sameAs.some((u) => u.includes('github.com'))).toBe(true);
    });
  });

  describe('setBreadcrumbList', () => {
    it('emits ordered ListItem positions starting at 1', () => {
      service.setBreadcrumbList([
        { name: 'Home', url: 'https://example.com/' },
        { name: 'Blog', url: 'https://example.com/blog' },
      ]);
      const script = document.querySelector('script#schema-breadcrumb');
      const json = JSON.parse(script!.textContent ?? '{}') as {
        itemListElement: { position: number; name: string; item: string }[];
      };
      expect(json.itemListElement).toHaveLength(2);
      expect(json.itemListElement[0].position).toBe(1);
      expect(json.itemListElement[1].position).toBe(2);
      expect(json.itemListElement[0].name).toBe('Home');
    });
  });
});
