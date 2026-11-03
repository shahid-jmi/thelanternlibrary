// Thin wrapper over the Instagram Graph API (graph.facebook.com), read with a
// never-expiring system-user token from the shop's Meta business portfolio.
// Only the one call the storefront feed needs: list the account's own media.
const GRAPH_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = 'v26.0';
const REQUEST_TIMEOUT_MS = 8_000;

export const MEDIA_FIELDS = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'thumbnail_url',
  'permalink',
  'like_count',
  'timestamp',
].join(',');

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  like_count?: number;
  timestamp: string;
}

export class InstagramApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'InstagramApiError';
  }
}

export const fetchRecentMedia = async ({
  accessToken,
  userId,
  limit,
}: {
  accessToken: string;
  userId: string;
  limit: number;
}): Promise<InstagramMedia[]> => {
  const url = new URL(`/${GRAPH_VERSION}/${encodeURIComponent(userId)}/media`, GRAPH_URL);
  url.searchParams.set('fields', MEDIA_FIELDS);
  url.searchParams.set('limit', String(limit));

  // Bearer header rather than a query param keeps the token out of any URL
  // that ends up in logs or error reports.
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body = (await response.json().catch(() => null)) as {
    data?: InstagramMedia[];
    error?: { message?: string };
  } | null;

  if (!response.ok || !body) {
    throw new InstagramApiError(
      body?.error?.message ?? `Instagram API responded with ${response.status}`,
      response.status
    );
  }

  return body.data ?? [];
};
