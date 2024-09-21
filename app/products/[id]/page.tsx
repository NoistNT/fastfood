import { findOne } from '@/modules/products/actions/actions'
import DetailCard from '@/modules/products/components/detail-card'

interface Props {
  params: { id: number }
}

export default async function Page({ params }: Props) {
  const { id } = params

  const product = await findOne(id)

  if (!product) return null

  return <DetailCard product={product} />
}
