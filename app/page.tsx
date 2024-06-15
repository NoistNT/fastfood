import Card from '@/components/burger/card'
import { findAllBurgers, findAllIngredients } from '@/db/queries'

export default async function Home() {
  const [burgers, ingredients] = await Promise.all([
    findAllBurgers(),
    findAllIngredients()
  ])

  return (
    <main className="flex min-h-screen">
      <ul className="container grid max-w-6xl gap-4 md:grid-cols-2">
        {burgers.map(
          ({
            id,
            description,
            imgAlt,
            imgSrc,
            isVegan,
            isVegetarian,
            name,
            price
          }) => (
            <li key={id} className="mx-auto">
              <Card
                key={id}
                description={description}
                id={id}
                imgAlt={imgAlt}
                imgSrc={imgSrc}
                isVegan={isVegan}
                isVegetarian={isVegetarian}
                name={name}
                price={price}
              />
            </li>
          )
        )}
      </ul>
    </main>
  )
}
