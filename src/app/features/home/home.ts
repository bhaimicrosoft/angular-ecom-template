import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideTruck,
  lucideSparkles,
  lucideStar,
  lucideQuote,
} from '@ng-icons/lucide';
import { DATA_SOURCE } from '../../shared/data/data-source';
import { ProductCard } from '../../shared/components/product-card';
import { ProductCardSkeleton } from '../../shared/components/product-card-skeleton';
import { HlmButton } from '../../shared/ui/button';
import { HlmBadge } from '../../shared/ui/badge';
import { PricePipe } from '../../shared/ui/price.pipe';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ProductCard,
    ProductCardSkeleton,
    HlmButton,
    HlmBadge,
    PricePipe,
  ],
  providers: [
    provideIcons({ lucideArrowRight, lucideTruck, lucideSparkles, lucideStar, lucideQuote }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  private readonly data = inject(DATA_SOURCE);
  protected readonly cart = inject(CartService);

  protected readonly categories = toSignal(this.data.getCategories(), { initialValue: [] });
  protected readonly featured = toSignal(this.data.getFeaturedProducts(8), { initialValue: [] });
  protected readonly heroProduct = computed(() => this.featured()[0]);

  protected readonly stats = [
    { value: '50k+', label: 'Happy customers' },
    { value: '4.9', label: 'Average rating' },
    { value: '120+', label: 'Premium brands' },
    { value: '24/7', label: 'Support' },
  ];

  protected readonly testimonials = [
    {
      quote:
        'The quality is unreal for the price. Checkout was smooth and delivery was faster than promised.',
      author: 'Priya S.',
      role: 'Verified buyer',
    },
    {
      quote: 'Beautiful design, intuitive site. I found exactly what I needed in under a minute.',
      author: 'Marcus D.',
      role: 'Verified buyer',
    },
    {
      quote: 'Customer support went above and beyond. This is now my go-to store for tech.',
      author: 'Lena K.',
      role: 'Verified buyer',
    },
  ];
}
