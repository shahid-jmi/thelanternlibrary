import { useQuery } from '@tanstack/react-query';
import { getInstagramPosts } from '@/app/api/instagram';

export const instagramKeys = {
  posts: ['instagram', 'posts'] as const,
};

export function useInstagramPosts() {
  return useQuery({
    queryKey: instagramKeys.posts,
    queryFn: getInstagramPosts,
    // The backend caches the feed for 30 minutes; no point refetching sooner.
    staleTime: 10 * 60_000,
  });
}
