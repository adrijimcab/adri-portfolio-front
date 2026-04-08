export type SiteConfig = Record<string, string>;

export interface SectionConfig {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
}
