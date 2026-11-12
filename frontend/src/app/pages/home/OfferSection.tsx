import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Tag } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { useCategories } from '@/app/queries/categories';
import ImageTile from '@/app/components/ImageTile';
import StatusMessage from '@/app/components/StatusMessage';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';

// Widths account for the gaps below: 1 gap at 2 columns (1rem), 2 at 3
// columns (2 × 2rem), 3 at 4 columns (3 × 2.5rem).
const TILE_WIDTH =
  'w-[calc((100%-1rem)/2)] sm:w-[calc((100%-4rem)/3)] lg:w-[calc((100%-7.5rem)/4)]';

export default function OfferSection() {
  const { i18n } = useTranslation();
  const categoriesQuery = useCategories(i18n.language);

  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isPending;
  const error = categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '';

  return (
    <section id="offer" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">i.</Eyebrow>
        <h2 className="mb-4 text-center text-3xl tracking-tight">What We Offer</h2>
        <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
          Books first — and the quiet objects that belong beside them.
        </p>
      </Reveal>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {!loading && !error && categories.length === 0 && (
        <StatusMessage>More categories are on the way — check back soon.</StatusMessage>
      )}
      {/* Flex-wrap (not grid) so a part-filled last row sits centred under
          the heading. Each photo sits on a cream mat like a framed print: the
          photos are dark and detailed, and the mat plus wide gutters keep
          neighbouring tiles from blurring into one block. */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:gap-x-10">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={TILE_WIDTH}>
                <div className="shimmer aspect-[4/5] rounded-sm" />
              </div>
            ))
          : categories.map((category, index) => (
              <Reveal key={category._id} delay={(index % 4) * 70} className={TILE_WIDTH}>
                <Link to={`/category/${category.slug}`} className="group block text-center">
                  <div className="rounded-sm border border-border/70 bg-card p-1.5 shadow-[0_1px_2px_rgba(46,26,8,0.06),0_6px_18px_rgba(46,26,8,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgba(46,26,8,0.08),0_12px_28px_rgba(46,26,8,0.14)] sm:p-2">
                    <ImageTile
                      className="aspect-[4/5]"
                      src={category.coverImage.url}
                      alt={category.name}
                      placeholder={
                        <Tag className="h-10 w-10 text-tile-accent" strokeWidth={1.25} />
                      }
                    />
                  </div>
                  <h3 className="mt-4 text-base leading-snug transition group-hover:text-ember sm:text-lg">
                    {category.name}
                  </h3>
                  {category.tagline && (
                    <p className="mt-1 text-sm italic leading-6 opacity-65">{category.tagline}</p>
                  )}
                </Link>
              </Reveal>
            ))}
      </div>
    </section>
  );
}
