import { describe, it, expect } from 'vitest';
import { computeFacets } from './query';
import { Product } from './models';

function product(partial: Partial<Product>): Product {
  return {
    id: '1',
    slug: 's',
    title: 'T',
    description: '',
    categoryId: 'c',
    tags: [],
    price: 0,
    currency: 'USD',
    images: [],
    thumbnail: '',
    rating: { average: 0, count: 0 },
    stock: 0,
    variants: [],
    ...partial,
  };
}

describe('computeFacets', () => {
  it('aggregates brand and tag counts and the price range', () => {
    const facets = computeFacets([
      product({ brand: 'Acme', tags: ['new', 'sale'], price: 10 }),
      product({ brand: 'Acme', tags: ['new'], price: 30 }),
      product({ brand: 'Globex', tags: ['sale'], price: 20 }),
    ]);

    expect(facets.brands).toEqual([
      { value: 'Acme', count: 2 },
      { value: 'Globex', count: 1 },
    ]);
    // Tags are sorted by descending count.
    expect(facets.tags[0]).toEqual({ value: 'new', count: 2 });
    expect(facets.priceRange).toEqual({ min: 10, max: 30 });
  });

  it('falls back to a sane price range for an empty list', () => {
    expect(computeFacets([])).toEqual({
      brands: [],
      tags: [],
      priceRange: { min: 0, max: 1000 },
    });
  });
});
