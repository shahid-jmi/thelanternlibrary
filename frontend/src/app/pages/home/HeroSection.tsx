import { Link } from 'react-router';
import { MessageCircle, Sparkles, Truck } from 'lucide-react';
import ImageTile from '@/app/components/ImageTile';
import LanternMark from '@/app/components/LanternMark';
import Reveal from '@/app/components/Reveal';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[45fr_55fr] lg:gap-16 lg:px-8">
      <Reveal>
        <ImageTile
          className="aspect-[4/3] w-full lg:aspect-[4/5]"
          src="https://images.pexels.com/photos/28463826/pexels-photo-28463826/free-photo-of-cozy-library-aisle-with-warm-lighting.jpeg?cs=tinysrgb&w=1200"
          alt="A warmly lit library reading room"
          placeholder={
            <div className="flex flex-col items-center gap-6 text-tile-foreground">
              <LanternMark className="h-32 w-auto sm:h-40" />
              <span className="text-[9px] uppercase tracking-loose opacity-70">
                The reading room — Srinagar
              </span>
            </div>
          }
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="text-center lg:text-start">
          <p className="mb-5 text-[10px] uppercase tracking-widest text-accent">
            · A Curated Catalog — Srinagar, Kashmir ·
          </p>
          <h1 className="mb-6 text-5xl leading-tight tracking-normal sm:text-6xl">
            The Lantern <span className="italic text-accent">Library</span>
          </h1>
          <p className="mb-3 text-xs uppercase tracking-label text-ember">From Kashmir to Kashmir</p>
          <p className="mb-8 text-sm italic tracking-normal opacity-75">
            Where books and memory live together.
          </p>
          <p className="mb-10 max-w-xl text-lg leading-8 opacity-85 lg:mx-0">
            A curated collection of timeless literature and contemporary thought. Each book is
            chosen with care for readers who seek depth, beauty, and meaning in the written word.
          </p>
          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              to="/catalog"
              className="rounded-sm bg-ember px-8 py-3.5 text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110"
            >
              Browse Catalog →
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3.5 text-xs uppercase tracking-label transition hover:border-ember hover:text-ember"
            >
              <MessageCircle className="h-4 w-4" />
              Order Directly
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-label opacity-70 lg:justify-start">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" strokeWidth={1.5} />
              Pan-India Delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" strokeWidth={1.5} />
              WhatsApp Ordering
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
              Handpicked Selection
            </span>
          </div>
          <p className="mt-10 text-[10px] uppercase tracking-wide-lg opacity-55">
            — Est. on a long winter afternoon —
          </p>
        </div>
      </Reveal>
    </section>
  );
}
