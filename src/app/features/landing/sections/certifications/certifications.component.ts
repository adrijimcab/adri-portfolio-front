import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { TranslateService } from '../../../../core/services/translate.service';
import type { Certification } from '../../../../core/models';

@Component({
  selector: 'app-certifications-section',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    SectionHeaderComponent,
    GlassmorphismCardComponent,
    ScrollAnimateDirective,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="certifications" class="py-24 px-6">
      <div class="mx-auto max-w-4xl">
        <app-section-header
          [title]="t.t('certifications.title')"
          [label]="t.t('certifications.label')"
        />

        @if (!certifications()) {
          <div class="grid gap-4 sm:grid-cols-2">
            @for (i of [1, 2, 3, 4]; track i) {
              <app-skeleton-loader height="120px" />
            }
          </div>
        } @else {
          <div class="certifications-grid">
            @for (cert of certifications(); track cert.id; let i = $index) {
              <div class="cert-cell" appScrollAnimate [delay]="i * 80">
                <app-glass-card>
                  <div class="flex h-full flex-col">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1">
                        <h3 class="text-sm font-bold text-white">{{ cert.name }}</h3>
                        <p class="mt-1 text-xs" style="color: var(--color-secondary);">
                          {{ cert.provider }}
                        </p>
                        <div class="mt-2 space-y-1">
                          @if (cert.date) {
                            <p class="text-[10px] text-white/60">
                              {{ cert.date | date: 'MMM yyyy' }}
                            </p>
                          }
                          @if (cert.credential_id) {
                            <p class="text-[10px] text-white/20">
                              {{ t.t('certifications.credential_id') }}: {{ cert.credential_id }}
                            </p>
                          }
                        </div>
                      </div>
                      @if (cert.is_verified) {
                        <span
                          class="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400"
                        >
                          <svg
                            class="h-2.5 w-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {{ t.t('certifications.verified') }}
                        </span>
                      }
                    </div>
                    @if (cert.certificate_url) {
                      <div class="mt-auto pt-4">
                        <a
                          [routerLink]="['/', t.currentLang(), 'certifications', cert.id]"
                          class="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-white"
                          style="color: var(--color-secondary);"
                        >
                          {{ t.t('certifications.view_certificate') }}
                          <svg
                            class="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
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
  styles: [
    `
      .certifications-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr;
      }

      @media (min-width: 640px) {
        .certifications-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .cert-cell {
        display: block;
        height: 100%;
      }

      .cert-cell :host ::ng-deep app-glass-card,
      .cert-cell app-glass-card {
        height: 100%;
      }
    `,
  ],
})
export class CertificationsSectionComponent {
  readonly t = inject(TranslateService);
  certifications = input<Certification[] | undefined>();
}
