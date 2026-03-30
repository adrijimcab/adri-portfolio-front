import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-12 text-center">
      <span class="text-xs tracking-[4px] uppercase"
            style="color: var(--color-secondary);">
        {{ label() }}
      </span>
      <h2 class="mt-3 text-4xl font-bold text-white md:text-5xl">
        {{ title() }}
      </h2>
    </div>
  `,
})
export class SectionHeaderComponent {
  title = input.required<string>();
  label = input<string>('');
}
