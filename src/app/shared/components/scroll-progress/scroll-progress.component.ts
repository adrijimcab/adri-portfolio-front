import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed top-0 left-0 h-0.5 z-[9999] transition-[width] duration-75"
      [style.width.%]="progress()"
      style="background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));"
    ></div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ScrollProgressComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly progress = signal(0);
  private scrollHandler?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      this.scrollHandler = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        this.progress.set(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
      };

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
}
