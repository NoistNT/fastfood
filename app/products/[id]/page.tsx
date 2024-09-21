import { findOne } from '@/modules/products/actions/actions'
import DetailCard from '@/modules/products/components/detail-card'

interface Props {
  params: { id: number }
}

export default async function Page({ params }: Props) {
  const { id } = params

  const product = await findOne(id)

  if (!product) return null

  const {
    name,
    description,
    ingredients,
    imgAlt,
    imgSrc,
    isVegan,
    isVegetarian,
    price
  } = product

  return (
    <DetailCard
      isAvailable
      description={description}
      id={id}
      imgAlt={imgAlt}
      imgSrc={imgSrc}
      ingredients={ingredients}
      isVegan={isVegan}
      isVegetarian={isVegetarian}
      name={name}
      price={price}
    />
  )
}
