import DetailCard from '@/components/burger/detail-card'
import { burgerApi } from '@/db/queries'

export default async function Page({ params }: { params: { id: number } }) {
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
