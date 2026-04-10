import type { OnDestroy } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  afterNextRender,
  type ElementRef,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Subscription } from 'rxjs';
import { ChatWidgetService } from './chat-widget.service';
import { TranslateService } from '../../../core/services/translate.service';
import type { ChatMessage, ChatSource } from './chat-widget.types';

const STORAGE_KEY = 'adriportolio_chat_history';
const MAX_MESSAGES = 20;

const SUGGESTED_QUESTIONS_ES = [
  '\u00bfQu\u00e9 experiencia tiene con Angular?',
  '\u00bfHa trabajado con arquitectura limpia?',
  '\u00bfQu\u00e9 stack prefiere?',
  '\u00bfCu\u00e1les son sus certificaciones?',
];

const SUGGESTED_QUESTIONS_EN = [
  'What experience does he have with Angular?',
  'Has he worked with clean architecture?',
  'What stack does he prefer?',
  'What are his certifications?',
];

/**
 * Floating chat widget with side-sheet panel.
 * Streams responses token-by-token from the chatbot RAG backend.
 * SSR-safe: renders nothing on the server.
 */
@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (isBrowser) {
      <!-- Floating trigger button -->
      @if (!isOpen()) {
        <button type="button" class="chat-fab" aria-label="Abrir chat" (click)="open()">
          <span class="text-xl">&#10024;</span>
        </button>
      }

      <!-- Side-sheet panel -->
      @if (isOpen()) {
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div class="chat-backdrop" (click)="close()"></div>
        <aside
          class="chat-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Chat con Adrián"
          (keydown.escape)="close()"
        >
          <!-- Header -->
          <header class="chat-header">
            <h2 class="text-sm font-semibold text-white/90">Pregúntale a Adrián</h2>
            <div class="flex items-center gap-2">
              @if (messages().length > 0) {
                <button
                  type="button"
                  class="chat-clear-btn"
                  aria-label="Limpiar historial"
                  (click)="clearHistory()"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              }
              <button
                type="button"
                class="chat-close-btn"
                aria-label="Cerrar chat"
                (click)="close()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <!-- Messages area -->
          <div class="chat-messages" #messagesContainer>
            @if (messages().length === 0 && !isStreaming()) {
              <div class="chat-suggestions">
                <p class="text-xs text-white/40 mb-3">Preguntas sugeridas:</p>
                @for (q of suggestedQuestions(); track q) {
                  <button type="button" class="chat-suggestion-btn" (click)="sendMessage(q)">
                    {{ q }}
                  </button>
                }
              </div>
            }

            @for (msg of messages(); track msg.timestamp) {
              <div
                class="chat-msg"
                [class.chat-msg-user]="msg.role === 'user'"
                [class.chat-msg-assistant]="msg.role === 'assistant'"
              >
                <div
                  class="chat-bubble"
                  [class.chat-bubble-user]="msg.role === 'user'"
                  [class.chat-bubble-assistant]="msg.role === 'assistant'"
                >
                  {{ msg.content }}
                  @if (
                    msg.role === 'assistant' && isStreaming() && msg === lastAssistantMessage()
                  ) {
                    <span class="chat-cursor" aria-hidden="true">|</span>
                  }
                </div>
                @if (msg.sources && msg.sources.length > 0) {
                  <div class="chat-sources">
                    @for (src of msg.sources; track src.id) {
                      <a
                        class="chat-source-badge"
                        [routerLink]="getSourceRoute(src)"
                        (click)="close()"
                      >
                        {{ src.table }}
                      </a>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Disclaimer -->
          <p class="chat-disclaimer">Respuesta generada por IA basada en info del portfolio</p>

          <!-- Input -->
          <form class="chat-input-form" (submit)="onSubmit($event)">
            <input
              #chatInput
              type="text"
              class="chat-input"
              placeholder="Escribe tu pregunta..."
              [value]="inputText()"
              (input)="onInput($event)"
              [disabled]="isStreaming()"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              type="submit"
              class="chat-send-btn"
              [disabled]="isStreaming() || !inputText().trim()"
              aria-label="Enviar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </aside>
      }
    }
  `,
  styles: [
    `
      .chat-fab {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 50;
        display: flex;
        height: 3.5rem;
        width: 3.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background: linear-gradient(135deg, #7c3aed, #10b981);
        border: none;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.35);
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }
      .chat-fab:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 40px rgba(124, 58, 237, 0.5);
      }

      .chat-backdrop {
        position: fixed;
        inset: 0;
        z-index: 998;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }

      .chat-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        background: rgba(12, 12, 16, 0.96);
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
        animation: chat-slide-in 0.25s ease-out;
      }
      @keyframes chat-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .chat-panel {
          animation: none;
        }
        .chat-fab {
          transition: none;
        }
      }

      .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .chat-close-btn,
      .chat-clear-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.375rem;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition:
          color 0.15s,
          background 0.15s;
      }
      .chat-close-btn:hover,
      .chat-clear-btn:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .chat-suggestions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem 0;
      }

      .chat-suggestion-btn {
        text-align: left;
        padding: 0.6rem 0.85rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.5rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        cursor: pointer;
        transition:
          background 0.15s,
          border-color 0.15s;
      }
      .chat-suggestion-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(124, 58, 237, 0.4);
      }

      .chat-msg {
        display: flex;
        flex-direction: column;
      }
      .chat-msg-user {
        align-items: flex-end;
      }
      .chat-msg-assistant {
        align-items: flex-start;
      }

      .chat-bubble {
        max-width: 85%;
        padding: 0.6rem 0.85rem;
        border-radius: 0.65rem;
        font-size: 0.85rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .chat-bubble-user {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(16, 185, 129, 0.25));
        color: rgba(255, 255, 255, 0.95);
        border-bottom-right-radius: 0.2rem;
      }
      .chat-bubble-assistant {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.85);
        border-bottom-left-radius: 0.2rem;
      }

      .chat-cursor {
        display: inline-block;
        animation: chat-blink 0.8s step-end infinite;
        color: rgba(124, 58, 237, 0.8);
        font-weight: bold;
      }
      @keyframes chat-blink {
        50% {
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .chat-cursor {
          animation: none;
        }
      }

      .chat-sources {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.35rem;
      }

      .chat-source-badge {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        background: rgba(124, 58, 237, 0.15);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 9999px;
        color: rgba(180, 140, 240, 0.9);
        font-size: 0.65rem;
        text-decoration: none;
        cursor: pointer;
        transition: background 0.15s;
      }
      .chat-source-badge:hover {
        background: rgba(124, 58, 237, 0.3);
      }

      .chat-disclaimer {
        padding: 0.35rem 1rem;
        font-size: 0.6rem;
        color: rgba(255, 255, 255, 0.3);
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .chat-input-form {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .chat-input {
        flex: 1;
        padding: 0.6rem 0.85rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        color: #fff;
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.15s;
      }
      .chat-input::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }
      .chat-input:focus {
        border-color: rgba(124, 58, 237, 0.5);
      }
      .chat-input:disabled {
        opacity: 0.5;
      }

      .chat-send-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        border: none;
        background: linear-gradient(135deg, #7c3aed, #10b981);
        color: #fff;
        cursor: pointer;
        transition: opacity 0.15s;
      }
      .chat-send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .chat-panel {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class ChatWidgetComponent implements OnDestroy {
  private readonly chatService = inject(ChatWidgetService);
  private readonly translateService = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isStreaming = signal(false);
  readonly inputText = signal('');

  private streamSub: Subscription | null = null;

  private readonly messagesContainer = viewChild<ElementRef<HTMLElement>>('messagesContainer');

  readonly suggestedQuestions = computed(() => {
    const lang = this.translateService.currentLang();
    return lang === 'es' ? SUGGESTED_QUESTIONS_ES : SUGGESTED_QUESTIONS_EN;
  });

  readonly lastAssistantMessage = computed(() => {
    const msgs = this.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') return msgs[i];
    }
    return null;
  });

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;
      this.loadHistory();
    });
  }

  open(): void {
    this.isOpen.set(true);
    this.scrollToBottom();
  }

  close(): void {
    this.streamSub?.unsubscribe();
    this.isOpen.set(false);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputText.set(value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const text = this.inputText().trim();
    if (!text || this.isStreaming()) return;
    this.sendMessage(text);
  }

  sendMessage(text: string): void {
    if (this.isStreaming()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
    };

    this.messages.update((msgs) => [...msgs, userMsg, assistantMsg]);
    this.inputText.set('');
    this.isStreaming.set(true);
    this.scrollToBottom();

    const lang = this.translateService.currentLang();

    this.streamSub = this.chatService.askQuestion(text, lang).subscribe({
      next: (event) => {
        if (event.type === 'chunk' && event.content) {
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + event.content,
              };
            }
            return updated;
          });
          this.scrollToBottom();
        } else if (event.type === 'done') {
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant' && event.sources) {
              updated[updated.length - 1] = {
                ...last,
                sources: event.sources,
              };
            }
            return updated;
          });
          this.isStreaming.set(false);
          this.saveHistory();
          this.scrollToBottom();
        } else if (event.type === 'error') {
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: event.error ?? 'Error inesperado',
              };
            }
            return updated;
          });
          this.isStreaming.set(false);
          this.saveHistory();
        }
      },
      complete: () => {
        this.isStreaming.set(false);
        this.saveHistory();
      },
    });
  }

  clearHistory(): void {
    this.messages.set([]);
    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage not available
      }
    }
  }

  getSourceRoute(source: ChatSource): string {
    const lang = this.translateService.currentLang();
    switch (source.table) {
      case 'projects':
        return `/${lang}/projects/${source.id}`;
      case 'certifications':
        return `/${lang}/certifications/${source.id}`;
      default:
        return `/${lang}`;
    }
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) {
          this.messages.set(parsed.slice(-MAX_MESSAGES));
        }
      }
    } catch {
      // Malformed or unavailable — start fresh
    }
  }

  private saveHistory(): void {
    if (!this.isBrowser) return;
    try {
      const toSave = this.messages().slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // localStorage full or unavailable
    }
  }

  private scrollToBottom(): void {
    queueMicrotask(() => {
      const el = this.messagesContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
