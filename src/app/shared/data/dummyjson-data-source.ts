import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { EcommerceDataSource } from './data-source';
import { Product, Category, Review } from './models';
import { ProductQuery, PagedResult, CatalogFacets, SortKey, computeFacets } from './query';
import { ProductSchemaMapping, mapProduct } from './schema-mapping';

/**
 * ============================================================================
 *  Real backend example — DummyJSON (https://dummyjson.com)
 * ============================================================================
 *  A concrete "Option B" data source (see INSTRUCTIONS.md §3) that serves the
 *  storefront from a real REST API returning real products with real images.
 *
 *  DummyJSON has a small, fixed catalogue (~194 items) and a few conventions
 *  the generic `HttpDataSource` can't express (skip-based pagination, a separate
 *  `/search` endpoint, path-based `/category/{slug}` filtering, and no product
 *  slugs). Rather than fight those quirks per request, we fetch the full
 *  catalogue once, normalize it into the app's `Product` model, and serve every
 *  screen — filters, sort, pagination, facets, slug lookups, related items and
 *  reviews — locally from that cached real data. The result behaves exactly
 *  like the mock source, but with genuine products and imagery.
 *
 *  To point at your own catalogue, change `BASE_URL` or implement
 *  `EcommerceDataSource` directly for your API.
 */
const BASE_URL = 'https://dummyjson.com';

const prettify = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** Map a raw DummyJSON product onto the normalized `Product` model. */
const PRODUCT_MAPPING: ProductSchemaMapping = {
  id: 'id',
  title: 'title',
  description: 'description',
  brand: 'brand',
  categoryId: 'category',
  categoryName: (raw) => prettify(String(raw['category'] ?? '')),
  tags: 'tags',
  price: 'price',
  // DummyJSON exposes a discount percentage rather than the pre-sale price.
  // Reconstruct the original ("compare at") price so on-sale badges and
  // strike-through pricing work across the UI.
  compareAtPrice: (raw) => {
    const price = Number(raw['price']) || 0;
    const discount = Number(raw['discountPercentage']) || 0;
    if (discount <= 0 || price <= 0) return undefined;
    return Math.round((price / (1 - discount / 100)) * 100) / 100;
  },
  images: 'images',
  thumbnail: 'thumbnail',
  ratingAverage: 'rating',
  ratingCount: (raw) => (Array.isArray(raw['reviews']) ? raw['reviews'].length : 0),
  stock: 'stock',
  // No "featured" flag upstream — surface the best-rated items on the home page.
  featured: (raw) => (Number(raw['rating']) || 0) >= 4.5,
  createdAt: 'meta.createdAt',
};

interface RawCategory {
  slug: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DummyJsonDataSource implements EcommerceDataSource {
  private readonly http = inject(HttpClient);

  /** The full catalogue, fetched once and shared across every screen. */
  private readonly products$: Observable<Product[]> = this.http
    .get<{ products: Record<string, unknown>[] }>(`${BASE_URL}/products?limit=0`)
    .pipe(
      map((res) => (res.products ?? []).map((p) => mapProduct(p, PRODUCT_MAPPING))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  private readonly categories$: Observable<Category[]> = combineLatest([
    this.http.get<RawCategory[]>(`${BASE_URL}/products/categories`),
    this.products$,
  ]).pipe(
    map(([raw, products]) =>
      raw.map((c) => {
        const inCategory = products.filter((p) => p.categoryId === c.slug);
        return {
          id: c.slug,
          slug: c.slug,
          name: c.name,
          productCount: inCategory.length,
          // Represent each category with a real product image from the API.
          image: inCategory[0]?.thumbnail ?? inCategory[0]?.images[0]?.url,
        };
      }),
    ),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getProducts(query: ProductQuery): Observable<PagedResult<Product>> {
    return this.products$.pipe(
      map((all) => {
        const filtered = this.applySort(this.applyFilters(all, query), query.sort);
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 12;
        const start = (page - 1) * pageSize;
        return {
          items: filtered.slice(start, start + pageSize),
          total: filtered.length,
          page,
          pageSize,
        };
      }),
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(map((all) => all.find((p) => p.id === id)));
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.products$.pipe(map((all) => all.find((p) => p.slug === slug)));
  }

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    return this.products$.pipe(
      map((all) =>
        [...all]
          .sort((a, b) => b.rating.average - a.rating.average)
          .slice(0, limit),
      ),
    );
  }

  getRelatedProducts(productId: string, limit = 4): Observable<Product[]> {
    return this.products$.pipe(
      map((all) => {
        const source = all.find((p) => p.id === productId);
        return all
          .filter((p) => p.id !== productId && p.categoryId === source?.categoryId)
          .slice(0, limit);
      }),
    );
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getFacets(query: ProductQuery): Observable<CatalogFacets> {
    return this.products$.pipe(
      map((all) => {
        // Scope facets to the current search/category so users can widen a
        // selection without price/brand filters collapsing the options.
        const scoped = this.applyFilters(all, {
          search: query.search,
          categoryIds: query.categoryIds,
        });
        return computeFacets(scoped);
      }),
    );
  }

  getReviews(productId: string): Observable<Review[]> {
    return this.products$.pipe(
      map((all) => {
        const product = all.find((p) => p.id === productId);
        const raw = (product?.attributes?.['reviews'] ?? []) as Record<string, unknown>[];
        if (!Array.isArray(raw)) return [];
        return raw.map((r, i) => ({
          id: `${productId}-r${i}`,
          author: String(r['reviewerName'] ?? 'Anonymous'),
          rating: Number(r['rating']) || 0,
          body: String(r['comment'] ?? ''),
          date: String(r['date'] ?? new Date().toISOString()),
        }));
      }),
    );
  }

  private applyFilters(products: Product[], query: ProductQuery): Product[] {
    return products.filter((p) => {
      if (query.search) {
        const q = query.search.toLowerCase();
        const hay = `${p.title} ${p.brand ?? ''} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (query.categoryIds?.length && !query.categoryIds.includes(p.categoryId)) return false;
      if (query.brands?.length && !(p.brand && query.brands.includes(p.brand))) return false;
      if (query.tags?.length && !query.tags.some((t) => p.tags.includes(t))) return false;
      if (query.minPrice != null && p.price < query.minPrice) return false;
      if (query.maxPrice != null && p.price > query.maxPrice) return false;
      if (query.minRating != null && p.rating.average < query.minRating) return false;
      if (query.inStockOnly && p.stock <= 0) return false;
      if (query.onSaleOnly && !p.compareAtPrice) return false;
      return true;
    });
  }

  private applySort(items: Product[], sort: SortKey = 'relevance'): Product[] {
    const copy = [...items];
    switch (sort) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return copy.sort((a, b) => b.rating.average - a.rating.average);
      case 'name-asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
        return copy.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
      default:
        return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }
}
