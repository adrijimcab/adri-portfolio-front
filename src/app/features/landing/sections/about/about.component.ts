import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import type { Profile } from '../../../../core/models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about" class="py-24 px-6">
      <div class="mx-auto max-w-4xl">
        <app-section-header [title]="t.t('about.title')" [label]="t.t('about.label')" />
        <app-glass-card>
          <div appScrollAnimate>
            @if (profile()?.bio) {
              @for (paragraph of paragraphs(); track $index) {
                <p class="text-white/70 leading-relaxed mb-4 last:mb-0">{{ paragraph }}</p>
              }
            }
            <div class="mt-6 flex flex-wrap gap-4">
              @if (profile()?.location) {
                <span class="text-sm text-white/65">{{ profile()?.location }}</span>
              }
              @if (profile()?.email) {
                <span class="text-sm text-white/65">{{ profile()?.email }}</span>
              }
            </div>
          </div>
        </app-glass-card>
      </div>
    </section>
  `,
})
export class AboutComponent {
  readonly t = inject(TranslateService);
  profile = input<Profile | undefined>();

  paragraphs = computed(() => this.profile()?.bio?.split('\n\n') || []);
}
