import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { switchMap, startWith } from 'rxjs/operators';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSlidersHorizontal,
  lucideX,
  lucideChevronDown,
  lucideLayoutGrid,
  lucideList,
  lucideSearch,
  lucideStar,
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucidePackageOpen,
} from '@ng-icons/lucide';
import { DATA_SOURCE } from '../../shared/data/data-source';
import { ProductQuery, SortKey, SORT_OPTIONS } from '../../shared/data/query';
import { ProductCard } from '../../shared/components/product-card';
import { ProductCardSkeleton } from '../../shared/components/product-card-skeleton';
import { HlmButton } from '../../shared/ui/button';
import { HlmBadge } from '../../shared/ui/badge';
import { HlmInput } from '../../shared/ui/input';
import { PricePipe } from '../../shared/ui/price.pipe';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    NgTemplateOutlet,
    NgIcon,
    ProductCard,
    ProductCardSkeleton,
    HlmButton,
    HlmBadge,
    HlmInput,
    PricePipe,
  ],
  providers: [
    provideIcons({
      lucideSlidersHorizontal,
      lucideX,
      lucideChevronDown,
      lucideLayoutGrid,
      lucideList,
      lucideSearch,
      lucideStar,
      lucideCheck,
      lucideChevronLeft,
      lucideChevronRight,
      lucidePackageOpen,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly data = inject(DATA_SOURCE);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly sortOptions = SORT_OPTIONS;

  // Filter state ----------------------------------------------------------
  readonly search = signal('');
  readonly categoryIds = signal<string[]>([]);
  readonly brands = signal<string[]>([]);
  readonly tags = signal<string[]>([]);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly minRating = signal<number>(0);
  readonly inStockOnly = signal(false);
  readonly onSaleOnly = signal(false);
  readonly sort = signal<SortKey>('relevance');
  readonly page = signal(1);
  readonly pageSize = 12;

  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly filtersOpen = signal(false);

  readonly allCategories = toSignal(this.data.getCategories(), { initialValue: [] });

  // Query + data ----------------------------------------------------------
  readonly query = computed<ProductQuery>(() => ({
    search: this.search() || undefined,
    categoryIds: this.categoryIds().length ? this.categoryIds() : undefined,
    brands: this.brands().length ? this.brands() : undefined,
    tags: this.tags().length ? this.tags() : undefined,
    minPrice: this.minPrice() ?? undefined,
    maxPrice: this.maxPrice() ?? undefined,
    minRating: this.minRating() || undefined,
    inStockOnly: this.inStockOnly() || undefined,
    onSaleOnly: this.onSaleOnly() || undefined,
    sort: this.sort(),
    page: this.page(),
    pageSize: this.pageSize,
  }));

  private readonly result = toSignal(
    toObservable(this.query).pipe(switchMap((q) => this.data.getProducts(q))),
    { initialValue: null },
  );

  readonly facets = toSignal(
    toObservable(computed(() => ({ search: this.search(), categoryIds: this.categoryIds() }))).pipe(
      switchMap((q) => this.data.getFacets(q as ProductQuery)),
    ),
    { initialValue: null },
  );

  readonly products = computed(() => this.result()?.items ?? []);
  readonly total = computed(() => this.result()?.total ?? 0);
  readonly loading = computed(() => this.result() === null);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly activeFilterCount = computed(
    () =>
      this.brands().length +
      this.tags().length +
      this.categoryIds().length +
      (this.minPrice() != null || this.maxPrice() != null ? 1 : 0) +
      (this.minRating() ? 1 : 0) +
      (this.inStockOnly() ? 1 : 0) +
      (this.onSaleOnly() ? 1 : 0),
  );

  readonly heading = computed(() => {
    const ids = this.categoryIds();
    if (ids.length === 1) {
      return this.allCategories().find((c) => c.id === ids[0])?.name ?? 'Shop';
    }
    return this.search() ? `Results for "${this.search()}"` : 'Shop all';
  });

  constructor() {
    // Sync incoming route + query params into filter state.
    this.route.paramMap.pipe(startWith(null)).subscribe(() => {
      const catId = this.route.snapshot.paramMap.get('categoryId');
      this.categoryIds.set(catId ? [catId] : []);
    });
    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('search') ?? '');

      const sort = params.get('sort') as SortKey | null;
      const validSort = SORT_OPTIONS.some((o) => o.key === sort);
      this.sort.set(validSort ? (sort as SortKey) : 'relevance');

      this.onSaleOnly.set(params.get('onSale') === 'true');
    });

    // Reset to first page whenever filters (not the page itself) change.
    effect(() => {
      this.search();
      this.categoryIds();
      this.brands();
      this.tags();
      this.minPrice();
      this.maxPrice();
      this.minRating();
      this.inStockOnly();
      this.onSaleOnly();
      this.sort();
      this.page.set(1);
    });
  }

  toggleIn(list: ReturnType<typeof signal<string[]>>, value: string): void {
    list.update((arr) =>
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  }

  setRating(value: number): void {
    this.minRating.update((cur) => (cur === value ? 0 : value));
  }

  clearAll(): void {
    this.brands.set([]);
    this.tags.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(0);
    this.inStockOnly.set(false);
    this.onSaleOnly.set(false);
    if (!this.route.snapshot.paramMap.get('categoryId')) this.categoryIds.set([]);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
