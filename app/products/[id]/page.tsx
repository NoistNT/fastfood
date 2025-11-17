import { findOne } from '@/modules/products/actions/actions';
import DetailCard from '@/modules/products/components/detail-card';

interface Props {
  params: Promise<{ id: number }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await findOne(id);

  if (!product) return <p>Product not found</p>;

  return <DetailCard product={product} />;
}
