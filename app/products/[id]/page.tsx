import { burgerApi } from '@/db/queries'
import DetailCard from '@/modules/products/components/detail-card'

interface Props {
  params: { id: number }
}

export default async function Page({ params }: Props) {
  const { id } = params

  const burger = await burgerApi.findOne(id)

  if (!burger) return null

  const {
    name,
    description,
    ingredients,
    imgAlt,
    imgSrc,
    isVegan,
    isVegetarian,
    price
  } = burger

  return (
    <DetailCard
      description={description}
      id={id}
      imgAlt={imgAlt}
      imgSrc={imgSrc}
      ingredients={ingredients.map((ingredient) => ingredient.name)}
      isVegan={isVegan}
      isVegetarian={isVegetarian}
      name={name}
      price={price}
    />
  )
}
