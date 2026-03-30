import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-aurora-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-aurora-1"
           style="background: radial-gradient(circle, var(--color-primary), transparent 70%);"></div>
      <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animate-aurora-2"
           style="background: radial-gradient(circle, var(--color-secondary), transparent 70%);"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] animate-aurora-3"
           style="background: radial-gradient(circle, var(--color-accent), transparent 70%);"></div>
    </div>
  `,
})
export class AuroraBackgroundComponent {}
