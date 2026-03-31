import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-white/[0.06] py-8">
      <div class="mx-auto max-w-6xl px-6 text-center">
        <p class="text-sm text-white/40">
          &copy; {{ currentYear }} Adrian Jimenez Cabello. {{ t.t('footer.built_with') }}
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly t = inject(TranslateService);
  currentYear = new Date().getFullYear();
}
