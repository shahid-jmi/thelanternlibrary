import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Tag } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { useCategories } from '@/app/queries/categories';
import ImageTile from '@/app/components/ImageTile';
import StatusMessage from '@/app/components/StatusMessage';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';

export default function OfferSection() {
  const { i18n } = useTranslation();
  const categoriesQuery = useCategories(i18n.language);

  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isPending;
  const error = categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '';

  return (
    <section id="offer" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3 text-center">ii.</Eyebrow>
        <h2 className="mb-4 text-center text-3xl tracking-tight">What We Offer</h2>
        <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
          Books first — and the quiet objects that belong beside them.
        </p>
      </Reveal>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {!loading && !error && categories.length === 0 && (
        <StatusMessage>More categories are on the way — check back soon.</StatusMessage>
      )}
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="shimmer aspect-[4/5] rounded-sm" />
            ))
          : categories.map((category, index) => (
              <Reveal key={category._id} delay={(index % 4) * 70}>
                <Link to={`/category/${category.slug}`} className="group block">
                  <ImageTile
                    className="aspect-[4/5]"
                    src={category.coverImage.url}
                    alt={category.name}
                    placeholder={<Tag className="h-10 w-10 text-tile-accent" strokeWidth={1.25} />}
                  />
                  <h3 className="mt-4 text-lg leading-snug transition group-hover:text-ember">
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
