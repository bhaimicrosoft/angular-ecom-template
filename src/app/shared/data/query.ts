import { Product, Category, Review } from './models';

/** Sort options exposed by the catalogue UI. */
export type SortKey =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'
  | 'name-asc';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating-desc', label: 'Top rated' },
  { key: 'name-asc', label: 'Alphabetical' },
];

/** Everything the catalogue needs to request a filtered/sorted/paged page. */
export interface ProductQuery {
  search?: string;
  categoryIds?: string[];
  brands?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Aggregated values used to build filter controls in the sidebar. */
export interface CatalogFacets {
  brands: { value: string; count: number }[];
  tags: { value: string; count: number }[];
  priceRange: { min: number; max: number };
}

/**
 * Aggregate brand, tag and price-range facets from a list of products.
 * Shared by every data source so the sidebar filter logic lives in one place.
 */
export function computeFacets(products: Product[]): CatalogFacets {
  const brandCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
    for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  }
  return {
    brands: [...brandCounts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    tags: [...tagCounts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    priceRange: { min: Number.isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) || 1000 },
  };
}

export type { Product, Category, Review };
