import type { OnInit, OnDestroy} from '@angular/core';
import { Directive, ElementRef, inject, PLATFORM_ID, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  delay = input<number>(0);
  stagger = input<boolean>(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.el.nativeElement as HTMLElement;

    if (this.stagger()) {
      this.initStagger(element);
    } else {
      this.initSingle(element);
    }
  }

  private initSingle(element: HTMLElement): void {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `opacity 0.6s ease ${this.delay()}ms, transform 0.6s ease ${this.delay()}ms`;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          this.observer?.unobserve(element);
        }
      },
      { threshold: 0.1 },
    );

    this.observer.observe(element);
  }

  private initStagger(element: HTMLElement): void {
    const children = Array.from(element.children) as HTMLElement[];
    const staggerDelay = 100;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
      child.style.transition = `opacity 0.6s ease ${this.delay() + i * staggerDelay}ms, transform 0.6s ease ${this.delay() + i * staggerDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (const child of children) {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }
          this.observer?.unobserve(element);
        }
      },
      { threshold: 0.1 },
    );

    this.observer.observe(element);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
