import { findAll } from '@/modules/products/actions/actions';

export async function generateStaticParams() {
  const products = await findAll();

  return products.map(({ id }) => ({ id: String(id) }));
}
