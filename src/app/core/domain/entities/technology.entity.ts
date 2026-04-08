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
