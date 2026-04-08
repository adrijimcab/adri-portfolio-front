import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import type {
  Profile, Experience, Project, TechnologyGroup,
  SiteConfig, SectionConfig, SocialLink, Education, Course,
  Certification, GitHubRepo,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly api = inject(ApiService);

  readonly profile = toSignal(this.api.get<Profile>('profile'));
  readonly experiences = toSignal(this.api.get<Experience[]>('experience'));
  readonly technologies = toSignal(this.api.get<TechnologyGroup[]>('technologies'));
  readonly featuredProjects = toSignal(this.api.get<Project[]>('projects?featured=true'));
  readonly education = toSignal(this.api.get<{ education: Education[]; courses: Course[] }>('education'));
  readonly siteConfig = toSignal(this.api.get<SiteConfig>('config/site'));
  readonly sections = toSignal(this.api.get<SectionConfig[]>('config/sections'));
  readonly socialLinks = toSignal(this.api.get<SocialLink[]>('config/social'));
  readonly certifications = toSignal(this.api.get<Certification[]>('certifications'));
  readonly githubRepos = toSignal(this.api.get<GitHubRepo[]>('github/repos'));

  getAllProjects() {
    return this.api.get<Project[]>('projects');
  }

  getProjectBySlug(slug: string) {
    return this.api.get<Project>(`projects/${slug}`);
  }

  getCvUrl() {
    return this.api.get<{ url: string }>('cv/url');
  }

  getCertificationById(id: string) {
    return this.api.get<Certification>(`certifications/${id}`);
  }
}
