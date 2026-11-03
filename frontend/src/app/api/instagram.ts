import { api } from '@/app/api/client';
import type { InstagramPost } from '@/app/api/types';

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const { data } = await api.get<{ posts?: InstagramPost[] }>('/instagram');
  return Array.isArray(data?.posts) ? data.posts : [];
}
