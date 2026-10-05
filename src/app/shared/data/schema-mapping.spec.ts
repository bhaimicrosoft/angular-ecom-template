import { describe, it, expect } from 'vitest';
import {
  getPath,
  resolveField,
  mapProduct,
  mapCategory,
  mapReview,
} from './schema-mapping';

describe('getPath', () => {
  it('reads nested dot paths', () => {
    expect(getPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('reads bracket/array paths', () => {
    expect(getPath({ images: [{ src: 'x' }] }, 'images[0].src')).toBe('x');
  });

  it('returns undefined for missing paths', () => {
    expect(getPath({ a: 1 }, 'a.b.c')).toBeUndefined();
    expect(getPath(null, 'a')).toBeUndefined();
  });
});

describe('resolveField', () => {
  const raw = { title: 'Real', name: 'Fallback' };

  it('resolves a single string path', () => {
    expect(resolveField(raw, 'title')).toBe('Real');
  });

  it('resolves the first non-empty path in a fallback array', () => {
    expect(resolveField({ name: 'Only' }, ['title', 'name'])).toBe('Only');
  });

  it('resolves a function field', () => {
    expect(resolveField(raw, (r) => `${r['title']}!`)).toBe('Real!');
  });

  it('skips empty-string values when falling back', () => {
    expect(resolveField({ title: '', name: 'x' }, ['title', 'name'])).toBe('x');
  });
});

describe('mapProduct', () => {
  it('applies sensible defaults for a sparse payload', () => {
    const p = mapProduct({ id: 7, title: 'Widget', price: 9.5 });
    expect(p.id).toBe('7');
    expect(p.title).toBe('Widget');
    expect(p.price).toBe(9.5);
    expect(p.slug).toBe('widget');
    expect(p.currency).toBe('USD');
    expect(p.stock).toBe(0);
    expect(p.variants).toEqual([]);
  });

  it('normalizes string and object image entries', () => {
    const p = mapProduct({
      id: 1,
      title: 'Img',
      images: ['https://a/1.jpg', { url: 'https://a/2.jpg', alt: 'two' }],
    });
    expect(p.images).toEqual([
      { url: 'https://a/1.jpg' },
      { url: 'https://a/2.jpg', alt: 'two' },
    ]);
    expect(p.thumbnail).toBe('https://a/1.jpg');
  });

  it('honors a custom mapping with paths and functions', () => {
    const p = mapProduct(
      { data: { name: 'Mapped' }, pricing: { amount: 12 }, cat: 'shoes' },
      {
        title: 'data.name',
        price: (raw) => (raw['pricing'] as { amount: number }).amount,
        categoryId: 'cat',
      },
    );
    expect(p.title).toBe('Mapped');
    expect(p.price).toBe(12);
    expect(p.categoryId).toBe('shoes');
  });

  it('preserves the raw payload under attributes', () => {
    const raw = { id: 1, title: 'X', custom: 'keep' };
    expect(mapProduct(raw).attributes).toEqual(raw);
  });
});

describe('mapCategory', () => {
  it('derives id and slug from the name when absent', () => {
    const c = mapCategory({ name: 'Home & Garden' });
    expect(c.name).toBe('Home & Garden');
    expect(c.slug).toBe('home-garden');
    expect(c.id).toBe('home-garden');
  });
});

describe('mapReview', () => {
  it('maps common review field aliases with defaults', () => {
    const r = mapReview({ author: 'Ada', rating: 4, comment: 'Nice' });
    expect(r.author).toBe('Ada');
    expect(r.rating).toBe(4);
    expect(r.body).toBe('Nice');
    expect(typeof r.date).toBe('string');
  });
});
