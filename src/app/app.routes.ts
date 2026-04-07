import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
  {
    path: 'cv',
    loadComponent: () =>
      import('./features/cv-viewer/cv-viewer.component').then((m) => m.CvViewerComponent),
  },
  {
    path: 'uses',
    loadComponent: () =>
      import('./features/uses/uses.component').then((m) => m.UsesComponent),
  },
  {
    path: 'stack',
    loadComponent: () =>
      import('./features/stack/stack.component').then((m) => m.StackComponent),
  },
  {
    path: 'certifications/:id',
    loadComponent: () =>
      import(
        './features/certifications/certification-detail/certification-detail.component'
      ).then((m) => m.CertificationDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/admin/profile-editor/profile-editor.component').then(
            (m) => m.ProfileEditorComponent,
          ),
      },
      {
        path: 'experiences',
        loadComponent: () =>
          import('./features/admin/experiences-editor/experiences-editor.component').then(
            (m) => m.ExperiencesEditorComponent,
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/admin/projects-editor/projects-editor.component').then(
            (m) => m.ProjectsEditorComponent,
          ),
      },
      {
        path: 'technologies',
        loadComponent: () =>
          import('./features/admin/technologies-editor/technologies-editor.component').then(
            (m) => m.TechnologiesEditorComponent,
          ),
      },
      {
        path: 'education',
        loadComponent: () =>
          import('./features/admin/education-editor/education-editor.component').then(
            (m) => m.EducationEditorComponent,
          ),
      },
      {
        path: 'certifications',
        loadComponent: () =>
          import('./features/admin/certifications-editor/certifications-editor.component').then(
            (m) => m.CertificationsEditorComponent,
          ),
      },
      {
        path: 'github',
        loadComponent: () =>
          import('./features/admin/github-manager/github-manager.component').then(
            (m) => m.GithubManagerComponent,
          ),
      },
      {
        path: 'social',
        loadComponent: () =>
          import('./features/admin/social-links-editor/social-links-editor.component').then(
            (m) => m.SocialLinksEditorComponent,
          ),
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./features/admin/config-editor/config-editor.component').then(
            (m) => m.ConfigEditorComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
