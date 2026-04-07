import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';
import { SpotifyNowPlayingComponent } from '../spotify-now-playing/spotify-now-playing.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SpotifyNowPlayingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-white/[0.06] py-8">
      <div class="mx-auto max-w-6xl space-y-6 px-6 text-center">
        <app-spotify-now-playing />
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
