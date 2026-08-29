import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { AVATAR_COLORS, TESTIMONIALS } from './data';

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">v.</Eyebrow>
        <h2 className="mb-12 text-center text-3xl tracking-tight">From Our Readers</h2>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 80}>
            <figure className="relative h-full rounded-sm border border-border bg-card p-8">
              <span className="absolute right-4 top-3 text-sm italic text-accent">
                {testimonial.numeral}.
              </span>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm ${AVATAR_COLORS[testimonial.color]}`}
                >
                  {testimonial.name[0]}
                </span>
                <div>
                  <p className="text-sm">{testimonial.name}</p>
                  <p className="text-xs italic opacity-60">{testimonial.city}</p>
                </div>
              </div>
              <span aria-hidden="true" className="block text-5xl leading-none text-accent/60">
                “
              </span>
              <blockquote className="mt-1 italic leading-8 opacity-85">
                {testimonial.quote}
              </blockquote>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
