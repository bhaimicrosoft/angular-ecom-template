import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucidePackage, lucideArrowRight, lucideMail } from '@ng-icons/lucide';
import { AccountService } from '../../core/account.service';
import { HlmButton } from '../../shared/ui/button';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIcon, HlmButton],
  providers: [provideIcons({ lucideCircleCheck, lucidePackage, lucideArrowRight, lucideMail })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmation.html',
})
export class Confirmation {
  private readonly account = inject(AccountService);
  private readonly navState =
    typeof history !== 'undefined' ? (history.state?.orderId as string | undefined) : undefined;

  protected readonly orderNumber =
    this.account.lastOrder()?.id ??
    this.navState ??
    'NOVA-' + Math.floor(100000 + Math.random() * 900000);
  protected readonly eta = new Date(Date.now() + 5 * 86_400_000);
  protected readonly steps = [
    { label: 'Order placed', done: true },
    { label: 'Processing', done: true },
    { label: 'Shipped', done: false },
    { label: 'Delivered', done: false },
  ];
}
