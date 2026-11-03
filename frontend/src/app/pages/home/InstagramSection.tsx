import { Heart, Instagram } from 'lucide-react';
import ImageTile from '@/app/components/ImageTile';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/app/lib/site';
import { useInstagramPosts } from '@/app/queries/instagram';
import { INSTAGRAM_POSTS } from './data';

interface FeedTile {
  id: string;
  caption: string;
  image?: string;
  likes: number | null;
  href: string;
}

const FALLBACK_TILES: FeedTile[] = INSTAGRAM_POSTS.map((post) => ({
  id: String(post.id),
  caption: post.caption,
  image: post.image,
  likes: post.likes,
  href: INSTAGRAM_URL,
}));

// Image-less tiles (line-art placeholder) while the live feed loads, so the
// fallback photos never flash in before the real posts replace them.
const LOADING_TILES: FeedTile[] = FALLBACK_TILES.map((tile) => ({
  ...tile,
  caption: '',
  image: undefined,
  likes: null,
}));

function useFeedTiles(): FeedTile[] {
  const { data: posts, isPending } = useInstagramPosts();

  if (isPending) return LOADING_TILES;
  if (!posts?.length) return FALLBACK_TILES;

  return posts.map((post) => ({
    id: post.id,
    caption: post.caption ?? '',
    image: post.imageUrl,
    likes: post.likeCount,
    href: post.permalink,
  }));
}

export default function InstagramSection() {
  const tiles = useFeedTiles();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">viii.</Eyebrow>
        <h2 className="mb-4 text-center text-3xl tracking-tight">Follow Along</h2>
        <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
          Glimpses from the shop, shared as they happen — @{INSTAGRAM_HANDLE}
        </p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile, index) => (
          <Reveal key={tile.id} delay={index * 70}>
            <a
              href={tile.href}
              target="_blank"
              rel="noreferrer"
              aria-label={tile.caption || `View on Instagram @${INSTAGRAM_HANDLE}`}
              className="block"
            >
              <ImageTile
                className="aspect-square"
                src={tile.image}
                alt={tile.caption}
                placeholder={<Instagram className="h-8 w-8 text-tile-accent" strokeWidth={1.25} />}
                overlay={
                  tile.caption || tile.likes !== null ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-white opacity-0 transition group-hover/tile:opacity-100">
                      {tile.caption && (
                        <p className="mb-1 line-clamp-3 text-xs leading-4">{tile.caption}</p>
                      )}
                      {tile.likes !== null && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Heart className="h-3.5 w-3.5" />
                          {tile.likes}
                        </span>
                      )}
                    </div>
                  ) : undefined
                }
              />
            </a>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3.5 text-xs uppercase tracking-label transition hover:border-ember hover:text-ember"
        >
          <Instagram className="h-4 w-4" />
          Follow @{INSTAGRAM_HANDLE}
        </a>
      </div>
    </section>
  );
}
