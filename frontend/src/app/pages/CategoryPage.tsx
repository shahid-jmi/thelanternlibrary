import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Tag } from 'lucide-react';
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
import Divider from '@/app/components/Divider';
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
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <section className="mb-12 grid gap-10 lg:grid-cols-[45fr_55fr] lg:items-center">
        <Reveal>
          <ImageTile
            className="aspect-[4/5]"
            src={category.coverImage.url}
            alt={category.name}
            placeholder={<Tag className="h-10 w-10 text-tile-accent" strokeWidth={1.25} />}
          />
        </Reveal>
        <Reveal delay={100}>
          <div>
            <Eyebrow className="mb-3">
              <Tag className="mr-1.5 inline h-3.5 w-3.5" />
              Category
            </Eyebrow>
            <h1 className="mb-4 text-4xl tracking-snug sm:text-5xl">{category.name}</h1>
            {category.description && (
              <p className="max-w-2xl text-base leading-8 opacity-85">{category.description}</p>
            )}
          </div>
        </Reveal>
      </section>

      <Divider />

      {productsError && <StatusMessage tone="error">{productsError}</StatusMessage>}
      {!productsLoading && !productsError && products.length === 0 && (
        <StatusMessage>No products in this category yet — check back soon.</StatusMessage>
      )}

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {productsLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} aspect="aspect-[4/5]" />
            ))
          : products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </PageFrame>
  );
}
