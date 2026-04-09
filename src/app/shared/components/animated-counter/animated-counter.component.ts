import type {
  OnDestroy} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  afterNextRender,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-animated-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ displayValue() }}{{ hasAnimated() ? suffix() : '' }}`,
})
export class AnimatedCounterComponent implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly target = input.required<number>();
  readonly duration = input(2000);
  readonly suffix = input('+');

  readonly displayValue = signal(0);
  readonly hasAnimated = signal(false);

  private observer?: IntersectionObserver;
  private animationId = 0;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.observe();
    });
  }

  private observe(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.hasAnimated()) {
          this.startAnimation();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private startAnimation(): void {
    const targetVal = this.target();
    const dur = this.duration();
    const start = performance.now();

    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

    const step = (now: number): void => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased = easeOutQuart(progress);

      this.displayValue.set(Math.round(eased * targetVal));

      if (progress < 1) {
        this.animationId = requestAnimationFrame(step);
      } else {
        this.displayValue.set(targetVal);
        this.hasAnimated.set(true);
      }
    };

    this.animationId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.observer?.disconnect();
  }
}
