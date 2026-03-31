import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex min-w-72 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-xl animate-in slide-in-from-right"
          [class]="typeClasses[toast.type]"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.remove(toast.id)"
            class="text-white/40 transition-colors hover:text-white/80"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-in {
      animation: slideIn 0.2s ease-out;
    }
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  readonly typeClasses: Record<string, string> = {
    success: 'border-green-500/20 bg-green-500/10 text-green-400',
    error: 'border-red-500/20 bg-red-500/10 text-red-400',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  };
}
