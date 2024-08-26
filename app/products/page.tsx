import { burgerApi } from '@/db/queries'
import Card from '@/modules/products/components/card'

export default async function Home() {
  const burgers = await burgerApi.findAll()

  return (
    <main className="flex">
      <ul className="container grid gap-4 xl:grid-cols-2 xl:gap-8">
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
