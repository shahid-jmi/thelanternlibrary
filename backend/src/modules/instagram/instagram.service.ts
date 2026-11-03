import env from '../../config/env.js';
import logger from '../../common/utils/logger.js';
import { fetchRecentMedia } from './instagram.client.js';
import { toPublicInstagramPosts, type PublicInstagramPostDto } from './instagram.mapper.js';

export const INSTAGRAM_POST_LIMIT = 8;
const CACHE_TTL_MS = 30 * 60 * 1000;
const FAILURE_RETRY_MS = 5 * 60 * 1000;

interface FeedCache {
  posts: PublicInstagramPostDto[];
  fetchedAt: number;
}

let cache: FeedCache | null = null;
let inFlight: Promise<PublicInstagramPostDto[]> | null = null;

const loadPosts = async (): Promise<PublicInstagramPostDto[]> => {
  if (!env.instagram) {
    return [];
  }

  const media = await fetchRecentMedia({ ...env.instagram, limit: INSTAGRAM_POST_LIMIT });
  return toPublicInstagramPosts(media).slice(0, INSTAGRAM_POST_LIMIT);
};

// Never throws: the homepage falls back to its placeholder tiles on an empty
// list, so an Instagram outage or revoked token degrades to stale (or no)
// posts instead of an error.
export const getRecentPosts = async (): Promise<PublicInstagramPostDto[]> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.posts;
  }

  inFlight ??= loadPosts()
    .then((posts) => {
      cache = { posts, fetchedAt: Date.now() };
      return posts;
    })
    .catch((error: unknown) => {
      logger.error({ err: error }, 'Failed to fetch Instagram posts');
      // Keep serving what we had, and back off before trying Instagram again.
      const posts = cache?.posts ?? [];
      cache = { posts, fetchedAt: Date.now() - CACHE_TTL_MS + FAILURE_RETRY_MS };
      return posts;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

export const resetInstagramCacheForTests = (): void => {
  cache = null;
  inFlight = null;
};
