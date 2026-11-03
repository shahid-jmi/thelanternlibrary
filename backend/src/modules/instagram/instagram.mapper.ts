import type { InstagramMedia, InstagramMediaType } from './instagram.client.js';

export interface PublicInstagramPostDto {
  id: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  imageUrl: string;
  permalink: string;
  likeCount: number | null;
  timestamp: string;
}

// Videos expose their playable file as media_url, so the tile uses the cover
// frame instead; images and carousels (first slide) use media_url directly.
const imageUrlOf = (media: InstagramMedia): string | undefined =>
  media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url;

export const toPublicInstagramPosts = (media: InstagramMedia[]): PublicInstagramPostDto[] =>
  media.flatMap((item) => {
    const imageUrl = imageUrlOf(item);
    // Copyright-flagged media comes back without a URL — skip it rather than
    // render an empty tile.
    if (!imageUrl) {
      return [];
    }

    return [
      {
        id: item.id,
        caption: item.caption?.trim() || null,
        mediaType: item.media_type,
        imageUrl,
        permalink: item.permalink,
        likeCount: item.like_count ?? null,
        timestamp: item.timestamp,
      },
    ];
  });
