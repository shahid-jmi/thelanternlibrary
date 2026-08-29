import { Link } from 'react-router';
import { BookOpen, Feather, Flower2, Mail, Mountain, Scroll } from 'lucide-react';
import Reveal from '@/app/components/Reveal';

export default function LibraryCabinetBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal>
        <div className="grid overflow-hidden rounded-sm border border-border md:grid-cols-2">
          <div className="dark flex flex-col items-start gap-5 bg-background px-8 py-12 text-foreground sm:px-12">
            <p className="text-[10px] uppercase tracking-wide-lg text-accent">The Shelves</p>
            <h3 className="text-3xl tracking-tight">Browse Our Library</h3>
            <p className="max-w-sm italic leading-7 opacity-75">
              Fiction, memoir, poetry, and the occasional unclassifiable thing — each spine read
              before it is sold.
            </p>
            <div className="flex gap-3">
              {[BookOpen, Feather, Scroll].map((Icon, index) => (
                <div
                  key={index}
                  className="flex h-16 w-14 items-center justify-center rounded-sm border border-border"
                >
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.25} />
                </div>
              ))}
            </div>
            <Link
              to="/catalog"
              className="mt-2 rounded-sm border border-[var(--button-border)] px-6 py-3 text-xs uppercase tracking-label transition hover:border-accent hover:text-accent"
            >
              Enter the Library →
            </Link>
          </div>
          <div className="flex flex-col items-start gap-5 bg-ember px-8 py-12 text-ember-foreground sm:px-12">
            <p className="text-[10px] uppercase tracking-wide-lg opacity-80">The Cabinet</p>
            <h3 className="text-3xl tracking-tight">Explore Art &amp; Gifts</h3>
            <p className="max-w-sm italic leading-7 opacity-85">
              Postcards, dried flowers, letters written by hand — small things that carry the
              valley with them.
            </p>
            <div className="flex gap-3">
              {[Mail, Flower2, Mountain].map((Icon, index) => (
                <div
                  key={index}
                  className="flex h-16 w-14 items-center justify-center rounded-sm border border-ember-foreground/40"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.25} />
                </div>
              ))}
            </div>
            <a
              href="#offer"
              className="mt-2 rounded-sm border border-ember-foreground/60 px-6 py-3 text-xs uppercase tracking-label transition hover:bg-[rgba(0,0,0,0.12)]"
            >
              See the Collection →
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
