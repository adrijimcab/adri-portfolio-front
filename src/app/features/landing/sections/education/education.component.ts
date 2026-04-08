import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { Education, Course } from '../../../../core/models';

@Component({
  selector: 'app-education-section',
  standalone: true,
  imports: [DatePipe, SectionHeaderComponent, GlassmorphismCardComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="education" class="py-24 px-6">
      <div class="mx-auto max-w-4xl">
        <app-section-header [title]="t.t('education.title')" [label]="t.t('education.label')" />

        <!-- Education -->
        <div class="mb-12 space-y-4">
          @for (edu of education(); track edu.id; let i = $index) {
            <div appScrollAnimate [delay]="i * 80">
              <app-glass-card>
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-bold text-white">{{ edu.degree }}</h3>
                    <p class="text-sm" style="color: var(--color-secondary);">{{ edu.institution }}</p>
                    @if (edu.description) {
                      <p class="mt-1 text-xs text-white/65">{{ edu.description }}</p>
                    }
                  </div>
                  <span class="text-xs text-white/60">
                    {{ edu.year_start }}{{ edu.year_end ? ' - ' + edu.year_end : '' }}
                  </span>
                </div>
              </app-glass-card>
            </div>
          }
        </div>

        <!-- Courses -->
        @if (courses().length) {
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/65">{{ t.t('education.certifications_label') }}</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            @for (course of courses(); track course.id; let i = $index) {
              <div appScrollAnimate [delay]="i * 60">
                <app-glass-card>
                  <h4 class="text-sm font-medium text-white">{{ course.name }}</h4>
                  <div class="mt-1 flex items-center gap-2">
                    @if (course.provider) {
                      <span class="text-xs" style="color: var(--color-secondary);">{{ course.provider }}</span>
                    }
                    @if (course.date) {
                      <span class="text-xs text-white/60">{{ course.date | date:'MMM yyyy' }}</span>
                    }
                  </div>
                </app-glass-card>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class EducationSectionComponent {
  readonly t = inject(TranslateService);
  education = input<Education[]>([]);
  courses = input<Course[]>([]);
}
