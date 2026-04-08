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
