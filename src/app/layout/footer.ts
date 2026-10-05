import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideGlobe,
  lucideMessageCircle,
  lucideRss,
  lucideShare2,
  lucideSend,
  lucideTruck,
  lucideShieldCheck,
  lucideRotateCcw,
  lucideHeadphones,
} from '@ng-icons/lucide';
import { HlmButton } from '../shared/ui/button';
import { HlmInput } from '../shared/ui/input';
import { CustomizerService } from '../core/customizer.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIcon, HlmButton, HlmInput],
  providers: [
    provideIcons({
      lucideGlobe,
      lucideMessageCircle,
      lucideRss,
      lucideShare2,
      lucideSend,
      lucideTruck,
      lucideShieldCheck,
      lucideRotateCcw,
      lucideHeadphones,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
})
export class Footer {
  private readonly customizer = inject(CustomizerService);
  protected readonly brand = this.customizer.brand;
  protected readonly year = new Date().getFullYear();
  protected readonly perks = [
    { icon: 'lucideTruck', title: 'Free shipping', desc: 'On orders over $75' },
    { icon: 'lucideRotateCcw', title: '30-day returns', desc: 'Hassle-free refunds' },
    { icon: 'lucideShieldCheck', title: 'Secure checkout', desc: 'Encrypted payments' },
    { icon: 'lucideHeadphones', title: '24/7 support', desc: 'We are here to help' },
  ];
  protected readonly columns = [
    {
      title: 'Shop',
      links: [
        { label: 'New arrivals', link: '/new-arrivals' },
        { label: 'Best sellers', link: '/best-sellers' },
        { label: 'Deals', link: '/deals' },
        { label: 'Gift cards', link: '/gift-cards' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', link: '/about' },
        { label: 'Careers', link: '/careers' },
        { label: 'Press', link: '/press' },
        { label: 'Sustainability', link: '/sustainability' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help center', link: '/help' },
        { label: 'Shipping', link: '/shipping' },
        { label: 'Returns', link: '/returns' },
        { label: 'Track order', link: '/track-order' },
      ],
    },
  ];
}
