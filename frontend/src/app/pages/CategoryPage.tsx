import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Tag } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { useCategory } from '@/app/queries/categories';
import { useProducts } from '@/app/queries/products';
import ProductCard from '@/app/components/ProductCard';
import CardSkeleton from '@/app/components/CardSkeleton';
import StatusMessage from '@/app/components/StatusMessage';
import PageFrame from '@/app/components/PageFrame';
import Loader from '@/app/components/Loader';
import ImageTile from '@/app/components/ImageTile';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';

export default function CategoryPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();

  const categoryQuery = useCategory(slug, i18n.language);
  const category = categoryQuery.data ?? null;
  const categoryError = categoryQuery.isError ? getErrorMessage(categoryQuery.error) : '';

  const productsQuery = useProducts({ lang: i18n.language, category: slug });
  const products = productsQuery.data ?? [];
  const productsLoading = productsQuery.isPending;
  const productsError = productsQuery.isError ? getErrorMessage(productsQuery.error) : '';

  if (categoryQuery.isPending) {
    return (
      <PageFrame>
        <Loader label="Loading category..." />
      </PageFrame>
    );
  }

  if (categoryError || !category) {
    return (
      <PageFrame>
        <StatusMessage tone="error">{categoryError || 'Category not found'}</StatusMessage>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <ol className="flex flex-wrap items-center gap-2 opacity-75">
          <li>
            <Link to="/" className="transition hover:text-ember hover:opacity-100">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="opacity-80">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Compact on purpose: a small framed print of the cover image (the
          same 4:5 photo as the homepage tile, so nothing is cropped) beside
          the title, short enough that the first row of products is visible
          without scrolling. */}
      <Reveal>
        <header className="mb-8 flex items-start gap-5 border-b border-border/60 pb-6 sm:items-center sm:gap-8">
          <div className="w-24 shrink-0 -rotate-1 rounded-sm border border-border/70 bg-card p-1.5 shadow-[0_1px_2px_rgba(46,26,8,0.08),0_8px_22px_rgba(46,26,8,0.12)] sm:w-36 sm:p-2 lg:w-44">
            <ImageTile
              className="aspect-[4/5]"
              src={category.coverImage.url}
              placeholder={<Tag className="h-8 w-8 text-tile-accent" strokeWidth={1.25} />}
            />
          </div>
          <div className="min-w-0">
            <Eyebrow uppercase tracking="widest" className="mb-2 sm:mb-3">
              {category.tagline || 'Category'}
            </Eyebrow>
            <h1 className="mb-2 text-2xl tracking-snug sm:mb-3 sm:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="max-w-3xl text-sm italic leading-6 opacity-75 sm:text-base sm:leading-7">
                {category.description}
              </p>
            )}
            {!productsLoading && !productsError && products.length > 0 && (
              <p className="mt-2 text-sm opacity-60 sm:mt-3">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </header>
      </Reveal>

      {productsError && <StatusMessage tone="error">{productsError}</StatusMessage>}
      {!productsLoading && !productsError && products.length === 0 && (
        <StatusMessage>No products in this category yet — check back soon.</StatusMessage>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
        {productsLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} aspect="aspect-[4/5]" />
            ))
          : products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </PageFrame>
  );
}
