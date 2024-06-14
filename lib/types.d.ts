export interface Burger {
  id: number
  name: string
  description: string
  ingredients?: string[]
  imgAlt: string
  imgSrc: string
  isVegetarian: boolean
  isVegan: boolean
  price: number
}
