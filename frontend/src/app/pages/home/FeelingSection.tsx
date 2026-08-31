import ImageTile from '@/app/components/ImageTile';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { MOSAIC } from './data';

export default function FeelingSection() {
  return (
    <section className="dark mt-12 w-full border-y border-border bg-background py-20 text-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <Eyebrow className="mb-3">iv.</Eyebrow>
          <h2 className="mb-6 text-4xl leading-tight tracking-tight">A Space Built on Feeling</h2>
          <p className="mb-5 text-xl italic leading-9 opacity-90">
            Some bookshops sell paper. We would rather lend you a lamp.
          </p>
          <p className="max-w-md leading-8 opacity-75">
            The library began in one room in Srinagar — shelves against a cold wall, kahwa going
            lukewarm, someone always reading aloud. This catalog is our attempt to keep that room
            open to anyone, anywhere.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {MOSAIC.map((tile, index) => (
            <Reveal key={tile.label} delay={index * 80}>
              <ImageTile
                className="aspect-square"
                src={tile.image}
                alt={tile.label}
                placeholder={
                  <div className="flex flex-col items-center gap-3 text-tile-foreground">
                    <tile.icon className="h-8 w-8 text-tile-accent" strokeWidth={1.25} />
                    <span className="text-[9px] uppercase tracking-wide-lg opacity-70">
                      {tile.label}
                    </span>
                  </div>
                }
                overlay={
                  <span className="absolute left-3 top-2 text-sm italic text-tile-accent">
                    {tile.numeral}.
                  </span>
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
