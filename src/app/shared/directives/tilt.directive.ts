import type {
  OnDestroy} from '@angular/core';
import {
  Directive,
  ElementRef,
  inject,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseLeaveHandler?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.init();
    });
  }

  private init(): void {
    const element = this.el.nativeElement as HTMLElement;
    element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    element.style.willChange = 'transform';

    this.mouseMoveHandler = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      const maxRotation = 8;
      const rotateX = -percentY * maxRotation;
      const rotateY = percentX * maxRotation;

      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      const shadowX = percentX * 10;
      const shadowY = percentY * 10;
      element.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.15)`;
    };

    this.mouseLeaveHandler = () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      element.style.boxShadow = 'none';
    };

    element.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    element.addEventListener('mouseleave', this.mouseLeaveHandler);
  }

  ngOnDestroy(): void {
    const element = this.el.nativeElement as HTMLElement;
    if (this.mouseMoveHandler) {
      element.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseLeaveHandler) {
      element.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }
}
