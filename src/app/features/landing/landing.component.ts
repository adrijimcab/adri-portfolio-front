// TODO(fase-4): evaluate rxResource refactor.
// The landing currently consumes 9 lazy signals from PortfolioService,
// each backed by a separate endpoint. Migrating to rxResource was
// considered in Fase 3 but declined because:
//   1. Each section is @defer (on viewport), so the HTTP only fires
//      when that section scrolls in — we already pay per-section cost.
//   2. rxResource shines when inputs drive refetch (params, filters);
//      these signals are fire-once per session, no input dependency.
//   3. A unified rxResource would require a backend aggregate endpoint,
//      which is out of scope for Fase 3.
// Revisit only if the backend exposes a GET /portfolio/landing bundle.
import { Component, ChangeDetectionStrategy, inject, effect, computed } from '@angular/core';
import { PortfolioService } from '../../core/services/portfolio.service';
import { SeoService } from '../../core/services/seo.service';
import { HeroComponent } from './sections/hero/hero.component';
import { AboutComponent } from './sections/about/about.component';
import { ExperienceComponent } from './sections/experience/experience.component';
import { TechStackComponent } from './sections/tech-stack/tech-stack.component';
import { FeaturedProjectsComponent } from './sections/featured-projects/featured-projects.component';
import { EducationSectionComponent } from './sections/education/education.component';
import { CertificationsSectionComponent } from './sections/certifications/certifications.component';
import { GitHubReposSectionComponent } from './sections/github-repos/github-repos.component';
import { ContactComponent } from './sections/contact/contact.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent, AboutComponent, ExperienceComponent,
    TechStackComponent, FeaturedProjectsComponent,
    EducationSectionComponent, CertificationsSectionComponent,
    GitHubReposSectionComponent, ContactComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Above the fold: render eagerly so the hero is ready for LCP. -->
    @if (show('hero')) {
      <app-hero [profile]="portfolio.profile()" [config]="portfolio.siteConfig()" />
    }
    @if (show('about')) {
      <app-about [profile]="portfolio.profile()" />
    }

    <!-- Everything below is deferred until it scrolls into view. -->
    @if (show('experience')) {
      @defer (on viewport) {
        <app-experience [experiences]="portfolio.experiences() || []" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[400px]" aria-hidden="true"></div>
      }
    }
    @if (show('tech-stack')) {
      @defer (on viewport) {
        <app-tech-stack [groups]="portfolio.technologies() || []" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[400px]" aria-hidden="true"></div>
      }
    }
    @if (show('featured-projects')) {
      @defer (on viewport) {
        <app-featured-projects [projects]="portfolio.featuredProjects() || []" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[500px]" aria-hidden="true"></div>
      }
    }
    @if (show('education')) {
      @defer (on viewport) {
        <app-education-section [education]="portfolio.education()?.education || []" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[400px]" aria-hidden="true"></div>
      }
    }
    @if (show('certifications')) {
      @defer (on viewport) {
        <app-certifications-section [certifications]="portfolio.certifications()" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[400px]" aria-hidden="true"></div>
      }
    }
    @if (show('github-repos')) {
      @defer (on viewport) {
        <app-github-repos-section [repos]="portfolio.githubRepos()" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[400px]" aria-hidden="true"></div>
      }
    }
    @if (show('contact')) {
      @defer (on viewport) {
        <app-contact [profile]="portfolio.profile()" [socialLinks]="portfolio.socialLinks() || []" />
      } @placeholder (minimum 100ms) {
        <div class="min-h-[500px]" aria-hidden="true"></div>
      }
    }
  `,
})
export class LandingComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly seo = inject(SeoService);

  readonly visibleSections = computed(() => {
    const sections = this.portfolio.sections();
    if (!sections) return new Set<string>();
    return new Set(
      sections
        .filter((s) => s.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => s.section_key),
    );
  });

  show(key: string): boolean {
    const sections = this.visibleSections();
    return sections.size === 0 || sections.has(key);
  }

  constructor() {
    effect(() => {
      const config = this.portfolio.siteConfig();
      if (config) {
        this.seo.updateMeta({
          title: config['meta_title'] ?? 'Adrián Jiménez Cabello',
          description: config['meta_description'],
          image: config['meta_image'],
        });
      }
    });

    effect(() => {
      const profile = this.portfolio.profile();
      if (profile) {
        this.seo.setPersonSchema({
          full_name: profile.full_name,
          title: profile.title,
          email: profile.email,
          location: profile.location,
        });
        this.seo.setWebSiteSchema();
        this.seo.setProfessionalServiceSchema();
      }
    });
  }
}
