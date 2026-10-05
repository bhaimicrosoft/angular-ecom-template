import { OrderStatus } from '../../core/account.service';

export interface StatusMeta {
  label: string;
  classes: string;
  icon: string;
  step: number;
}

export const ORDER_STEPS = ['processing', 'shipped', 'out_for_delivery', 'delivered'] as const;

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  processing: {
    label: 'Processing',
    classes: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    icon: 'lucideClock',
    step: 0,
  },
  shipped: {
    label: 'Shipped',
    classes: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
    icon: 'lucideTruck',
    step: 1,
  },
  out_for_delivery: {
    label: 'Out for delivery',
    classes: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
    icon: 'lucidePackageCheck',
    step: 2,
  },
  delivered: {
    label: 'Delivered',
    classes: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    icon: 'lucideCircleCheck',
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-destructive/12 text-destructive',
    icon: 'lucideCircleX',
    step: -1,
  },
};
