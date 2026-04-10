import { Injectable, signal } from '@angular/core';
import { TOAST_DURATION_MS } from '../../constants/timing';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  remove(id: number): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  private add(message: string, type: Toast['type']): void {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, message, type }]);
    const timeoutId = setTimeout(() => this.remove(id), TOAST_DURATION_MS);
    this.timeouts.set(id, timeoutId);
  }
}
