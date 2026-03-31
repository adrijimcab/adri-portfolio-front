import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dialog.visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          class="mx-4 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.06] p-6 backdrop-blur-xl"
        >
          <h3 class="mb-2 text-lg font-semibold text-white">{{ dialog.data().title }}</h3>
          <p class="mb-6 text-sm text-white/60">{{ dialog.data().message }}</p>
          <div class="flex justify-end gap-3">
            <button
              (click)="dialog.resolve(false)"
              class="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              (click)="dialog.resolve(true)"
              class="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);
}
