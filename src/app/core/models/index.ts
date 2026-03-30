export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface Profile {
  id: string;
  full_name: string;
  title: string;
  subtitle: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
}

export interface Experience {
  id: string;
  company: string;
  client: string | null;
  role: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  achievements: string[];
  sort_order: number;
  technologies: Technology[];
}

export interface Technology {
  id: string;
  name: string;
  icon_slug: string;
  category?: string;
  proficiency_level?: number;
  is_primary?: boolean;
}

export interface TechnologyGroup {
  category: string;
  technologies: Technology[];
}

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

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  year_start: number | null;
  year_end: number | null;
  description: string | null;
}

export interface Course {
  id: string;
  name: string;
  provider: string | null;
  date: string | null;
  certificate_url: string | null;
}

export interface SiteConfig {
  [key: string]: string;
}

export interface SectionConfig {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_slug: string;
  sort_order: number;
}
