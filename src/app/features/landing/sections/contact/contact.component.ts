import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { Profile, SocialLink } from '../../../../core/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="py-24 px-6">
      <div class="mx-auto max-w-2xl text-center">
        <app-section-header title="Get In Touch" label="Contact" />

        <div appScrollAnimate>
          <app-glass-card>
            <p class="mb-6 text-white/60">Interested in working together? Let's connect.</p>

            @if (profile()?.email) {
              <a [href]="'mailto:' + profile()?.email"
                 class="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-white font-medium transition-all hover:scale-105"
                 style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
                {{ profile()?.email }}
              </a>
            }

            @if (socialLinks().length) {
              <div class="mt-8 flex justify-center gap-4">
                @for (link of socialLinks(); track link.id) {
                  <a [href]="link.url" target="_blank" rel="noopener noreferrer"
                     class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-all hover:border-white/20 hover:text-white hover:scale-110">
                    {{ link.platform.charAt(0).toUpperCase() }}
                  </a>
                }
              </div>
            }
          </app-glass-card>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  profile = input<Profile | undefined>();
  socialLinks = input<SocialLink[]>([]);
}
