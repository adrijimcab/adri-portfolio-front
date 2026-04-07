import {
  Directive,
  inject,
  afterNextRender,
  PLATFORM_ID,
  OnDestroy,
  output,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/**
 * Listens globally for the Konami code (↑↑↓↓←→←→ B A).
 * Emits konami when triggered. SSR-safe.
 */
@Directive({
  selector: '[appKonami]',
  standalone: true,
})
export class KonamiDirective implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly konami = output<void>();

  private buffer: string[] = [];
  private handler?: (e: KeyboardEvent) => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.handler = (e: KeyboardEvent) => {
        this.buffer.push(e.key);
        if (this.buffer.length > SEQUENCE.length) {
          this.buffer.shift();
        }
        if (this.buffer.length === SEQUENCE.length &&
            this.buffer.every((k, i) => k === SEQUENCE[i])) {
          this.buffer = [];
          this.konami.emit();
        }
      };
      window.addEventListener('keydown', this.handler);
    });
  }

  ngOnDestroy(): void {
    if (this.handler) {
      window.removeEventListener('keydown', this.handler);
    }
  }
}
