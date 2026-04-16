export interface ProductOption {
  name: string
  values: string[]
}

export interface Product {
  _id: string
  title: string
  slug: string
  price: number
  compareAtPrice?: number
  images: string[]
  materials: string[]
  options: ProductOption[]
  isNew: boolean
  isFeatured: boolean
  inStock: boolean
  sku: string
}
