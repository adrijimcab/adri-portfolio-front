import type { Technology } from './technology.entity';

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
