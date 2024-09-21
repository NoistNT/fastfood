import { findAll } from '@/modules/products/actions/actions'
import Card from '@/modules/products/components/card'

export default async function Home() {
  const products = await findAll()

  return (
    <main className="flex">
      <ul className="container grid gap-4 xl:grid-cols-2 xl:gap-8">
        {products.map((product) => (
          <li key={product.id} className="mx-auto">
            <Card key={product.id} product={product} />
          </li>
        ))}
      </ul>
    </main>
  )
}
