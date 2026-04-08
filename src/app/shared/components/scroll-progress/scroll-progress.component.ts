import type {
  OnDestroy} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Top-of-page scroll progress indicator.
 *
 * Progressive enhancement strategy:
 *   - Modern browsers (Chrome 115+, Safari 18+) with native
 *     `animation-timeline: scroll()` render `.scroll-progress-css`
 *     defined in `src/styles/scroll-driven.scss`, which runs on the
 *     compositor without any JS.
 *   - Legacy browsers fall back to this component's JS-driven bar.
 *
 * On browsers that support the CSS feature we skip the scroll listener
 * entirely and hide the JS bar, so the two implementations never double up.
 */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      CSS-driven bar. The @supports rule in scroll-driven.scss hides it in
      browsers without animation-timeline, so the JS fallback below takes over.
    -->
    <div class="scroll-progress-css" aria-hidden="true"></div>

    @if (!cssDriven()) {
      <div
        class="fixed top-0 left-0 h-0.5 z-[9999] transition-[width] duration-75"
        [style.width.%]="progress()"
        style="background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));"
      ></div>
    }
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
  /** True when the browser handles the progress bar via native CSS scroll timelines. */
  readonly cssDriven = signal(false);
  private scrollHandler?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      // Feature detect CSS scroll-driven animations. When supported, the
      // `.scroll-progress-css` rule in scroll-driven.scss owns the bar and
      // we skip the JS path entirely.
      const supportsScrollTimeline =
        typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('animation-timeline', 'scroll()');

      if (supportsScrollTimeline) {
        this.cssDriven.set(true);
        return;
      }

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
