import { Injectable, computed, effect, inject, isDevMode, signal } from '@angular/core';
import { FONT_OPTIONS, PRESETS, Preset } from './customizer-data';
import { StoreConfigService } from './store-config.service';
import {
  canSaveToDisk,
  dataUrlToBytes,
  extFromDataUrl,
  getProjectRoot,
  patchServiceTs,
  patchStoreConfigTs,
  patchStylesCss,
  readProjectFile,
  writeBinaryFile,
  writeTextFile,
} from './customizer-fs';

export interface NavItem {
  label: string;
  link: string;
}

export interface BrandConfig {
  name: string;
  logoText: string;
  logoUrl: string;
}

export type ThemeSide = 'light' | 'dark';
export interface ColorOverrides {
  light: Record<string, string>;
  dark: Record<string, string>;
}

const KEY = 'nova-customizer';

export const DEFAULT_BRAND: BrandConfig = { name: 'KUMASHOP', logoText: 'KS', logoUrl: '/nova-logo.png' };
export const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', link: '/' },
  { label: 'Shop', link: '/catalog' },
  { label: 'Audio', link: '/category/audio' },
  { label: 'Computers', link: '/category/computers' },
  { label: 'Wearables', link: '/category/wearables' },
];
const DEFAULT_RADIUS = 0.7;
const DEFAULT_BASE_FONT = 16;
const DEFAULT_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

interface PersistShape {
  brand: BrandConfig;
  nav: NavItem[];
  radius: number;
  baseFont: number;
  font: string;
  colors: ColorOverrides;
}

/**
 * Powers the dev-only visual customizer. In production `enabled` is false, so no
 * UI renders, nothing is read from or written to storage, and no runtime styles
 * are injected — the app uses the values compiled into `styles.css`.
 *
 * Brand + nav signals always expose sensible defaults so the header/footer work
 * identically in production; the customizer merely mutates them at dev time.
 */
@Injectable({ providedIn: 'root' })
export class CustomizerService {
  /** True only under `ng serve` / dev builds. Drives all customizer behavior. */
  readonly enabled = isDevMode();

  readonly brand = signal<BrandConfig>(DEFAULT_BRAND);
  readonly nav = signal<NavItem[]>(DEFAULT_NAV);
  readonly radius = signal<number>(DEFAULT_RADIUS);
  readonly baseFont = signal<number>(DEFAULT_BASE_FONT);
  readonly font = signal<string>(DEFAULT_FONT);
  readonly colors = signal<ColorOverrides>({ light: {}, dark: {} });

  /** Runtime store settings (currency / tax / shipping) — shared, prod-active. */
  readonly store = inject(StoreConfigService);

  readonly panelOpen = signal(false);

  /** True when the browser supports writing straight back to source files. */
  readonly canSave = canSaveToDisk();
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly dirty = computed(
    () =>
      this.radius() !== DEFAULT_RADIUS ||
      this.baseFont() !== DEFAULT_BASE_FONT ||
      this.font() !== DEFAULT_FONT ||
      Object.keys(this.colors().light).length > 0 ||
      Object.keys(this.colors().dark).length > 0 ||
      JSON.stringify(this.brand()) !== JSON.stringify(DEFAULT_BRAND) ||
      JSON.stringify(this.nav()) !== JSON.stringify(DEFAULT_NAV) ||
      this.store.dirty(),
  );

  private styleEl?: HTMLStyleElement;
  private canvas?: HTMLCanvasElement;
  private readonly loadedFonts = new Set<string>();

  constructor() {
    if (!this.enabled) return;
    this.load();
    effect(() => this.ensureFont(this.font()));
    effect(() => {
      this.applyCss();
      this.persist();
    });
  }

  // Colors ---------------------------------------------------------------
  setColor(side: ThemeSide, token: string, value: string): void {
    this.colors.update((c) => ({ ...c, [side]: { ...c[side], [token]: value } }));
  }

  clearColor(side: ThemeSide, token: string): void {
    this.colors.update((c) => {
      const next = { ...c[side] };
      delete next[token];
      return { ...c, [side]: next };
    });
  }

  resetColors(): void {
    this.colors.set({ light: {}, dark: {} });
  }

  applyPreset(preset: Preset): void {
    this.colors.update((c) => ({
      light: { ...c.light, ...preset.light },
      dark: { ...c.dark, ...preset.dark },
    }));
  }

  /** Resolve a token's *current* value (for the active theme) to a hex string. */
  resolveHex(token: string): string {
    if (typeof document === 'undefined') return '#000000';
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
    return this.toHex(raw || '#000000');
  }

  // Shape + type ---------------------------------------------------------
  setRadius(rem: number): void {
    this.radius.set(rem);
  }
  setBaseFont(px: number): void {
    this.baseFont.set(px);
  }
  setFont(stack: string): void {
    this.font.set(stack);
  }

  // Brand ----------------------------------------------------------------
  setBrand(patch: Partial<BrandConfig>): void {
    this.brand.update((b) => ({ ...b, ...patch }));
  }

  // Nav ------------------------------------------------------------------
  updateNav(index: number, patch: Partial<NavItem>): void {
    this.nav.update((list) => list.map((n, i) => (i === index ? { ...n, ...patch } : n)));
  }
  addNav(): void {
    this.nav.update((list) => [...list, { label: 'New link', link: '/catalog' }]);
  }
  removeNav(index: number): void {
    this.nav.update((list) => list.filter((_, i) => i !== index));
  }
  moveNav(index: number, dir: -1 | 1): void {
    this.nav.update((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // Reset ----------------------------------------------------------------
  reset(): void {
    this.brand.set(DEFAULT_BRAND);
    this.nav.set(DEFAULT_NAV);
    this.radius.set(DEFAULT_RADIUS);
    this.baseFont.set(DEFAULT_BASE_FONT);
    this.font.set(DEFAULT_FONT);
    this.colors.set({ light: {}, dark: {} });
    this.store.reset();
  }

  // Export ---------------------------------------------------------------
  exportCss(): string {
    const c = this.colors();
    const fmt = (obj: Record<string, string>) =>
      Object.entries(obj)
        .map(([t, v]) => `  --${t}: ${v};`)
        .join('\n');
    let out = `:root {\n  --radius: ${this.radius()}rem;\n  --font-size-base: ${this.baseFont()}px;\n  --font-sans: ${this.font()};`;
    const light = fmt(c.light);
    if (light) out += `\n${light}`;
    out += `\n}`;
    const dark = fmt(c.dark);
    if (dark) out += `\n\n.dark {\n${dark}\n}`;
    return out;
  }

  exportConfig(): string {
    const nav = this.nav()
      .map((n) => `  { label: '${n.label}', link: '${n.link}' },`)
      .join('\n');
    const b = this.brand();
    return (
      `// src/app/core/customizer.service.ts — new defaults\n` +
      `export const DEFAULT_BRAND: BrandConfig = { name: '${b.name}', logoText: '${b.logoText}', logoUrl: '${b.logoUrl}' };\n\n` +
      `export const DEFAULT_NAV: NavItem[] = [\n${nav}\n];`
    );
  }

  // Save to source -------------------------------------------------------
  /**
   * Write the current look straight into the project's source files so it
   * becomes the compiled default — no copy/paste:
   *   • `src/styles.css`            → color tokens, radius, font
   *   • `customizer.service.ts`     → DEFAULT_BRAND / NAV / RADIUS / FONT
   *   • an uploaded logo (data URL) → `public/nova-logo.<ext>`
   * The dev server hot-reloads the result. Dev-only + user-gesture gated.
   */
  async saveToDisk(): Promise<void> {
    if (!this.enabled || this.saving()) return;
    this.saveError.set(null);
    this.saved.set(false);
    this.saving.set(true);
    try {
      const root = await getProjectRoot();

      // 1) Persist an uploaded logo as a real file and swap the data URL for it.
      let brand = this.brand();
      if (brand.logoUrl.startsWith('data:')) {
        const filename = `nova-logo.${extFromDataUrl(brand.logoUrl)}`;
        await writeBinaryFile(root, `public/${filename}`, dataUrlToBytes(brand.logoUrl));
        brand = { ...brand, logoUrl: `/${filename}` };
        this.brand.set(brand);
      }

      // 2) styles.css — colors + radius + font.
      const styles = await readProjectFile(root, 'src/styles.css');
      const c = this.colors();
      const nextStyles = patchStylesCss(styles.text, {
        radius: this.radius(),
        baseFont: this.baseFont(),
        font: this.font(),
        light: c.light,
        dark: c.dark,
      });
      if (nextStyles !== styles.text) await writeTextFile(styles.handle, nextStyles);

      // 3) customizer.service.ts — new compiled defaults.
      const svc = await readProjectFile(root, 'src/app/core/customizer.service.ts');
      const nextSvc = patchServiceTs(svc.text, {
        brand,
        nav: this.nav(),
        radius: this.radius(),
        baseFont: this.baseFont(),
        font: this.font(),
      });
      if (nextSvc !== svc.text) await writeTextFile(svc.handle, nextSvc);

      // 3b) store-config.service.ts — currency / tax / shipping defaults.
      const store = await readProjectFile(root, 'src/app/core/store-config.service.ts');
      const nextStore = patchStoreConfigTs(store.text, {
        currency: this.store.currency(),
        tax: this.store.tax(),
        shipping: this.store.shipping(),
      });
      if (nextStore !== store.text) await writeTextFile(store.handle, nextStore);

      // 4) The look is now baked into source. Drop the live color overrides and
      //    persisted state so the imminent dev-server reload starts clean with
      //    no phantom "unsaved" diff.
      if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
      this.store.clearPersisted();
      this.colors.set({ light: {}, dark: {} });

      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 4000);
    } catch (e: unknown) {
      this.saving.set(false);
      const err = e as { name?: string; message?: string };
      if (err?.name === 'AbortError') return; // user cancelled the folder picker
      this.saveError.set(err?.message || 'Save failed. Check the console for details.');
    }
  }

  // Internals ------------------------------------------------------------
  private applyCss(): void {
    const c = this.colors();
    const root = [
      `--radius: ${this.radius()}rem;`,
      `--font-size-base: ${this.baseFont()}px;`,
      `--font-sans: ${this.font()};`,
    ];
    for (const [t, v] of Object.entries(c.light)) root.push(`--${t}: ${v};`);
    let css = `:root{${root.join('')}}`;
    const darkEntries = Object.entries(c.dark);
    if (darkEntries.length) {
      css += `.dark{${darkEntries.map(([t, v]) => `--${t}: ${v};`).join('')}}`;
    }
    this.ensureStyleEl().textContent = css;
  }

  private ensureStyleEl(): HTMLStyleElement {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      this.styleEl.id = 'nova-customizer-overrides';
      document.head.appendChild(this.styleEl);
    }
    return this.styleEl;
  }

  private ensureFont(stack: string): void {
    const opt = FONT_OPTIONS.find((f) => f.stack === stack);
    if (!opt?.google || this.loadedFonts.has(opt.google) || typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${opt.google}&display=swap`;
    document.head.appendChild(link);
    this.loadedFonts.add(opt.google);
  }

  /** Convert any CSS color (oklch/rgb/hex/hsl) to #rrggbb via a scratch canvas. */
  private toHex(color: string): string {
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    if (typeof document === 'undefined') return '#000000';
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return '#000000';
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000000';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const data: PersistShape = {
      brand: this.brand(),
      nav: this.nav(),
      radius: this.radius(),
      baseFont: this.baseFont(),
      font: this.font(),
      colors: this.colors(),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  private load(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<PersistShape>;
      if (data.brand) this.brand.set(data.brand);
      if (data.nav) this.nav.set(data.nav);
      if (typeof data.radius === 'number') this.radius.set(data.radius);
      if (typeof data.baseFont === 'number') this.baseFont.set(data.baseFont);
      if (data.font) this.font.set(data.font);
      if (data.colors)
        this.colors.set({
          light: { ...(data.colors.light ?? {}) },
          dark: { ...(data.colors.dark ?? {}) },
        });
    } catch {
      /* ignore malformed storage */
    }
  }
}
