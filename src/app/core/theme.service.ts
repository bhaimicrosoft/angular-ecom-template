import { Injectable, signal, effect, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'ecom-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.read());
  readonly isDark = computed(() => this.resolve(this.mode()));

  constructor() {
    effect(() => {
      const dark = this.isDark();
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, this.mode());
      }
    });

    if (typeof window !== 'undefined' && window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.mode() === 'system') this.mode.set('system');
        });
    }
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  private resolve(mode: ThemeMode): boolean {
    if (mode === 'system') {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches
      );
    }
    return mode === 'dark';
  }

  private read(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system';
  }
}
