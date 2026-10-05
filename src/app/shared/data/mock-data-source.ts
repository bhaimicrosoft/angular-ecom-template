import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EcommerceDataSource } from './data-source';
import { Product, Category, Review } from './models';
import { ProductQuery, PagedResult, CatalogFacets, SortKey, computeFacets } from './query';
import { MOCK_PRODUCTS } from './mock/products.mock';
import { MOCK_CATEGORIES } from './mock/categories.mock';

const LATENCY = 250;

const REVIEW_AUTHORS = ['Alex M.', 'Priya S.', 'Jordan L.', 'Sam T.', 'Noah K.', 'Emma R.'];
const REVIEW_BODIES = [
  'Exceeded my expectations. The build quality is fantastic and it feels premium.',
  'Great value for the price. Would definitely recommend to a friend.',
  'Solid product overall, though delivery took a little longer than expected.',
  'Absolutely love it — using it every single day since it arrived.',
  'Does exactly what it promises. Clean design and easy to set up.',
];

@Injectable({ providedIn: 'root' })
export class MockDataSource implements EcommerceDataSource {
  private readonly products = MOCK_PRODUCTS;
  private readonly categories = MOCK_CATEGORIES.map((c) => ({
    ...c,
    productCount: this.products.filter((p) => p.categoryId === c.id).length,
  }));

  getProducts(query: ProductQuery): Observable<PagedResult<Product>> {
    const filtered = this.applySort(this.applyFilters(query), query.sort);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return this.delayed({ items, total: filtered.length, page, pageSize });
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.delayed(this.products.find((p) => p.id === id));
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.delayed(this.products.find((p) => p.slug === slug));
  }

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    return this.delayed(this.products.filter((p) => p.featured).slice(0, limit));
  }

  getRelatedProducts(productId: string, limit = 4): Observable<Product[]> {
    const source = this.products.find((p) => p.id === productId);
    const related = this.products
      .filter((p) => p.id !== productId && p.categoryId === source?.categoryId)
      .slice(0, limit);
    return this.delayed(related);
  }

  getCategories(): Observable<Category[]> {
    return this.delayed(this.categories);
  }

  getFacets(query: ProductQuery): Observable<CatalogFacets> {
    // Facets reflect the current category/search scope but ignore price/brand
    // filters so users can widen a selection.
    const scoped = this.applyFilters({
      search: query.search,
      categoryIds: query.categoryIds,
    });
    return this.delayed(computeFacets(scoped));
  }

  getReviews(productId: string): Observable<Review[]> {
    const count = 3 + (productId.length % 3);
    const reviews: Review[] = Array.from({ length: count }, (_, i) => ({
      id: `${productId}-r${i}`,
      author: REVIEW_AUTHORS[(productId.length + i) % REVIEW_AUTHORS.length],
      rating: 4 + (i % 2),
      title: i === 0 ? 'Would buy again' : undefined,
      body: REVIEW_BODIES[(productId.length + i) % REVIEW_BODIES.length],
      date: new Date(Date.now() - i * 6 * 86_400_000).toISOString(),
    }));
    return this.delayed(reviews);
  }

  private delayed<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY));
  }

  private applyFilters(query: ProductQuery): Product[] {
    return this.products.filter((p) => {
      if (query.search) {
        const q = query.search.toLowerCase();
        const hay = `${p.title} ${p.brand} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
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
