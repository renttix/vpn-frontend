'use server';

import { fetchMoreCategoryPosts as fetchPosts } from '@/actions/posts';

export async function fetchMorePosts(categorySlug: string, skip: number, limit: number, sortBy: string) {
  return fetchPosts(categorySlug, skip, limit, sortBy);
}
