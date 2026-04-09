import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { TranslateService } from '../../../core/services/translate.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import type { Certification } from '../../../core/models';

/** image.thum.io public screenshot service. Free tier, no key required. */
function thumbnailFor(url: string, width = 1200): string {
  return `https://image.thum.io/get/width/${width}/noanimate/${url}`;
}

@Component({
  selector: 'app-certification-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen pt-24 pb-12 px-6">
      <div class="mx-auto max-w-5xl">
        <a
          [routerLink]="['/', t.currentLang()]"
          fragment="certifications"
          class="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ t.t('certifications.back') }}
        </a>

        @if (certification(); as cert) {
          <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl font-bold text-white">{{ cert.name }}</h1>
                <p class="text-sm mt-1" style="color: var(--color-secondary);">
                  {{ cert.provider }}
                </p>
                @if (cert.credential_id) {
                  <p class="text-xs mt-2 text-white/60 font-mono">ID: {{ cert.credential_id }}</p>
                }
              </div>
              @if (cert.is_verified) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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

            @if (cert.description) {
              <p class="mb-6 text-sm text-white/70 leading-relaxed">{{ cert.description }}</p>
            }

            @if (thumbnailUrl()) {
              <!--
                External screenshot service (image.thum.io) without resize API: raw <img>
                instead of NgOptimizedImage. This is the above-the-fold LCP image of the
                detail view, so we intentionally skip loading=lazy and use
                fetchpriority=high + decoding=async to prioritize it.
              -->
              <div
                class="aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] relative"
              >
                <img
                  [src]="thumbnailUrl()!"
                  [alt]="cert.name + ' certificate preview'"
                  class="h-full w-full object-contain"
                  decoding="async"
                  fetchpriority="high"
                  (error)="thumbnailError.set(true)"
                />
                @if (thumbnailError()) {
                  <div class="absolute inset-0 flex items-center justify-center bg-white/[0.03]">
                    <p class="text-white/60 text-sm">
                      {{ t.t('certifications.preview_unavailable') }}
                    </p>
                  </div>
                }
              </div>
            }

            @if (cert.certificate_url) {
              <div class="mt-6 flex flex-wrap gap-3">
                <a
                  [href]="cert.certificate_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition-all hover:border-white/20 hover:text-white hover:bg-white/[0.06]"
                >
                  {{ t.t('certifications.open_new_tab') }}
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
        } @else {
          <div class="flex items-center justify-center py-24">
            <p class="text-white/60">{{ t.t('common.loading') }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class CertificationDetailComponent {
  readonly t = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly portfolio = inject(PortfolioService);

  /**
   * Reactive certification stream:
   *  - Subscribes to paramMap so navigation between :id values rehydrates the view
   *  - toSignal integrates the observable directly with OnPush change detection
   *  - catchError yields null so the @if block falls back to the loading state
   */
  readonly certification = toSignal<Certification | null>(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) return of(null);
        return this.portfolio.getCertificationById(id).pipe(catchError(() => of(null)));
      }),
    ),
    { initialValue: null },
  );

  readonly thumbnailError = signal(false);

  readonly thumbnailUrl = computed(() => {
    const cert = this.certification();
    if (!cert?.certificate_url) return null;
    return thumbnailFor(cert.certificate_url, 1200);
  });
}
