'use server';

import { fetchMoreLatestPosts as fetchPosts } from '@/actions/posts';

export async function fetchMorePosts(skip: number, limit: number, sortBy: string) {
  return fetchPosts(skip, limit, sortBy);
}
