import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { CART_PROVIDER } from './providers/cart.provider';
import { Product } from '../shared/data/models';

function product(id: string, price: number): Product {
  return {
    id,
    slug: id,
    title: `Product ${id}`,
    description: '',
    categoryId: 'c',
    tags: [],
    price,
    currency: 'USD',
    images: [],
    thumbnail: '',
    rating: { average: 0, count: 0 },
    stock: 10,
    variants: [],
  };
}

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CartService,
        // In-memory persistence so tests don't touch real storage.
        { provide: CART_PROVIDER, useValue: { load: () => [], save: () => {} } },
      ],
    });
    cart = TestBed.inject(CartService);
  });

  it('adds items and sums the count and subtotal', () => {
    cart.add(product('a', 10), undefined, 2);
    cart.add(product('b', 5), undefined, 1);
    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(25);
  });

  it('merges quantities when the same product is added again', () => {
    cart.add(product('a', 10), undefined, 1);
    cart.add(product('a', 10), undefined, 2);
    expect(cart.lines()).toHaveLength(1);
    expect(cart.count()).toBe(3);
  });

  it('updates and removes quantities', () => {
    cart.add(product('a', 10), undefined, 1);
    cart.setQuantity('a', undefined, 4);
    expect(cart.count()).toBe(4);
    cart.setQuantity('a', undefined, 0); // zero removes the line
    expect(cart.isEmpty()).toBe(true);
  });

  it('applies a known coupon as a proportional discount', () => {
    cart.add(product('a', 100), undefined, 1);
    expect(cart.applyCoupon('SAVE10')).toBe(true);
    expect(cart.discount()).toBe(10);
    expect(cart.couponCode()).toBe('SAVE10');
    expect(cart.applyCoupon('NOPE')).toBe(false);
  });

  it('clears the cart and resets the discount', () => {
    cart.add(product('a', 10), undefined, 1);
    cart.applyCoupon('SAVE10');
    cart.clear();
    expect(cart.isEmpty()).toBe(true);
    expect(cart.discount()).toBe(0);
  });
});
