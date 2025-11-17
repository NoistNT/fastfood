import type { Metadata } from 'next';

import { findOne } from '@/modules/products/actions/actions';

import { BASE_URL } from '@/constants';

interface Props {
  params: Promise<{ id: number }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await findOne(id);

  if (!product) {
    return {
      title: 'Fast Food',
      description: 'The product you are looking for does not exist.',
      metadataBase: new URL(BASE_URL),
    };
  }

  return {
    title: `FastFood - ${product.name} `,
    description: product.description,
    metadataBase: new URL(BASE_URL),
  };
}
