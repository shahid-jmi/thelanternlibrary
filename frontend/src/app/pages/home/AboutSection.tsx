import { Sparkles } from 'lucide-react';
import ImageTile from '@/app/components/ImageTile';
import LanternMark from '@/app/components/LanternMark';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto scroll-mt-24 max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">vii.</Eyebrow>
        <h2 className="mb-10 text-center text-4xl tracking-snug">About The Lantern Library</h2>
      </Reveal>
      <div className="grid gap-10 lg:grid-cols-[45fr_55fr] lg:items-center lg:gap-14">
        <Reveal>
          <ImageTile
            className="aspect-[4/5]"
            src="https://images.pexels.com/photos/28649539/pexels-photo-28649539/free-photo-of-stack-of-vintage-books-in-cozy-library.jpeg?cs=tinysrgb&w=800"
            alt="A stack of vintage books in the reading room"
            placeholder={<LanternMark className="h-24 w-auto text-tile-accent" />}
          />
        </Reveal>
        <Reveal delay={100}>
          <div className="space-y-6 text-[17px] leading-9">
            <p>
              The Lantern Library began as a passion project: a place to share thoughtfully
              curated books with readers who value quality, atmosphere, and meaningful reading
              experiences.
            </p>
            <p className="text-xl italic leading-9 text-ember">
              Every book should be more than words on pages — a doorway to new perspectives, a
              companion in quiet moments, a spark for better conversations.
            </p>
            <div className="rounded-sm border border-border bg-card p-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember/10 text-ember">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="text-2xl">Our Vision</h3>
              </div>
              <p className="opacity-85">
                We are building toward a warmer, more personal bookstore experience. Until then,
                this catalogue brings that curated feeling online.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
