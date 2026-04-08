import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../../shared/components/tech-pill/tech-pill.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { Experience } from '../../../../core/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, TechPillComponent, ScrollAnimateDirective, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="experience" class="py-24 px-6">
      <div class="mx-auto max-w-4xl">
        <app-section-header [title]="t.t('experience.title')" [label]="t.t('experience.label')" />

        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-4 top-0 bottom-0 w-px md:left-1/2"
               style="background: linear-gradient(180deg, var(--color-primary), var(--color-secondary), var(--color-accent));"></div>

          @for (exp of experiences(); track exp.id; let i = $index) {
            <div class="relative mb-8 pl-12 md:pl-0" [class]="i % 2 === 0 ? 'md:pr-[52%]' : 'md:pl-[52%]'" appScrollAnimate [delay]="i * 100">
              <!-- Dot -->
              <div class="absolute left-[11px] top-6 h-3 w-3 rounded-full border-2 md:left-[calc(50%-6px)]"
                   style="border-color: var(--color-secondary); background: var(--color-bg);"></div>

              <app-glass-card>
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ exp.role }}</h3>
                    <p style="color: var(--color-secondary);" class="text-sm font-medium">
                      {{ exp.company }}@if (exp.client) { &middot; {{ exp.client }}}
                    </p>
                  </div>
                  <span class="shrink-0 text-xs text-white/65">
                    {{ exp.start_date | date:'MMM yyyy' }} — {{ exp.end_date ? (exp.end_date | date:'MMM yyyy') : t.t('experience.present') }}
                  </span>
                </div>

                @if (exp.description) {
                  <p class="text-sm text-white/60 mb-3">{{ exp.description }}</p>
                }

                @if (exp.achievements.length) {
                  <ul class="mb-4 space-y-1">
                    @for (achievement of exp.achievements; track $index) {
                      <li class="text-xs text-white/50">{{ achievement }}</li>
                    }
                  </ul>
                }

                @if (exp.technologies.length) {
                  <div class="flex flex-wrap gap-1.5">
                    @for (tech of exp.technologies; track tech.id) {
                      <app-tech-pill [name]="tech.name" [iconSlug]="tech.icon_slug" />
                    }
                  </div>
                }
              </app-glass-card>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  readonly t = inject(TranslateService);
  experiences = input<Experience[]>([]);
}
