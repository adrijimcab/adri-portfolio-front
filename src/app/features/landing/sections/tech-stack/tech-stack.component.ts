import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { TechnologyGroup } from '../../../../core/models';

@Component({
  selector: 'app-tech-stack',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="tech-stack" class="py-24 px-6">
      <div class="mx-auto max-w-6xl">
        <app-section-header [title]="t.t('tech_stack.title')" [label]="t.t('tech_stack.label')" />

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (group of groups(); track group.category; let i = $index) {
            <div appScrollAnimate [delay]="i * 80">
              <app-glass-card>
                <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider" style="color: var(--color-secondary);">
                  {{ group.category }}
                </h3>
                <div class="space-y-3">
                  @for (tech of group.technologies; track tech.id) {
                    <div class="group flex items-center gap-3">
                      <img [src]="'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + tech.icon_slug + '/' + tech.icon_slug + '-original.svg'"
                           [alt]="tech.name"
                           class="h-6 w-6 transition-transform group-hover:scale-125"
                           loading="lazy"
                           (error)="onImgError($event)" />
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-white/80">{{ tech.name }}</span>
                          @if (tech.proficiency_level) {
                            <span class="text-xs text-white/30">{{ tech.proficiency_level }}%</span>
                          }
                        </div>
                        @if (tech.proficiency_level) {
                          <div class="mt-1 h-1 w-full rounded-full bg-white/[0.06]">
                            <div class="h-full rounded-full transition-all duration-700"
                                 [style.width.%]="tech.proficiency_level"
                                 style="background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));"></div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </app-glass-card>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class TechStackComponent {
  readonly t = inject(TranslateService);
  groups = input<TechnologyGroup[]>([]);

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
