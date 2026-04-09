import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';
import { MagneticDirective } from '../../directives/magnetic.directive';

type Lang = 'es' | 'en';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      appMagnetic
      [strength]="0.18"
      class="flex items-center gap-1 rounded-lg border border-white/10 p-0.5"
    >
      <button
        (click)="changeLang('es')"
        class="rounded-md px-2 py-1 text-xs font-medium transition-all"
        [class]="
          translate.currentLang() === 'es'
            ? 'bg-white/10 text-white'
            : 'text-white/40 hover:text-white/60'
        "
      >
        ES
      </button>
      <button
        (click)="changeLang('en')"
        class="rounded-md px-2 py-1 text-xs font-medium transition-all"
        [class]="
          translate.currentLang() === 'en'
            ? 'bg-white/10 text-white'
            : 'text-white/40 hover:text-white/60'
        "
      >
        EN
      </button>
    </div>
  `,
})
export class LanguageToggleComponent {
  readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  changeLang(lang: Lang): void {
    if (this.translate.currentLang() === lang) return;

    this.translate.setLang(lang);

    // Swap the lang prefix in the current URL: /es/projects -> /en/projects
    const currentUrl = this.router.url;
    const newUrl = currentUrl.replace(/^\/(es|en)/, `/${lang}`);
    void this.router.navigateByUrl(newUrl);
  }
}
