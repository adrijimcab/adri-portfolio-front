import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { ChatWidgetService } from './chat-widget.service';
import type { ChatEvent } from './chat-widget.types';

// jsdom does not provide ReadableStream — polyfill from Node.js
if (typeof globalThis.ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as Record<string, unknown>)['ReadableStream'] = NodeReadableStream as unknown;
}

/**
 * Helper: creates a ReadableStream that emits SSE-formatted chunks.
 */
function createSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      }
      controller.close();
    },
  });
}

describe('ChatWidgetService', () => {
  let service: ChatWidgetService;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatWidgetService);
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('emits chunk events followed by a done event', () => {
    const sseEvents = [
      '{"type":"chunk","content":"Hello"}',
      '{"type":"chunk","content":" world"}',
      '{"type":"chunk","content":"!"}',
      '{"type":"done","sources":[{"table":"projects","id":"abc"}]}',
    ];

    fetchSpy.mockResolvedValueOnce(
      new Response(createSSEStream(sseEvents), {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );

    const received: ChatEvent[] = [];

    return new Promise<void>((resolve) => {
      service.askQuestion('test', 'es').subscribe({
        next: (event) => received.push(event),
        complete: () => {
          expect(received).toHaveLength(4);
          expect(received[0]).toEqual({ type: 'chunk', content: 'Hello' });
          expect(received[1]).toEqual({ type: 'chunk', content: ' world' });
          expect(received[2]).toEqual({ type: 'chunk', content: '!' });
          expect(received[3]).toEqual({
            type: 'done',
            sources: [{ table: 'projects', id: 'abc' }],
          });
          resolve();
        },
      });
    });
  });

  it('emits an error event on non-OK HTTP response', () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const received: ChatEvent[] = [];

    return new Promise<void>((resolve) => {
      service.askQuestion('fail', 'en').subscribe({
        next: (event) => received.push(event),
        complete: () => {
          expect(received).toHaveLength(1);
          expect(received[0].type).toBe('error');
          expect(received[0].error).toContain('500');
          resolve();
        },
      });
    });
  });

  it('emits an error event on network failure', () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network failure'));

    const received: ChatEvent[] = [];

    return new Promise<void>((resolve) => {
      service.askQuestion('fail', 'en').subscribe({
        next: (event) => received.push(event),
        complete: () => {
          expect(received).toHaveLength(1);
          expect(received[0].type).toBe('error');
          expect(received[0].error).toBe('Network failure');
          resolve();
        },
      });
    });
  });

  it('completes cleanly when unsubscribed (abort)', () => {
    // Create a stream that never closes
    const stream = new ReadableStream<Uint8Array>({
      start() {
        // Intentionally left open — simulates a long-lived SSE connection
      },
    });

    fetchSpy.mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );

    const sub = service.askQuestion('cancel-me', 'es').subscribe();

    // Unsubscribing should trigger the AbortController
    expect(() => sub.unsubscribe()).not.toThrow();
  });
});
