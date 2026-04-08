import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <svg class="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white">{{ t.t('common.error_title') }}</h3>
      <p class="mt-2 text-sm text-white/50">{{ t.t('common.error_message') }}</p>
      <button
        (click)="retry.emit()"
        class="mt-6 rounded-lg px-6 py-2 text-sm font-medium text-white transition-all hover:scale-105"
        style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
        {{ t.t('common.retry') }}
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly t = inject(TranslateService);
  retry = output();
}
