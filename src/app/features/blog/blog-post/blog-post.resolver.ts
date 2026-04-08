import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { BlogService } from '../blog.service';
import type { BlogPost } from '../blog.types';

/**
 * Resolves the blog post for `/blog/:slug` before the component renders.
 * Posts are bundled in `content/posts/posts.ts`, so resolution is sync — no
 * TransferState is needed. Running as a resolver guarantees SeoService fires
 * on the server before the first HTML flush.
 */
export const blogPostResolver: ResolveFn<BlogPost | null> = (route): BlogPost | null => {
  const blog = inject(BlogService);
  const slug = route.paramMap.get('slug') ?? '';
  return blog.getPostBySlug(slug) ?? null;
};
