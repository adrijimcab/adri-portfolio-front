import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
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
    <app-hero [profile]="portfolio.profile()" [config]="portfolio.siteConfig()" />
    <app-about [profile]="portfolio.profile()" />
    <app-experience [experiences]="portfolio.experiences() || []" />
    <app-tech-stack [groups]="portfolio.technologies() || []" />
    <app-featured-projects [projects]="portfolio.featuredProjects() || []" />
    <app-education-section
      [education]="portfolio.education()?.education || []"
      [courses]="portfolio.education()?.courses || []" />
    <app-certifications-section [certifications]="portfolio.certifications()" />
    <app-github-repos-section [repos]="portfolio.githubRepos()" />
    <app-contact [profile]="portfolio.profile()" [socialLinks]="portfolio.socialLinks() || []" />
  `,
})
export class LandingComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const config = this.portfolio.siteConfig();
      if (config) {
        this.seo.updateMeta({
          title: config['site_title'] ?? 'Adrián Jiménez Cabello',
          description: config['site_description'],
        });
      }
    });
  }
}
