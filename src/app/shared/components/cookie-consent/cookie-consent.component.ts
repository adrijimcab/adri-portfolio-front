import { Component, ChangeDetectionStrategy, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';

declare const gtag: (...args: unknown[]) => void;

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (visible()) {
      <div class="cookie-banner" role="dialog" aria-label="Consentimiento de cookies">
        <div class="cookie-content">
          <p>
            Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico.
            Consulta nuestra
            <a [routerLink]="['/', t.currentLang(), 'privacy']">Política de Privacidad</a>.
          </p>
          <div class="cookie-actions">
            <button class="cookie-btn cookie-btn--reject" (click)="reject()">
              Solo necesarias
            </button>
            <button class="cookie-btn cookie-btn--accept" (click)="accept()">Aceptar todas</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        padding: 1rem;
        animation: slide-up 0.3s ease-out;
      }

      @keyframes slide-up {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .cookie-content {
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .cookie-content p {
        flex: 1;
        min-width: 250px;
        font-size: 0.88rem;
        color: #cbd5e1;
        line-height: 1.5;
        margin: 0;
      }

      .cookie-content a {
        color: #a5b4fc;
        text-decoration: underline;
      }

      .cookie-actions {
        display: flex;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .cookie-btn {
        padding: 0.6rem 1.25rem;
        border-radius: 0.75rem;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.15s ease;
      }

      .cookie-btn--reject {
        background: transparent;
        color: #94a3b8;
        border: 1px solid #475569;
      }

      .cookie-btn--reject:hover {
        background: #1e293b;
        color: #e2e8f0;
      }

      .cookie-btn--accept {
        background: #6366f1;
        color: white;
      }

      .cookie-btn--accept:hover {
        background: #4f46e5;
      }

      @media (max-width: 640px) {
        .cookie-content {
          flex-direction: column;
          text-align: center;
        }

        .cookie-actions {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentComponent {
  readonly t = inject(TranslateService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  visible = signal(this.isBrowser && !this.hasConsent());

  constructor() {
    if (this.isBrowser && this.hasConsent()) {
      this.updateGtagConsent(this.getConsentLevel());
    }
  }

  accept(): void {
    this.saveConsent('all');
    this.updateGtagConsent('all');
  }

  reject(): void {
    this.saveConsent('necessary');
    this.updateGtagConsent('necessary');
  }

  private hasConsent(): boolean {
    try {
      return localStorage.getItem('cookie_consent') !== null;
    } catch {
      return false;
    }
  }

  private getConsentLevel(): string {
    try {
      return localStorage.getItem('cookie_consent') ?? 'necessary';
    } catch {
      return 'necessary';
    }
  }

  private saveConsent(level: string): void {
    try {
      localStorage.setItem('cookie_consent', level);
    } catch {
      /* localStorage unavailable */
    }
    this.visible.set(false);
  }

  private updateGtagConsent(level: string): void {
    if (typeof gtag === 'undefined') return;
    const granted = level === 'all' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: granted,
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
    });
  }
}
