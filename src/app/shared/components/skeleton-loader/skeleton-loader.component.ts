import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
      [style.width]="width()"
      [style.height]="height()">
    </div>
  `,
})
export class SkeletonLoaderComponent {
  width = input<string>('100%');
  height = input<string>('80px');
}
