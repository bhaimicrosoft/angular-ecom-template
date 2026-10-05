/**
 * Normalized domain models used across the whole template.
 *
 * The UI only ever talks to these shapes. Any backend schema is translated
 * into these models by a `DataSource` implementation (see `data-source.ts`
 * and `schema-mapping.ts`), so screens never need to change when the API
 * changes — you only adjust the mapping in one place.
 */

export interface Money {
  /** Amount in the currency's major unit (e.g. 19.99). */
  amount: number;
  /** ISO 4217 currency code, e.g. 'USD'. */
  currency: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductVariantOption {
  /** e.g. 'Color', 'Size'. */
  name: string;
  /** e.g. 'Black', 'M'. */
  value: string;
  /** Optional swatch hex for color options. */
  swatch?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  options: ProductVariantOption[];
  image?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand?: string;
  categoryId: string;
  categoryName?: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  thumbnail: string;
  rating: ProductRating;
  stock: number;
  featured?: boolean;
  createdAt?: string;
  variants: ProductVariant[];
  /** Arbitrary extra attributes preserved from the source payload. */
  attributes?: Record<string, unknown>;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  parentId?: string | null;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date: string;
}

/** A product plus its chosen variant and quantity inside the cart. */
export interface CartLine {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
