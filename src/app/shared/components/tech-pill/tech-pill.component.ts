import { Component, ChangeDetectionStrategy, computed, input, signal } from '@angular/core';
import {
  BRAND_ICON_CDN,
  VARIANT_OVERRIDES,
  getInlineIconDataUri,
  hasAnyIconSource,
  markSlugFailed,
} from './devicon-availability';

@Component({
  selector: 'app-tech-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all duration-200 hover:scale-105"
          style="border-color: color-mix(in srgb, var(--color-primary) 30%, transparent); background: color-mix(in srgb, var(--color-primary) 8%, transparent); color: var(--color-primary);">
      @if (iconUrl()) {
        <img [src]="iconUrl()!"
             [alt]="name()"
             class="h-3.5 w-3.5"
             loading="lazy"
             decoding="async"
             (error)="onIconError()" />
      }
      {{ name() }}
    </span>
  `,
})
export class TechPillComponent {
  name = input.required<string>();
  iconSlug = input<string>('');

  // First attempt failed — try the next source in the cascade.
  readonly attemptedPlain = signal(false);
  readonly hardFailed = signal(false);

  readonly iconUrl = computed<string | null>(() => {
    const slug = this.iconSlug();
    if (!slug || this.hardFailed() || !hasAnyIconSource(slug)) {
      return null;
    }

    // 1. Inline SVG data URI (zero network, can't fail) wins first.
    const inline = getInlineIconDataUri(slug);
    if (inline) return inline;

    // 2. Brand icon on simple-icons CDN (for slugs missing from devicon).
    const brandCdn = BRAND_ICON_CDN[slug];
    if (brandCdn) return brandCdn;

    // 3. Devicon — try the preferred variant for this slug, then -plain
    //    as fallback (some slugs only ship -plain, e.g. jest).
    const preferred = VARIANT_OVERRIDES[slug];
    const variant = preferred ?? (this.attemptedPlain() ? 'plain' : 'original');
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${variant}.svg`;
  });

  onIconError(): void {
    const slug = this.iconSlug();
    if (!slug) {
      this.hardFailed.set(true);
      return;
    }

    // If the override was already applied OR we already fell back to plain,
    // there's nothing else to try — mark the slug as failed for the session
    // so sibling pills with the same slug never re-request it.
    if (VARIANT_OVERRIDES[slug] || this.attemptedPlain()) {
      markSlugFailed(slug);
      this.hardFailed.set(true);
      return;
    }

    this.attemptedPlain.set(true);
  }
}
