import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, Category, Review } from './models';
import { ProductQuery, PagedResult, CatalogFacets } from './query';

/**
 * The single contract every screen depends on. Swap the implementation
 * (mock, REST, GraphQL, tRPC…) in one place — `app.config.ts` — and the whole
 * app follows. Nothing in the UI imports a concrete data source directly.
 */
export interface EcommerceDataSource {
  getProducts(query: ProductQuery): Observable<PagedResult<Product>>;
  getProductById(id: string): Observable<Product | undefined>;
  getProductBySlug(slug: string): Observable<Product | undefined>;
  getFeaturedProducts(limit?: number): Observable<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Observable<Product[]>;
  getCategories(): Observable<Category[]>;
  getFacets(query: ProductQuery): Observable<CatalogFacets>;
  getReviews(productId: string): Observable<Review[]>;
}

/**
 * DI token for the active data source. Provide a different implementation to
 * point the template at a real backend:
 *
 *   { provide: DATA_SOURCE, useClass: HttpDataSource }
 */
export const DATA_SOURCE = new InjectionToken<EcommerceDataSource>('ECOMMERCE_DATA_SOURCE');
