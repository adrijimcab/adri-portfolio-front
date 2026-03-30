import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-white/[0.06] py-8">
      <div class="mx-auto max-w-6xl px-6 text-center">
        <p class="text-sm text-white/40">
          &copy; {{ currentYear }} Adrian Jimenez Cabello. Built with Angular, NestJS & Supabase.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
