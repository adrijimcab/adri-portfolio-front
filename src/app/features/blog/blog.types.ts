export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTimeMinutes: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
