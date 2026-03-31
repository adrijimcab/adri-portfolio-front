import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-linkedin-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#0077B5]/30 hover:bg-white/[0.05] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,119,181,0.15)]">
      <div class="flex items-center gap-4">
        <!-- LinkedIn Logo -->
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
             style="background: linear-gradient(135deg, #0077B5, #00A0DC);">
          <svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-bold text-white">{{ name() }}</p>
          <p class="text-xs text-white/50">{{ title() }}</p>
        </div>
      </div>

      <a href="https://www.linkedin.com/in/adrianjimenezcabello"
         target="_blank"
         rel="noopener noreferrer"
         class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:shadow-lg"
         style="background: linear-gradient(135deg, #0077B5, #00A0DC);">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        {{ t.t('contact.connect_linkedin') }}
      </a>
    </div>
  `,
})
export class LinkedinWidgetComponent {
  readonly t = inject(TranslateService);
  name = input<string>('Adrián Jiménez Cabello');
  title = input<string>('Senior Frontend Engineer');
}
