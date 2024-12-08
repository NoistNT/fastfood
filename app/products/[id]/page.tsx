import { BASE_URL } from '@/constants';
import { findAll, findOne } from '@/modules/products/actions/actions';
import DetailCard from '@/modules/products/components/detail-card';

interface Props {
  params: { id: number };
}

export async function generateMetadata({ params }: Props) {
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

export async function generateStaticParams() {
  const products = await findAll();

  return products.map(({ id }) => ({ id: String(id) }));
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await findOne(id);

  if (!product) return <p>Product not found</p>;

  return <DetailCard product={product} />;
}
