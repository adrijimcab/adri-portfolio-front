import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SpotifyNowPlayingComponent } from '../spotify-now-playing/spotify-now-playing.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SpotifyNowPlayingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-white/[0.06] py-12">
      <div class="mx-auto max-w-6xl px-6 text-center">
        <div class="flex justify-center pl-4 sm:pl-8">
          <app-spotify-now-playing />
        </div>
        <p class="mt-12 text-sm text-white/50">
          &copy; {{ currentYear }} Adrián Jiménez Cabello
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
