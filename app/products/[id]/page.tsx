import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { findAll, findOne } from '@/modules/products/actions/actions';
import DetailCard from '@/modules/products/components/detail-card';

import { NEXT_PUBLIC_BASE_URL } from '@/constants';

interface Props {
  params: Promise<{ id: string }>;
}

/** Route ids arrive as strings; non-numeric values never reach the database. */
const parseProductId = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
};

export async function generateStaticParams() {
  try {
    const products = await findAll();

    return products.map(({ id }) => ({ id: String(id) }));
  } catch {
    // Preview/CI builds run against a mock DB_URL: skip static generation
    // and render product pages on demand instead.
    console.warn('[products/[id]] generateStaticParams: database unavailable, skipping');
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const metadataBase = new URL(NEXT_PUBLIC_BASE_URL);
  try {
    const { id } = await params;
    const productId = parseProductId(id);
    const product = productId === null ? null : await findOne(productId);

    if (!product) {
      return {
        title: 'Not found',
        description: 'The product you are looking for does not exist.',
        metadataBase,
      };
    }

    return {
      title: product.name,
      description: product.description,
      metadataBase,
    };
  } catch {
    return { title: 'FastFood', metadataBase };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('ProductDetail');

  const productId = parseProductId(id);
  if (productId === null) notFound();

  const product = await findOne(productId);
  if (!product) notFound();

  return (
    <section className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
      >
        <Link
          href="/products"
          aria-label={t('backToMenu')}
        >
          <ChevronLeft />
          {t('backToMenu')}
        </Link>
      </Button>
      <DetailCard product={product} />
    </section>
  );
}
