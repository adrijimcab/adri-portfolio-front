import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { LinkedinWidgetComponent } from '../../../../shared/components/linkedin-widget/linkedin-widget.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { Profile, SocialLink } from '../../../../core/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, LinkedinWidgetComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="py-24 px-6">
      <div class="mx-auto max-w-2xl text-center">
        <app-section-header [title]="t.t('contact.title')" [label]="t.t('contact.label')" />

        <div appScrollAnimate>
          <app-glass-card>
            <p class="mb-6 text-white/60">{{ t.t('contact.subtitle') }}</p>

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

        <!-- LinkedIn Widget -->
        <div class="mt-8" appScrollAnimate [delay]="200">
          <app-linkedin-widget
            [name]="profile()?.full_name || 'Adrián Jiménez Cabello'"
            [title]="profile()?.title || 'Senior Frontend Engineer'" />
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  readonly t = inject(TranslateService);
  profile = input<Profile | undefined>();
  socialLinks = input<SocialLink[]>([]);
}
