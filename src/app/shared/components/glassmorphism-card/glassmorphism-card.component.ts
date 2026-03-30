import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      <ng-content />
    </div>
  `,
})
export class GlassmorphismCardComponent {}
