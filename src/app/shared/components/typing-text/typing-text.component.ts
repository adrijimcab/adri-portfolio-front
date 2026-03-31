import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-typing-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="typing-text">{{ displayText() }}</span>
    <span class="typing-cursor" aria-hidden="true">|</span>
  `,
  styles: `
    :host {
      display: inline;
    }

    .typing-cursor {
      animation: blink 1s step-end infinite;
      color: var(--color-secondary, #a78bfa);
      font-weight: 300;
    }

    @keyframes blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
    }
  `,
})
export class TypingTextComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly texts = input<string[]>(['']);
  readonly typingSpeed = input(80);
  readonly deletingSpeed = input(50);
  readonly pauseDuration = input(2000);

  readonly displayText = signal('');

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentIndex = 0;
  private currentChar = 0;
  private isDeleting = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.tick();
    });
  }

  private tick(): void {
    const items = this.texts();
    if (!items.length) return;

    const current = items[this.currentIndex % items.length];

    if (this.isDeleting) {
      this.currentChar--;
      this.displayText.set(current.substring(0, this.currentChar));

      if (this.currentChar === 0) {
        this.isDeleting = false;
        this.currentIndex = (this.currentIndex + 1) % items.length;
        this.timeoutId = setTimeout(() => this.tick(), this.typingSpeed());
        return;
      }

      this.timeoutId = setTimeout(() => this.tick(), this.deletingSpeed());
    } else {
      this.currentChar++;
      this.displayText.set(current.substring(0, this.currentChar));

      if (this.currentChar === current.length) {
        this.isDeleting = true;
        this.timeoutId = setTimeout(() => this.tick(), this.pauseDuration());
        return;
      }

      this.timeoutId = setTimeout(() => this.tick(), this.typingSpeed());
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
  }
}
