import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly visible = signal(false);
  readonly data = signal<ConfirmDialogData>({ title: '', message: '' });
  private result$ = new Subject<boolean>();

  confirm(title: string, message: string): Observable<boolean> {
    this.data.set({ title, message });
    this.visible.set(true);
    this.result$ = new Subject<boolean>();
    return this.result$.asObservable();
  }

  resolve(value: boolean): void {
    this.result$.next(value);
    this.result$.complete();
    this.visible.set(false);
  }
}
