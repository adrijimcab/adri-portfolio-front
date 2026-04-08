import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import type { PortfolioRepository } from '../../domain/repositories';
import type {
  Profile,
  Experience,
  Project,
  TechnologyGroup,
  Education,
  Course,
  SiteConfig,
  SectionConfig,
  SocialLink,
  Certification,
  GitHubRepo,
} from '../../domain/entities';

/**
 * HTTP adapter for {@link PortfolioRepository}.
 *
 * Thin layer on top of {@link ApiService}; its sole responsibility is to
 * translate domain queries into REST calls. No caching, no memoisation,
 * no signal wrapping — that belongs in use-case / view layers.
 */
@Injectable({ providedIn: 'root' })
export class HttpPortfolioRepository implements PortfolioRepository {
  private readonly api = inject(ApiService);

  getProfile(): Observable<Profile> {
    return this.api.get<Profile>('profile');
  }

  getExperiences(): Observable<Experience[]> {
    return this.api.get<Experience[]>('experience');
  }

  getTechnologies(): Observable<TechnologyGroup[]> {
    return this.api.get<TechnologyGroup[]>('technologies');
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('projects?featured=true');
  }

  getAllProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('projects');
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.api.get<Project>(`projects/${slug}`);
  }

  getEducation(): Observable<{ education: Education[]; courses: Course[] }> {
    return this.api.get<{ education: Education[]; courses: Course[] }>('education');
  }

  getSiteConfig(): Observable<SiteConfig> {
    return this.api.get<SiteConfig>('config/site');
  }

  getSections(): Observable<SectionConfig[]> {
    return this.api.get<SectionConfig[]>('config/sections');
  }

  getSocialLinks(): Observable<SocialLink[]> {
    return this.api.get<SocialLink[]>('config/social');
  }

  getCertifications(): Observable<Certification[]> {
    return this.api.get<Certification[]>('certifications');
  }

  getCertificationById(id: string): Observable<Certification> {
    return this.api.get<Certification>(`certifications/${id}`);
  }

  getGithubRepos(): Observable<GitHubRepo[]> {
    return this.api.get<GitHubRepo[]>('github/repos');
  }

  getCvUrl(): Observable<{ url: string }> {
    return this.api.get<{ url: string }>('cv/url');
  }
}
