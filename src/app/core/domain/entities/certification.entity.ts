export interface Certification {
  id: string;
  name: string;
  provider: string;
  date: string | null;
  certificate_url: string | null;
  credential_id: string | null;
  is_verified: boolean;
  description: string | null;
  sort_order: number;
}
