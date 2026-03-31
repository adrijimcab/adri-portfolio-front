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
    @if (show('hero')) {
      <app-hero [profile]="portfolio.profile()" [config]="portfolio.siteConfig()" />
    }
    @if (show('about')) {
      <app-about [profile]="portfolio.profile()" />
    }
    @if (show('experience')) {
      <app-experience [experiences]="portfolio.experiences() || []" />
    }
    @if (show('tech-stack')) {
      <app-tech-stack [groups]="portfolio.technologies() || []" />
    }
    @if (show('featured-projects')) {
      <app-featured-projects [projects]="portfolio.featuredProjects() || []" />
    }
    @if (show('education')) {
      <app-education-section
        [education]="portfolio.education()?.education || []" />
    }
    @if (show('certifications')) {
      <app-certifications-section [certifications]="portfolio.certifications()" />
    }
    @if (show('github-repos')) {
      <app-github-repos-section [repos]="portfolio.githubRepos()" />
    }
    @if (show('contact')) {
      <app-contact [profile]="portfolio.profile()" [socialLinks]="portfolio.socialLinks() || []" />
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
  }
}
