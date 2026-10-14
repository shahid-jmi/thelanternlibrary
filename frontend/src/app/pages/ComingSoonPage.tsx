import { Instagram, MessageCircle } from 'lucide-react';
import LanternMark from '@/app/components/LanternMark';
import Reveal from '@/app/components/Reveal';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, LOCATION, WHATSAPP_URL } from '@/app/lib/site';

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-[calc(100vh-5rem)] px-4 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-xl text-center">
        <LanternMark className="mx-auto h-20 w-auto text-accent opacity-90 sm:h-24" />
        <p className="mt-8 text-[10px] uppercase tracking-widest text-accent">
          · Coming Soon · {LOCATION} ·
        </p>
        <h1 className="mt-5 text-4xl leading-tight tracking-normal sm:text-5xl">
          The Lantern <span className="italic text-accent">Library</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-label text-ember">From Kashmir to Kashmir</p>
        <p className="mx-auto mt-8 max-w-md text-base leading-8 opacity-80">
          We&apos;re lighting the lantern and arranging the shelves. A curated collection of
          timeless literature and contemporary thought is on its way — check back soon.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-ember px-8 py-3.5 text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            Message Us
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3.5 text-xs uppercase tracking-label transition hover:border-ember hover:text-ember"
          >
            <Instagram className="h-4 w-4" />@{INSTAGRAM_HANDLE}
          </a>
        </div>
        <p className="mt-12 text-[10px] uppercase tracking-wide-lg opacity-55">
          — Est. on a long winter afternoon —
        </p>
      </Reveal>
    </main>
  );
}
