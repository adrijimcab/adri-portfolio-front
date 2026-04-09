import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ChatEvent } from './chat-widget.types';

/**
 * SSE streaming client for the chatbot RAG endpoint.
 * Uses `fetch` + `ReadableStream` + `TextDecoder` to parse SSE events.
 * SSR-safe: returns EMPTY on the server.
 */
@Injectable({ providedIn: 'root' })
export class ChatWidgetService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  askQuestion(message: string, lang: string): Observable<ChatEvent> {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    return new Observable<ChatEvent>((subscriber) => {
      const controller = new AbortController();

      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, lang }),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok || !response.body) {
            subscriber.next({
              type: 'error',
              error: `HTTP ${response.status}: ${response.statusText}`,
            });
            subscriber.complete();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const pump = (): Promise<void> =>
            reader.read().then(({ done, value }) => {
              if (done) {
                subscriber.complete();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n\n');
              // Keep the last (possibly incomplete) chunk in the buffer
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;

                const jsonStr = trimmed.slice('data:'.length).trim();
                if (!jsonStr) continue;

                try {
                  const event = JSON.parse(jsonStr) as ChatEvent;
                  subscriber.next(event);
                } catch {
                  // Malformed JSON line — skip silently
                }
              }

              return pump();
            });

          pump().catch((err: unknown) => {
            if (err instanceof DOMException && err.name === 'AbortError') {
              subscriber.complete();
            } else {
              const errorMessage =
                err instanceof Error ? err.message : 'Unknown stream error';
              subscriber.next({ type: 'error', error: errorMessage });
              subscriber.complete();
            }
          });
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') {
            subscriber.complete();
          } else {
            const errorMessage =
              err instanceof Error ? err.message : 'Network error';
            subscriber.next({ type: 'error', error: errorMessage });
            subscriber.complete();
          }
        });

      return () => controller.abort();
    });
  }
}
