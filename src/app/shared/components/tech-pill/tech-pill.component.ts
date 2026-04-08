import { Component, ChangeDetectionStrategy, computed, input, signal } from '@angular/core';
import { isSlugFailed, markSlugFailed } from './devicon-availability';

@Component({
  selector: 'app-tech-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all duration-200 hover:scale-105"
          style="border-color: color-mix(in srgb, var(--color-primary) 30%, transparent); background: color-mix(in srgb, var(--color-primary) 8%, transparent); color: var(--color-primary);">
      @if (shouldShowIcon()) {
        <img [src]="'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + iconSlug() + '/' + iconSlug() + '-original.svg'"
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

  readonly shouldShowIcon = computed(() => {
    const slug = this.iconSlug();
    return !!slug && !this.iconFailed() && !isSlugFailed(slug);
  });

  onIconError(): void {
    const slug = this.iconSlug();
    if (slug) {
      markSlugFailed(slug);
    }
    this.iconFailed.set(true);
  }
}
