import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import createApp from '../app.js';
import { resetInstagramCacheForTests } from '../modules/instagram/instagram.service.js';

const app = createApp();

const MEDIA = [
  {
    id: '1',
    caption: '  Morning light on the shelves.  ',
    media_type: 'IMAGE',
    media_url: 'https://cdn.example.com/1.jpg',
    permalink: 'https://www.instagram.com/p/1/',
    like_count: 42,
    timestamp: '2026-10-30T09:00:00+0000',
  },
  {
    id: '2',
    media_type: 'VIDEO',
    media_url: 'https://cdn.example.com/2.mp4',
    thumbnail_url: 'https://cdn.example.com/2-cover.jpg',
    permalink: 'https://www.instagram.com/reel/2/',
    timestamp: '2026-10-29T09:00:00+0000',
  },
  {
    // Copyright-flagged media arrives without a URL.
    id: '3',
    media_type: 'VIDEO',
    permalink: 'https://www.instagram.com/reel/3/',
    timestamp: '2026-10-28T09:00:00+0000',
  },
];

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const mockFetch = (respond: () => Response) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => respond());

beforeEach(() => {
  resetInstagramCacheForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/v1/instagram', () => {
  it('maps media into posts, using video covers and skipping media without a URL', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ data: MEDIA }));

    const response = await request(app).get('/api/v1/instagram');

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=300');
    expect(response.body.posts).toEqual([
      {
        id: '1',
        caption: 'Morning light on the shelves.',
        mediaType: 'IMAGE',
        imageUrl: 'https://cdn.example.com/1.jpg',
        permalink: 'https://www.instagram.com/p/1/',
        likeCount: 42,
        timestamp: '2026-10-30T09:00:00+0000',
      },
      {
        id: '2',
        caption: null,
        mediaType: 'VIDEO',
        imageUrl: 'https://cdn.example.com/2-cover.jpg',
        permalink: 'https://www.instagram.com/reel/2/',
        likeCount: null,
        timestamp: '2026-10-29T09:00:00+0000',
      },
    ]);

    const [input, init] = fetchMock.mock.calls[0]!;
    const url = new URL(String(input));
    expect(url.origin).toBe('https://graph.facebook.com');
    expect(url.pathname).toMatch(/^\/v\d+\.\d+\/17841400000000000\/media$/);
    expect(url.searchParams.get('limit')).toBe('8');
    expect(url.searchParams.has('access_token')).toBe(false);
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer test-instagram-token');
  });

  it('serves repeat requests from the cache', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ data: MEDIA }));

    await request(app).get('/api/v1/instagram');
    await request(app).get('/api/v1/instagram');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list instead of an error when Instagram fails', async () => {
    mockFetch(() => jsonResponse({ error: { message: 'Invalid OAuth access token' } }, 400));

    const response = await request(app).get('/api/v1/instagram');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
  });

  it('keeps serving the last posts when a later refetch fails', async () => {
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    mockFetch(() => jsonResponse({ data: MEDIA }));
    await request(app).get('/api/v1/instagram');

    vi.mocked(globalThis.fetch).mockImplementation(async () =>
      jsonResponse({ error: { message: 'Service unavailable' } }, 503)
    );
    now.mockReturnValue(1_000_000 + 31 * 60 * 1000);
    const response = await request(app).get('/api/v1/instagram');

    expect(response.body.posts.map((post: { id: string }) => post.id)).toEqual(['1', '2']);
  });
});
