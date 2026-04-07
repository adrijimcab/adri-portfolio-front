import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { ParticlesBackgroundComponent } from '../../../../shared/components/particles-background/particles-background.component';
import { TypingTextComponent } from '../../../../shared/components/typing-text/typing-text.component';
import { AnimatedCounterComponent } from '../../../../shared/components/animated-counter/animated-counter.component';
import { TranslateService } from '../../../../core/services/translate.service';
import { Profile, SiteConfig } from '../../../../core/models';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    ScrollAnimateDirective,
    ParticlesBackgroundComponent,
    TypingTextComponent,
    AnimatedCounterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="hero" class="relative flex min-h-screen items-center justify-center px-6" aria-labelledby="hero-title">
      <app-particles-background aria-hidden="true" />
      <div class="relative z-10 text-center" appScrollAnimate>
        <p class="mb-4 text-xs tracking-[4px] uppercase" style="color: var(--color-secondary);">
          <app-typing-text [texts]="typingTexts()" />
        </p>
        <h1 id="hero-title" class="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
          {{ firstName() }}
          <span class="gradient-text">{{ lastName() }}</span>
        </h1>
        <p class="mx-auto mt-6 max-w-lg text-lg text-white/50">
          {{ config()?.['hero_tagline'] || profile()?.subtitle }}
        </p>

        <!-- Stats -->
        <div
          class="mt-12 flex justify-center gap-12"
          appScrollAnimate
          [stagger]="true"
          role="group"
          aria-label="Career statistics"
        >
          @for (stat of stats(); track stat.label) {
            <div class="text-center" role="status" aria-live="polite">
              <span class="text-3xl font-bold text-white">
                <app-animated-counter [target]="stat.numericValue" [suffix]="stat.suffix" />
              </span>
              <span class="mt-1 block text-xs text-white/40 uppercase tracking-wider">{{ stat.label }}</span>
            </div>
          }
        </div>

        <!-- Scroll indicator -->
        <div class="mt-16 animate-bounce">
          <svg
            class="mx-auto h-6 w-6 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Scroll down"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  readonly t = inject(TranslateService);
  profile = input<Profile | undefined>();
  config = input<SiteConfig | undefined>();

  readonly typingTexts = computed(() => [
    this.t.t('hero.role1'),
    this.t.t('hero.role2'),
    this.t.t('hero.role3'),
    this.t.t('hero.role4'),
  ]);

  firstName = computed(() => this.profile()?.full_name?.split(' ').slice(0, -2).join(' ') || '');
  lastName = computed(() => this.profile()?.full_name?.split(' ').slice(-2).join(' ') || '');

  stats = computed(() => {
    const c = this.config();
    const yearsRaw = c?.['stats_years'] || '9';
    const companiesRaw = c?.['stats_companies'] || '4';
    const techRaw = c?.['stats_technologies'] || '30';

    return [
      {
        numericValue: parseInt(yearsRaw, 10) || 9,
        suffix: '+',
        label: this.t.t('hero.years'),
      },
      {
        numericValue: parseInt(companiesRaw, 10) || 4,
        suffix: '',
        label: this.t.t('hero.companies'),
      },
      {
        numericValue: parseInt(techRaw, 10) || 30,
        suffix: '+',
        label: this.t.t('hero.technologies'),
      },
    ];
  });
}
