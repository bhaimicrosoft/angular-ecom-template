import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  variant: 'default' | 'success' | 'accent';
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, variant: Toast['variant'] = 'default', icon?: string): void {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { id, message, variant, icon }]);
    setTimeout(() => this.dismiss(id), 2600);
  }

  success(message: string, icon = 'lucideCircleCheck'): void {
    this.show(message, 'success', icon);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
