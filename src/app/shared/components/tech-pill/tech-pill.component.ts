import { Component, ChangeDetectionStrategy, computed, effect, input, signal } from '@angular/core';
import { VARIANT_OVERRIDES, isSlugFailed, markSlugFailed } from './devicon-availability';

type IconVariant = 'original' | 'plain';

@Component({
  selector: 'app-tech-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all duration-200 hover:scale-105"
          style="border-color: color-mix(in srgb, var(--color-primary) 30%, transparent); background: color-mix(in srgb, var(--color-primary) 8%, transparent); color: var(--color-primary);">
      @if (shouldShowIcon()) {
        <img [src]="iconUrl()"
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
  readonly iconFailed = signal(false);
  // Some devicon slugs only ship `-plain.svg` (jest, nextjs) while most
  // ship `-original.svg`. Fall back to the plain variant before giving up.
  readonly variant = signal<IconVariant>('original');

  constructor() {
    // Honor per-slug variant overrides (e.g. jest only ships -plain),
    // so we never issue a doomed -original request that would CORB.
    effect(() => {
      const slug = this.iconSlug();
      const preferred = slug ? VARIANT_OVERRIDES[slug] : undefined;
      if (preferred) {
        this.variant.set(preferred);
      }
    });
  }

  readonly shouldShowIcon = computed(() => {
    const slug = this.iconSlug();
    return !!slug && !this.iconFailed() && !isSlugFailed(slug);
  });

  readonly iconUrl = computed(() => {
    const slug = this.iconSlug();
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${this.variant()}.svg`;
  });

  onIconError(): void {
    if (this.variant() === 'original') {
      this.variant.set('plain');
      return;
    }
    const slug = this.iconSlug();
    if (slug) {
      markSlugFailed(slug);
    }
    this.iconFailed.set(true);
  }
}
