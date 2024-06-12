import Image from 'next/image'

interface Props {
  name: string
  description: string
  imgAlt: string
  imgSrc: string
  isVegetarian: boolean
  isVegan: boolean
  price: number
}

export default function Card({
  name,
  description,
  imgAlt,
  imgSrc,
  isVegetarian,
  isVegan,
  price
}: Props) {
  return (
    <article className="max-w-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700">
      <Image
        alt={imgAlt}
        className="rounded-b-sm rounded-t-3xl"
        height={480}
        src={imgSrc}
        width={480}
      />
      <div className="h-1 w-full bg-neutral-300 dark:bg-neutral-800" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="mt-0.5 text-xl font-semibold text-neutral-600 dark:text-neutral-300 lg:mr-3">
            {' '}
            ${price}
          </p>
        </div>
        <p className="px-1 text-neutral-500/85 dark:text-neutral-400/85">
          {description}
        </p>
        <div className="mb-4 mt-10 h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex justify-around py-0.5">
          <div className="flex gap-2 font-semibold text-neutral-400">
            <p>Vegetarian: </p>
            <p>
              {!isVegetarian ? (
                <span className="text-green-500">Yes</span>
              ) : (
                <span className="text-red-400">No</span>
              )}
            </p>
          </div>
          <div className="flex gap-2 font-semibold text-neutral-400">
            <p>Vegan:</p>
            <p>
              {isVegan ? (
                <span className="text-green-500">Yes</span>
              ) : (
                <span className="text-red-400">No</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
