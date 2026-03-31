import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
      <button
        (click)="translate.setLang('es')"
        class="rounded-md px-2 py-1 text-xs font-medium transition-all"
        [class]="translate.currentLang() === 'es'
          ? 'bg-white/10 text-white'
          : 'text-white/40 hover:text-white/60'">
        ES
      </button>
      <button
        (click)="translate.setLang('en')"
        class="rounded-md px-2 py-1 text-xs font-medium transition-all"
        [class]="translate.currentLang() === 'en'
          ? 'bg-white/10 text-white'
          : 'text-white/40 hover:text-white/60'">
        EN
      </button>
    </div>
  `,
})
export class LanguageToggleComponent {
  readonly translate = inject(TranslateService);
}
