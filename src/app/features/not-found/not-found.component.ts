import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-screen items-center justify-center px-6">
      <div class="text-center">
        <h1 class="text-8xl font-bold gradient-text">{{ t.t('common.not_found_title') }}</h1>
        <p class="mt-4 text-lg text-white/50">{{ t.t('common.not_found_message') }}</p>
        <a
          [routerLink]="['/', t.currentLang()]"
          class="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-white font-medium transition-all hover:scale-105"
          style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"
        >
          {{ t.t('common.not_found_back') }}
        </a>
      </div>
    </section>
  `,
})
export class NotFoundComponent {
  readonly t = inject(TranslateService);
}
