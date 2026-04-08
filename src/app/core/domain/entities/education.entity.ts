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
