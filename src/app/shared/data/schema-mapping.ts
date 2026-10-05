import { Product, Category, ProductVariant, Review } from './models';

/**
 * ============================================================================
 *  Bring-your-own-backend schema mapping
 * ============================================================================
 *  Real APIs never match your UI models exactly. Instead of rewriting screens,
 *  describe *where* each field lives in the API payload and this module maps
 *  arbitrary JSON into the normalized `Product` / `Category` models.
 *
 *  A field can be described three ways:
 *    - a string dot/bracket path:      'data.title'  |  'images[0].src'
 *    - an array of fallback paths:     ['title', 'name']  (first match wins)
 *    - a function:                     (raw) => raw.attributes.title
 *
 *  Example — pointing the template at DummyJSON:
 *
 *    const mapping: ProductSchemaMapping = {
 *      id: 'id',
 *      title: 'title',
 *      price: 'price',
 *      thumbnail: 'thumbnail',
 *      images: 'images',
 *      categoryId: 'category',
 *      rating: 'rating',
 *      stock: 'stock',
 *    };
 */

export type FieldPath<T = unknown> =
  | string
  | string[]
  | ((raw: Record<string, unknown>) => T);

export interface ProductSchemaMapping {
  id?: FieldPath;
  slug?: FieldPath;
  title?: FieldPath;
  description?: FieldPath;
  brand?: FieldPath;
  categoryId?: FieldPath;
  categoryName?: FieldPath;
  tags?: FieldPath;
  price?: FieldPath;
  compareAtPrice?: FieldPath;
  currency?: FieldPath;
  images?: FieldPath;
  thumbnail?: FieldPath;
  ratingAverage?: FieldPath;
  ratingCount?: FieldPath;
  stock?: FieldPath;
  featured?: FieldPath;
  createdAt?: FieldPath;
  variants?: FieldPath;
  /** Path to the array of items inside a list response, e.g. 'data.products'. */
  listRoot?: FieldPath;
  /** Path to the total count inside a list response, e.g. 'meta.total'. */
  totalCount?: FieldPath;
}

export interface CategorySchemaMapping {
  id?: FieldPath;
  slug?: FieldPath;
  name?: FieldPath;
  description?: FieldPath;
  image?: FieldPath;
  productCount?: FieldPath;
  parentId?: FieldPath;
  listRoot?: FieldPath;
}

/** Read a value from an object using a dot/bracket path like `a.b[0].c`. */
export function getPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  const segments = path
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  let current: unknown = obj;
  for (const seg of segments) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

/** Resolve a `FieldPath` against a raw payload. */
export function resolveField<T = unknown>(
  raw: Record<string, unknown>,
  field: FieldPath | undefined,
): T | undefined {
  if (field == null) return undefined;
  if (typeof field === 'function') return field(raw) as T;
  const paths = Array.isArray(field) ? field : [field];
  for (const p of paths) {
    const value = getPath(raw, p);
    if (value !== undefined && value !== null && value !== '') return value as T;
  }
  return undefined;
}

const slugify = (value: string): string =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const asString = (v: unknown, fallback = ''): string =>
  v == null ? fallback : String(v);
const asNumber = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};
const asArray = (v: unknown): unknown[] =>
  Array.isArray(v) ? v : v == null ? [] : [v];

function normalizeImages(v: unknown): { url: string; alt?: string }[] {
  return asArray(v)
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const url = (o['url'] ?? o['src'] ?? o['image'] ?? o['href']) as string;
        if (url) return { url, alt: o['alt'] as string | undefined };
      }
      return null;
    })
    .filter((x): x is { url: string; alt?: string } => !!x);
}

function normalizeVariants(v: unknown): ProductVariant[] {
  return asArray(v).map((item, i) => {
    const o = (item ?? {}) as Record<string, unknown>;
    return {
      id: asString(o['id'] ?? o['sku'] ?? i),
      title: asString(o['title'] ?? o['name'] ?? `Variant ${i + 1}`),
      price: asNumber(o['price']),
      compareAtPrice: o['compareAtPrice'] != null ? asNumber(o['compareAtPrice']) : undefined,
      available: o['available'] !== false && asNumber(o['stock'], 1) > 0,
      image: o['image'] as string | undefined,
      options: asArray(o['options']).map((op) => {
        const opo = (op ?? {}) as Record<string, unknown>;
        return {
          name: asString(opo['name']),
          value: asString(opo['value']),
          swatch: opo['swatch'] as string | undefined,
        };
      }),
    };
  });
}

/** Map one raw product payload into the normalized `Product` model. */
export function mapProduct(
  raw: Record<string, unknown>,
  mapping: ProductSchemaMapping = {},
): Product {
  const id = asString(resolveField(raw, mapping.id ?? ['id', '_id', 'sku']) ?? crypto.randomUUID());
  const title = asString(resolveField(raw, mapping.title ?? ['title', 'name']), 'Untitled');
  const images = normalizeImages(
    resolveField(raw, mapping.images ?? ['images', 'gallery', 'photos']),
  );
  const thumbnail =
    asString(resolveField(raw, mapping.thumbnail ?? ['thumbnail', 'image'])) ||
    images[0]?.url ||
    '';
  const price = asNumber(resolveField(raw, mapping.price ?? ['price', 'amount']));
  const tags = asArray(resolveField(raw, mapping.tags ?? ['tags', 'labels'])).map((t) =>
    asString(t),
  );

  return {
    id,
    slug: asString(resolveField(raw, mapping.slug) ?? slugify(title || id)),
    title,
    description: asString(resolveField(raw, mapping.description ?? ['description', 'body'])),
    brand: resolveField(raw, mapping.brand ?? ['brand', 'vendor']) as string | undefined,
    categoryId: asString(
      resolveField(raw, mapping.categoryId ?? ['categoryId', 'category', 'category_id']),
      'uncategorized',
    ),
    categoryName: resolveField(raw, mapping.categoryName ?? ['categoryName', 'category']) as
      | string
      | undefined,
    tags,
    price,
    compareAtPrice:
      resolveField(raw, mapping.compareAtPrice ?? ['compareAtPrice', 'listPrice', 'mrp']) != null
        ? asNumber(resolveField(raw, mapping.compareAtPrice ?? ['compareAtPrice', 'listPrice', 'mrp']))
        : undefined,
    currency: asString(resolveField(raw, mapping.currency ?? 'currency'), 'USD'),
    images: images.length ? images : thumbnail ? [{ url: thumbnail, alt: title }] : [],
    thumbnail,
    rating: {
      average: asNumber(
        resolveField(raw, mapping.ratingAverage ?? ['rating.average', 'rating', 'rating.rate']),
      ),
      count: asNumber(resolveField(raw, mapping.ratingCount ?? ['rating.count', 'reviewCount'])),
    },
    stock: asNumber(resolveField(raw, mapping.stock ?? ['stock', 'quantity', 'inventory']), 0),
    featured: !!resolveField(raw, mapping.featured ?? 'featured'),
    createdAt: resolveField(raw, mapping.createdAt ?? ['createdAt', 'created_at']) as
      | string
      | undefined,
    variants: normalizeVariants(resolveField(raw, mapping.variants ?? 'variants')),
    attributes: raw,
  };
}

/** Map one raw category payload into the normalized `Category` model. */
export function mapCategory(
  raw: Record<string, unknown>,
  mapping: CategorySchemaMapping = {},
): Category {
  const name = asString(resolveField(raw, mapping.name ?? ['name', 'title']), 'Category');
  const id = asString(resolveField(raw, mapping.id ?? ['id', '_id', 'slug']) ?? slugify(name));
  return {
    id,
    slug: asString(resolveField(raw, mapping.slug) ?? slugify(name)),
    name,
    description: resolveField(raw, mapping.description ?? 'description') as string | undefined,
    image: resolveField(raw, mapping.image ?? ['image', 'thumbnail']) as string | undefined,
    productCount: resolveField(raw, mapping.productCount ?? ['productCount', 'count']) as
      | number
      | undefined,
    parentId: (resolveField(raw, mapping.parentId ?? 'parentId') as string) ?? null,
  };
}

/** Map a raw review payload into the normalized `Review` model. */
export function mapReview(raw: Record<string, unknown>): Review {
  return {
    id: asString(resolveField(raw, ['id', '_id']) ?? crypto.randomUUID()),
    author: asString(resolveField(raw, ['author', 'name', 'user']), 'Anonymous'),
    rating: asNumber(resolveField(raw, ['rating', 'score']), 5),
    title: resolveField(raw, ['title', 'headline']) as string | undefined,
    body: asString(resolveField(raw, ['body', 'comment', 'text'])),
    date: asString(resolveField(raw, ['date', 'createdAt']), new Date().toISOString()),
  };
}
