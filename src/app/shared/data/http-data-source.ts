import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EcommerceDataSource } from './data-source';
import { Product, Category, Review } from './models';
import { ProductQuery, PagedResult, CatalogFacets, computeFacets } from './query';
import {
  ProductSchemaMapping,
  CategorySchemaMapping,
  mapProduct,
  mapCategory,
  mapReview,
  resolveField,
} from './schema-mapping';

/**
 * Configuration for wiring the template to a real REST backend without
 * touching any component. Provide `HTTP_DATA_SOURCE_CONFIG` and switch the
 * `DATA_SOURCE` provider to `HttpDataSource` in `app.config.ts`.
 */
export interface HttpDataSourceConfig {
  baseUrl: string;
  endpoints?: {
    products?: string;
    product?: (id: string) => string;
    categories?: string;
    reviews?: (productId: string) => string;
  };
  /** Map the backend's query params to the ones your API expects. */
  queryParams?: {
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  productMapping?: ProductSchemaMapping;
  categoryMapping?: CategorySchemaMapping;
  /** Extra headers, if the API needs an API key etc. */
  headers?: Record<string, string>;
}

export const HTTP_DATA_SOURCE_CONFIG = new InjectionToken<HttpDataSourceConfig>(
  'HTTP_DATA_SOURCE_CONFIG',
);

@Injectable({ providedIn: 'root' })
export class HttpDataSource implements EcommerceDataSource {
  private readonly http = inject(HttpClient);
  private readonly config = inject(HTTP_DATA_SOURCE_CONFIG);

  private get pm() {
    return this.config.queryParams ?? {};
  }

  private url(path: string): string {
    return `${this.config.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private get httpOptions() {
    return this.config.headers ? { headers: this.config.headers } : {};
  }

  getProducts(query: ProductQuery): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    if (query.search) params = params.set(this.pm.search ?? 'q', query.search);
    if (query.categoryIds?.length)
      params = params.set(this.pm.category ?? 'category', query.categoryIds.join(','));
    if (query.sort) params = params.set(this.pm.sort ?? 'sort', query.sort);
    if (query.page) params = params.set(this.pm.page ?? 'page', String(query.page));
    if (query.pageSize) params = params.set(this.pm.pageSize ?? 'pageSize', String(query.pageSize));
    if (query.minPrice != null) params = params.set(this.pm.minPrice ?? 'minPrice', String(query.minPrice));
    if (query.maxPrice != null) params = params.set(this.pm.maxPrice ?? 'maxPrice', String(query.maxPrice));

    const endpoint = this.config.endpoints?.products ?? 'products';
    return this.http
      .get<unknown>(this.url(endpoint), { ...this.httpOptions, params })
      .pipe(map((res) => this.toPagedResult(res, query)));
  }

  getProductById(id: string): Observable<Product | undefined> {
    const endpoint = this.config.endpoints?.product?.(id) ?? `products/${id}`;
    return this.http
      .get<Record<string, unknown>>(this.url(endpoint), this.httpOptions)
      .pipe(map((raw) => (raw ? mapProduct(raw, this.config.productMapping) : undefined)));
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.getProducts({ search: slug, pageSize: 50 }).pipe(
      map((res) => res.items.find((p) => p.slug === slug) ?? res.items[0]),
    );
  }

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    return this.getProducts({ pageSize: limit }).pipe(map((res) => res.items));
  }

  getRelatedProducts(productId: string, limit = 4): Observable<Product[]> {
    return this.getProductById(productId).pipe(
      switchMap((product) => {
        if (!product) return of<Product[]>([]);
        return this.getProducts({
          categoryIds: [product.categoryId],
          pageSize: limit + 1,
        }).pipe(
          map((res) => res.items.filter((p) => p.id !== productId).slice(0, limit)),
        );
      }),
    );
  }

  getCategories(): Observable<Category[]> {
    const endpoint = this.config.endpoints?.categories ?? 'categories';
    return this.http.get<unknown>(this.url(endpoint), this.httpOptions).pipe(
      map((res) => {
        const root = resolveField(
          res as Record<string, unknown>,
          this.config.categoryMapping?.listRoot,
        );
        const list = (Array.isArray(root) ? root : Array.isArray(res) ? res : []) as Record<
          string,
          unknown
        >[];
        return list.map((c) => mapCategory(c, this.config.categoryMapping));
      }),
    );
  }

  getFacets(query: ProductQuery): Observable<CatalogFacets> {
    // Most REST backends don't expose a dedicated facet endpoint. Derive facets
    // from a scoped product page (category/search only, so users can widen a
    // selection) instead of silently degrading the sidebar filters. Override
    // this method to hit a real facet endpoint when your API provides one.
    return this.getProducts({
      search: query.search,
      categoryIds: query.categoryIds,
      pageSize: 200,
    }).pipe(map((res) => computeFacets(res.items)));
  }

  getReviews(productId: string): Observable<Review[]> {
    const endpoint = this.config.endpoints?.reviews?.(productId);
    if (!endpoint) return of([]);
    return this.http.get<unknown>(this.url(endpoint), this.httpOptions).pipe(
      map((res) => {
        const list = (Array.isArray(res) ? res : []) as Record<string, unknown>[];
        return list.map(mapReview);
      }),
    );
  }

  private toPagedResult(res: unknown, query: ProductQuery): PagedResult<Product> {
    const mapping = this.config.productMapping;
    const rootField = mapping?.listRoot;
    const root = resolveField(res as Record<string, unknown>, rootField);
    const list = (Array.isArray(root) ? root : Array.isArray(res) ? res : []) as Record<
      string,
      unknown
    >[];
    const items = list.map((p) => mapProduct(p, mapping));
    const totalRaw = resolveField(res as Record<string, unknown>, mapping?.totalCount);
    const total = typeof totalRaw === 'number' ? totalRaw : items.length;
    return {
      items,
      total,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? items.length,
    };
  }
}
