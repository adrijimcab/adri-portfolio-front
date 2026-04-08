import type { Technology } from './technology.entity';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  demo_url: string | null;
  repo_url: string | null;
  is_featured: boolean;
  sort_order: number;
  technologies: Technology[];
}
