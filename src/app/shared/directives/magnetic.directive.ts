import type {
  OnDestroy} from '@angular/core';
import {
  Directive,
  ElementRef,
  inject,
  afterNextRender,
  PLATFORM_ID,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Magnetic hover effect: element follows the cursor when nearby.
 * SSR-safe: only attaches listeners after first render in browser.
 * Respects (pointer: fine) — no effect on touch devices.
 * Respects (prefers-reduced-motion: reduce) — disabled if user opts out.
 */
@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Strength of the pull (0–1). Default 0.4. */
  readonly strength = input<number>(0.4);

  private moveHandler?: (e: MouseEvent) => void;
  private leaveHandler?: () => void;
  private rafId: number | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const fineCursor = window.matchMedia('(pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!fineCursor || reduced) return;
      this.init();
    });
  }

  private init(): void {
    const element = this.el.nativeElement as HTMLElement;
    element.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    element.style.willChange = 'transform';

    this.moveHandler = (e: MouseEvent) => {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const s = this.strength();
        element.style.transform = `translate(${x * s}px, ${y * s}px)`;
      });
    };

    this.leaveHandler = () => {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      element.style.transform = 'translate(0, 0)';
    };

    element.addEventListener('mousemove', this.moveHandler, { passive: true });
    element.addEventListener('mouseleave', this.leaveHandler);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    const element = this.el.nativeElement as HTMLElement;
    if (this.moveHandler) {
      element.removeEventListener('mousemove', this.moveHandler);
    }
    if (this.leaveHandler) {
      element.removeEventListener('mouseleave', this.leaveHandler);
    }
  }
}
