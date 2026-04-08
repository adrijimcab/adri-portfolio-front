import type {
  OnDestroy} from '@angular/core';
import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BlogService } from '../../features/blog/blog.service';

/**
 * Shows a floating preview card with the blog post title + description
 * when the host element is hovered with a fine pointer.
 *
 * - SSR-safe: all DOM access guarded by `isPlatformBrowser` and `afterNextRender`.
 * - Touch devices: no-op (only `(pointer: fine)` activates it).
 * - Reduced motion: the card appears/disappears without fade animation.
 */
@Directive({
  selector: '[appHoverPreview]',
  standalone: true,
})
export class HoverPreviewDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly blog = inject(BlogService);

  readonly previewSlug = input.required<string>({ alias: 'appHoverPreview' });

  private enterHandler?: () => void;
  private leaveHandler?: () => void;
  private card: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private reducedMotion = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const fineCursor = window.matchMedia('(pointer: fine)').matches;
      if (!fineCursor) return;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.init();
    });
  }

  private init(): void {
    const element = this.el.nativeElement as HTMLElement;

    this.enterHandler = () => {
      this.clearShowTimer();
      this.showTimer = setTimeout(() => this.showCard(), 300);
    };

    this.leaveHandler = () => {
      this.clearShowTimer();
      this.hideCard();
    };

    element.addEventListener('mouseenter', this.enterHandler);
    element.addEventListener('mouseleave', this.leaveHandler);
  }

  private showCard(): void {
    const slug = this.previewSlug();
    const post = this.blog.getPostBySlug(slug);
    if (!post) return;

    if (this.card) {
      this.hideCard();
    }

    const card = document.createElement('div');
    card.setAttribute('role', 'tooltip');
    card.setAttribute('aria-hidden', 'true');
    card.style.position = 'fixed';
    card.style.zIndex = '1100';
    card.style.maxWidth = '320px';
    card.style.padding = '14px 16px';
    card.style.borderRadius = '14px';
    card.style.border = '1px solid rgba(255, 255, 255, 0.12)';
    card.style.background = 'rgba(12, 12, 16, 0.82)';
    card.style.backdropFilter = 'blur(16px) saturate(140%)';
    (card.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter =
      'blur(16px) saturate(140%)';
    card.style.boxShadow = '0 18px 48px rgba(0, 0, 0, 0.45)';
    card.style.color = 'rgba(255, 255, 255, 0.9)';
    card.style.fontSize = '13px';
    card.style.lineHeight = '1.5';
    card.style.pointerEvents = 'none';

    if (this.reducedMotion) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(6px)';
      card.style.transition = 'opacity 180ms ease, transform 180ms ease';
    }

    const title = document.createElement('div');
    title.textContent = post.title;
    title.style.color = '#fff';
    title.style.fontWeight = '600';
    title.style.fontSize = '14px';
    title.style.marginBottom = '4px';

    const desc = document.createElement('div');
    desc.textContent = post.description;
    desc.style.color = 'rgba(255, 255, 255, 0.65)';

    card.appendChild(title);
    card.appendChild(desc);
    document.body.appendChild(card);

    this.positionCard(card);
    this.card = card;

    if (!this.reducedMotion) {
      requestAnimationFrame(() => {
        if (!this.card) return;
        this.card.style.opacity = '1';
        this.card.style.transform = 'translateY(0)';
      });
    }
  }

  private positionCard(card: HTMLElement): void {
    const hostRect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    // Temporarily measure
    card.style.left = '0px';
    card.style.top = '0px';
    const cardRect = card.getBoundingClientRect();

    const margin = 12;
    let left = hostRect.left;
    let top = hostRect.bottom + 10;

    if (left + cardRect.width + margin > window.innerWidth) {
      left = window.innerWidth - cardRect.width - margin;
    }
    if (left < margin) left = margin;

    if (top + cardRect.height + margin > window.innerHeight) {
      top = hostRect.top - cardRect.height - 10;
    }
    if (top < margin) top = margin;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  private hideCard(): void {
    const card = this.card;
    if (!card) return;
    this.card = null;

    if (this.reducedMotion) {
      card.remove();
      return;
    }

    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    setTimeout(() => {
      card.remove();
    }, 200);
  }

  private clearShowTimer(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearShowTimer();
    const element = this.el.nativeElement as HTMLElement;
    if (this.enterHandler) {
      element.removeEventListener('mouseenter', this.enterHandler);
    }
    if (this.leaveHandler) {
      element.removeEventListener('mouseleave', this.leaveHandler);
    }
    if (this.card) {
      this.card.remove();
      this.card = null;
    }
  }
}
