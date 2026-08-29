import ImageTile from '@/app/components/ImageTile';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { OFFERINGS } from './data';

export default function OfferSection() {
  return (
    <section id="offer" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">ii.</Eyebrow>
        <h2 className="mb-4 text-center text-3xl tracking-tight">What We Offer</h2>
        <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
          Books first — and the quiet objects that belong beside them.
        </p>
      </Reveal>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {OFFERINGS.map((item, index) => (
          <Reveal key={item.name} delay={(index % 4) * 70}>
            <ImageTile
              className="aspect-[4/5]"
              src={item.image}
              alt={item.name}
              placeholder={<item.icon className="h-10 w-10 text-tile-accent" strokeWidth={1.25} />}
              overlay={
                <span className="absolute left-3 top-2 text-sm italic text-tile-accent">
                  {item.numeral}.
                </span>
              }
            />
            <h3 className="mt-4 text-lg leading-snug">{item.name}</h3>
            <p className="mt-1 text-sm italic leading-6 opacity-65">{item.line}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
