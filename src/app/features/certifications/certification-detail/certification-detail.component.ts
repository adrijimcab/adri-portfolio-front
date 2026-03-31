import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '../../../core/services/translate.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { Certification } from '../../../core/models';

@Component({
  selector: 'app-certification-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen pt-24 pb-12 px-6">
      <div class="mx-auto max-w-5xl">
        <a routerLink="/"
           fragment="certifications"
           class="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ t.t('certifications.back') }}
        </a>

        @if (certification()) {
          <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-white">{{ certification()!.name }}</h1>
                <p class="text-sm mt-1" style="color: var(--color-secondary);">{{ certification()!.provider }}</p>
              </div>
              @if (certification()!.is_verified) {
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ t.t('certifications.verified') }}
                </span>
              }
            </div>

            @if (safeUrl()) {
              @if (!iframeError()) {
                <div class="aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/[0.06]">
                  <iframe
                    [src]="safeUrl()!"
                    class="h-full w-full bg-white"
                    (error)="iframeError.set(true)"
                    allowfullscreen>
                  </iframe>
                </div>
              }

              <div class="mt-4">
                <a [href]="certification()!.certificate_url!"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
                  {{ t.t('certifications.open_new_tab') }}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </div>
            }
          </div>
        } @else {
          <div class="flex items-center justify-center py-24">
            <p class="text-white/40">{{ t.t('common.loading') }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class CertificationDetailComponent implements OnInit {
  readonly t = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly portfolio = inject(PortfolioService);

  readonly certification = signal<Certification | null>(null);
  readonly safeUrl = signal<SafeResourceUrl | null>(null);
  readonly iframeError = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.portfolio.getCertificationById(id).subscribe((cert) => {
        this.certification.set(cert);
        if (cert.certificate_url) {
          this.safeUrl.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(cert.certificate_url)
          );
        }
      });
    }
  }
}
