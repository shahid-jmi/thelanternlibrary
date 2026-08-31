import { Heart, Instagram } from 'lucide-react';
import ImageTile from '@/app/components/ImageTile';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { INSTAGRAM_POSTS } from './data';

export default function InstagramSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">viii.</Eyebrow>
        <h2 className="mb-4 text-center text-3xl tracking-tight">Follow Along</h2>
        <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
          Glimpses from the shop, shared as they happen — @lanternlibrary
        </p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {INSTAGRAM_POSTS.map((post, index) => (
          <Reveal key={post.id} delay={index * 70}>
            <ImageTile
              className="aspect-square"
              src={post.image}
              alt={post.caption}
              placeholder={<Instagram className="h-8 w-8 text-tile-accent" strokeWidth={1.25} />}
              overlay={
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-white opacity-0 transition group-hover/tile:opacity-100">
                  <p className="mb-1 text-xs leading-4">{post.caption}</p>
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Heart className="h-3.5 w-3.5" />
                    {post.likes}
                  </span>
                </div>
              }
            />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <a
          href="https://instagram.com/lanternlibrary"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3.5 text-xs uppercase tracking-label transition hover:border-ember hover:text-ember"
        >
          <Instagram className="h-4 w-4" />
          Follow @lanternlibrary
        </a>
      </div>
    </section>
  );
}
