import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { Profile, SiteConfig } from '../../../../core/models';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="hero" class="relative flex min-h-screen items-center justify-center px-6">
      <div class="text-center" appScrollAnimate>
        <p class="mb-4 text-xs tracking-[4px] uppercase" style="color: var(--color-secondary);">
          {{ config()?.['hero_subtitle'] || profile()?.title }}
        </p>
        <h1 class="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
          {{ firstName() }}
          <span class="gradient-text">{{ lastName() }}</span>
        </h1>
        <p class="mx-auto mt-6 max-w-lg text-lg text-white/50">
          {{ config()?.['hero_tagline'] || profile()?.subtitle }}
        </p>

        <!-- Stats -->
        <div class="mt-12 flex justify-center gap-12">
          @for (stat of stats(); track stat.label) {
            <div class="text-center" appScrollAnimate [delay]="$index * 100 + 200">
              <span class="text-3xl font-bold text-white">{{ stat.value }}</span>
              <span class="mt-1 block text-xs text-white/40 uppercase tracking-wider">{{ stat.label }}</span>
            </div>
          }
        </div>

        <!-- Scroll indicator -->
        <div class="mt-16 animate-bounce">
          <svg class="mx-auto h-6 w-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  profile = input<Profile | undefined>();
  config = input<SiteConfig | undefined>();

  firstName = computed(() => this.profile()?.full_name?.split(' ').slice(0, -2).join(' ') || '');
  lastName = computed(() => this.profile()?.full_name?.split(' ').slice(-2).join(' ') || '');

  stats = computed(() => {
    const c = this.config();
    return [
      { value: (c?.['stats_years'] || '9') + '+', label: 'Years' },
      { value: c?.['stats_companies'] || '4', label: 'Companies' },
      { value: (c?.['stats_technologies'] || '30') + '+', label: 'Technologies' },
    ];
  });
}
