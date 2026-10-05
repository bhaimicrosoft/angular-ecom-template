import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePalette,
  lucideX,
  lucideSun,
  lucideMoon,
  lucideRotateCcw,
  lucideCopy,
  lucideCheck,
  lucidePlus,
  lucideTrash2,
  lucideChevronUp,
  lucideChevronDown,
  lucideType,
  lucideLayoutGrid,
  lucideSparkles,
  lucideCode,
  lucideSwatchBook,
  lucideGripVertical,
  lucideSave,
  lucideUpload,
  lucideLoaderCircle,
  lucideTriangleAlert,
  lucideStore,
  lucideBanknote,
  lucideReceipt,
  lucideTruck,
  lucideCoins,
  lucidePercent,
  lucideALargeSmall,
  lucidePackage,
} from '@ng-icons/lucide';
import { CustomizerService, ThemeSide } from '../../core/customizer.service';
import { ThemeService } from '../../core/theme.service';
import { COLOR_TOKENS, COLOR_GROUPS, FONT_OPTIONS, PRESETS } from '../../core/customizer-data';
import { HlmButton } from '../ui/button';
import { HlmInput } from '../ui/input';

type Tab = 'colors' | 'brand' | 'menu' | 'store' | 'code';

@Component({
  selector: 'app-customizer',
  standalone: true,
  imports: [NgIcon, HlmButton, HlmInput],
  providers: [
    provideIcons({
      lucidePalette,
      lucideX,
      lucideSun,
      lucideMoon,
      lucideRotateCcw,
      lucideCopy,
      lucideCheck,
      lucidePlus,
      lucideTrash2,
      lucideChevronUp,
      lucideChevronDown,
      lucideType,
      lucideLayoutGrid,
      lucideSparkles,
      lucideCode,
      lucideSwatchBook,
      lucideGripVertical,
      lucideSave,
      lucideUpload,
      lucideLoaderCircle,
      lucideTriangleAlert,
      lucideStore,
      lucideBanknote,
      lucideReceipt,
      lucideTruck,
      lucideCoins,
      lucidePercent,
      lucideALargeSmall,
      lucidePackage,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating launcher -->
    @if (!cz.panelOpen()) {
      <button
        type="button"
        (click)="cz.panelOpen.set(true)"
        class="group fixed right-0 top-1/2 z-[200] flex -translate-y-1/2 items-center gap-2 rounded-l-2xl bg-gradient-to-br from-fuchsia-500 via-orange-500 to-amber-400 py-3 pl-3 pr-3.5 text-white shadow-2xl transition-transform hover:pr-5 animate-pulse-glow"
        aria-label="Open theme customizer"
      >
        <ng-icon name="lucidePalette" size="22" class="animate-spin-slow" />
        <span class="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[120px]">
          Customize
        </span>
      </button>
    }

    @if (cz.panelOpen()) {
      <!-- Backdrop -->
      <button
        type="button"
        (click)="cz.panelOpen.set(false)"
        class="fixed inset-0 z-[200] cursor-default bg-black/40 backdrop-blur-sm animate-fade-in"
        aria-label="Close customizer"
        tabindex="-1"
      ></button>

      <aside
        class="fixed right-0 top-0 z-[210] flex h-full w-[380px] max-w-[92vw] flex-col border-l border-border bg-card shadow-2xl animate-slide-in-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white shadow">
              <ng-icon name="lucideSparkles" size="18" />
            </span>
            <div>
              <p class="text-sm font-bold leading-none">Theme Studio</p>
              <p class="mt-1 text-[11px] text-muted-foreground">Dev-only · live preview</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button hlmBtn variant="ghost" size="icon-sm" (click)="toggleTheme()" aria-label="Toggle theme">
              <ng-icon [name]="theme.isDark() ? 'lucideMoon' : 'lucideSun'" size="17" />
            </button>
            <button hlmBtn variant="ghost" size="icon-sm" (click)="cz.panelOpen.set(false)" aria-label="Close">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 border-b border-border px-3 py-2">
          @for (t of tabs; track t.id) {
            <button
              type="button"
              (click)="tab.set(t.id)"
              class="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors"
              [class]="tab() === t.id ? 'bg-accent/12 text-accent' : 'text-muted-foreground hover:bg-secondary'"
            >
              <ng-icon [name]="t.icon" size="17" />
              {{ t.label }}
            </button>
          }
        </div>

        <!-- Body -->
        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          @switch (tab()) {
            @case ('colors') {
              <!-- Presets -->
              <div>
                <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ng-icon name="lucideSwatchBook" size="14" /> Palettes
                </p>
                <div class="grid grid-cols-4 gap-2">
                  @for (p of presets; track p.name) {
                    <button
                      type="button"
                      (click)="cz.applyPreset(p)"
                      [attr.title]="p.name"
                      class="group relative aspect-square overflow-hidden rounded-xl ring-2 ring-transparent transition-all hover:scale-105 hover:ring-accent/50"
                      [style.background]="p.swatch"
                    >
                      <span class="absolute inset-x-0 bottom-0 truncate bg-black/30 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">{{ p.name }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Editing side indicator -->
              <div class="flex flex-wrap items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs">
                <ng-icon [name]="theme.isDark() ? 'lucideMoon' : 'lucideSun'" size="14" class="text-accent" />
                Editing <strong>{{ editSide() }}</strong> palette — toggle
                <button type="button" (click)="toggleTheme()" class="font-semibold text-accent underline-offset-2 hover:underline">theme</button>
                to edit the other.
              </div>

              <!-- Color tokens -->
              @for (grp of groups; track grp.name) {
                <div>
                  <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ grp.name }}</p>
                  <div class="divide-y divide-border">
                    @for (t of grp.tokens; track t.token) {
                      <label class="flex items-center justify-between gap-3 py-2">
                        <span class="text-sm">{{ t.label }}</span>
                        <span class="flex items-center gap-2">
                          <span class="font-mono text-[11px] text-muted-foreground">{{ swatch(t.token) }}</span>
                          <span class="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border shadow-sm">
                            <input
                              type="color"
                              [value]="swatch(t.token)"
                              (input)="onColor(t.token, $event)"
                              class="absolute -inset-2 h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
                              [attr.aria-label]="t.label"
                            />
                          </span>
                        </span>
                      </label>
                    }
                  </div>
                </div>
              }

              <button hlmBtn variant="outline" size="sm" class="w-full" (click)="cz.resetColors()">
                <ng-icon name="lucideRotateCcw" size="14" /> Reset colors
              </button>

              <!-- Shape + type -->
              <div class="space-y-4 border-t border-border pt-5">
                <div>
                  <div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span class="flex items-center gap-1.5"><ng-icon name="lucideLayoutGrid" size="14" /> Corner radius</span>
                    <span class="font-mono text-foreground">{{ cz.radius().toFixed(2) }}rem</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    [value]="cz.radius()"
                    (input)="onRadius($event)"
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent"
                  />
                </div>
                <div>
                  <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ng-icon name="lucideType" size="14" /> Font family
                  </p>
                  <select
                    [value]="cz.font()"
                    (change)="onFont($event)"
                    class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    @for (f of fonts; track f.stack) {
                      <option [value]="f.stack">{{ f.label }}</option>
                    }
                  </select>
                  <p class="mt-2 rounded-lg bg-secondary px-3 py-2 text-lg" [style.font-family]="cz.font()">
                    The quick brown fox — {{ cz.brand().name }}
                  </p>
                </div>
                <div>
                  <div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span class="flex items-center gap-1.5"><ng-icon name="lucideALargeSmall" size="15" /> Base text size</span>
                    <span class="font-mono text-foreground">{{ cz.baseFont() }}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    step="1"
                    [value]="cz.baseFont()"
                    (input)="onBaseFont($event)"
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-accent"
                  />
                  <p class="mt-1.5 text-[11px] text-muted-foreground">Scales typography &amp; spacing across the whole storefront (root <code class="font-mono">rem</code>).</p>
                </div>
              </div>
            }

            @case ('brand') {
              <!-- Live preview -->
              <div class="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 p-4">
                @if (cz.brand().logoUrl) {
                  <img [src]="cz.brand().logoUrl" alt="" class="h-9 w-9 rounded-lg object-cover" />
                } @else {
                  <span class="grid h-9 w-9 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">{{ cz.brand().logoText || 'N' }}</span>
                }
                <span class="text-xl font-bold tracking-tight">{{ cz.brand().name || 'Brand' }}</span>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Brand name</label>
                <input hlmInput [value]="cz.brand().name" (input)="onBrand('name', $event)" placeholder="Nova" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Logo letter</label>
                <input hlmInput maxlength="2" [value]="cz.brand().logoText" (input)="onBrand('logoText', $event)" placeholder="N" />
                <p class="text-xs text-muted-foreground">Used when no logo image is set.</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Logo image</label>
                <div class="flex items-center gap-2">
                  <label
                    class="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <ng-icon name="lucideUpload" size="15" />
                    Upload image
                    <input type="file" accept="image/*" class="hidden" (change)="onLogoFile($event)" />
                  </label>
                  @if (cz.brand().logoUrl) {
                    <button hlmBtn variant="ghost" size="sm" class="text-destructive" (click)="clearLogo()">
                      <ng-icon name="lucideTrash2" size="15" /> Remove
                    </button>
                  }
                </div>
                <p class="text-xs text-muted-foreground">
                  PNG, SVG or JPG. Saved to <code class="font-mono">public/</code> when you hit Save.
                </p>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">…or paste a logo URL</label>
                <input hlmInput [value]="logoUrlField()" (input)="onBrand('logoUrl', $event)" placeholder="https://…/logo.svg" />
              </div>
            }

            @case ('menu') {
              <p class="text-xs text-muted-foreground">Reorder, rename, or relink the header navigation. Changes apply instantly.</p>
              <div class="space-y-3">
                @for (item of cz.nav(); track $index) {
                  <div class="rounded-xl border border-border p-3">
                    <div class="mb-2 flex items-center justify-between">
                      <ng-icon name="lucideGripVertical" size="15" class="text-muted-foreground" />
                      <div class="flex items-center gap-0.5">
                        <button hlmBtn variant="ghost" size="icon-sm" (click)="cz.moveNav($index, -1)" [disabled]="$first" aria-label="Move up">
                          <ng-icon name="lucideChevronUp" size="15" />
                        </button>
                        <button hlmBtn variant="ghost" size="icon-sm" (click)="cz.moveNav($index, 1)" [disabled]="$last" aria-label="Move down">
                          <ng-icon name="lucideChevronDown" size="15" />
                        </button>
                        <button hlmBtn variant="ghost" size="icon-sm" (click)="cz.removeNav($index)" aria-label="Remove" class="text-destructive">
                          <ng-icon name="lucideTrash2" size="15" />
                        </button>
                      </div>
                    </div>
                    <div class="grid gap-2">
                      <input hlmInput class="h-9" [value]="item.label" (input)="onNav($index, 'label', $event)" placeholder="Label" />
                      <input hlmInput class="h-9 font-mono text-xs" [value]="item.link" (input)="onNav($index, 'link', $event)" placeholder="/route" />
                    </div>
                  </div>
                }
              </div>
              <button hlmBtn variant="outline" size="sm" class="w-full" (click)="cz.addNav()">
                <ng-icon name="lucidePlus" size="15" /> Add menu item
              </button>
            }

            @case ('store') {
              <p class="text-xs text-muted-foreground">Currency, tax &amp; shipping used across pricing, the cart and checkout. These stay active in production.</p>

              <!-- Currency -->
              <div class="space-y-3">
                <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ng-icon name="lucideBanknote" size="14" /> Currency
                </p>
                <div class="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-center">
                  <span class="text-xs text-muted-foreground">Preview</span>
                  <p class="text-lg font-bold">{{ cz.store.format(1234.5) }}</p>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Symbol</label>
                    <input hlmInput class="h-9" [value]="cz.store.currency().symbol" (input)="onCurrency('symbol', $event)" placeholder="$" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Code</label>
                    <input hlmInput class="h-9" [value]="cz.store.currency().code" (input)="onCurrency('code', $event)" placeholder="USD" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Symbol position</label>
                    <select
                      [value]="cz.store.currency().position"
                      (change)="onCurrency('position', $event)"
                      class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="before">Before — {{ cz.store.currency().symbol }}9.99</option>
                      <option value="after">After — 9.99{{ cz.store.currency().symbol }}</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Decimals</label>
                    <select
                      [value]="cz.store.currency().decimals"
                      (change)="onCurrency('decimals', $event)"
                      class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="0">0</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div class="col-span-2 space-y-1">
                    <label class="text-xs font-medium">Locale (digit grouping)</label>
                    <input hlmInput class="h-9 font-mono text-xs" [value]="cz.store.currency().locale" (input)="onCurrency('locale', $event)" placeholder="en-US" />
                  </div>
                </div>
              </div>

              <!-- Tax -->
              <div class="space-y-3 border-t border-border pt-5">
                <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ng-icon name="lucideReceipt" size="14" /> Tax
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Rate (%)</label>
                    <input hlmInput type="number" min="0" step="0.1" class="h-9" [value]="cz.store.tax().rate" (input)="onTax('rate', $event)" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Label</label>
                    <input hlmInput class="h-9" [value]="cz.store.tax().label" (input)="onTax('label', $event)" placeholder="Tax / VAT / GST" />
                  </div>
                </div>
              </div>

              <!-- Shipping -->
              <div class="space-y-3 border-t border-border pt-5">
                <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ng-icon name="lucideTruck" size="14" /> Shipping
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Free over</label>
                    <input hlmInput type="number" min="0" step="1" class="h-9" [value]="cz.store.shipping().freeThreshold" (input)="onShippingConfig('freeThreshold', $event)" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Cart flat rate</label>
                    <input hlmInput type="number" min="0" step="0.01" class="h-9" [value]="cz.store.shipping().flatRate" (input)="onShippingConfig('flatRate', $event)" />
                  </div>
                </div>
                <div class="space-y-2">
                  @for (m of cz.store.shipping().methods; track $index) {
                    <div class="rounded-xl border border-border p-3">
                      <div class="mb-2 flex items-center justify-between">
                        <span class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><ng-icon name="lucidePackage" size="14" /> Method {{ $index + 1 }}</span>
                        <button hlmBtn variant="ghost" size="icon-sm" (click)="cz.store.removeShippingMethod($index)" aria-label="Remove method" class="text-destructive">
                          <ng-icon name="lucideTrash2" size="15" />
                        </button>
                      </div>
                      <div class="grid gap-2">
                        <div class="grid grid-cols-2 gap-2">
                          <input hlmInput class="h-9" [value]="m.label" (input)="onShipping($index, 'label', $event)" placeholder="Label" />
                          <input hlmInput type="number" min="0" step="0.01" class="h-9" [value]="m.price" (input)="onShipping($index, 'price', $event)" placeholder="Price" />
                        </div>
                        <input hlmInput class="h-9 text-xs" [value]="m.desc" (input)="onShipping($index, 'desc', $event)" placeholder="Delivery estimate" />
                      </div>
                    </div>
                  }
                </div>
                <button hlmBtn variant="outline" size="sm" class="w-full" (click)="cz.store.addShippingMethod()">
                  <ng-icon name="lucidePlus" size="15" /> Add shipping method
                </button>
              </div>
            }

            @case ('code') {
              <p class="text-xs text-muted-foreground">
                Prefer one click? Use <strong>Save to project</strong> below to write these changes
                straight into your source. This tab is the manual fallback (e.g. other browsers).
              </p>
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">styles.css</p>
                  <button hlmBtn variant="ghost" size="sm" (click)="copy('css', cz.exportCss())">
                    <ng-icon [name]="copied() === 'css' ? 'lucideCheck' : 'lucideCopy'" size="14" />
                    {{ copied() === 'css' ? 'Copied' : 'Copy' }}
                  </button>
                </div>
                <pre class="max-h-48 overflow-auto rounded-lg border border-border bg-secondary/60 p-3 font-mono text-[11px] leading-relaxed">{{ cz.exportCss() }}</pre>
              </div>
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand &amp; menu</p>
                  <button hlmBtn variant="ghost" size="sm" (click)="copy('cfg', cz.exportConfig())">
                    <ng-icon [name]="copied() === 'cfg' ? 'lucideCheck' : 'lucideCopy'" size="14" />
                    {{ copied() === 'cfg' ? 'Copied' : 'Copy' }}
                  </button>
                </div>
                <pre class="max-h-48 overflow-auto rounded-lg border border-border bg-secondary/60 p-3 font-mono text-[11px] leading-relaxed">{{ cz.exportConfig() }}</pre>
              </div>
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Store settings</p>
                  <button hlmBtn variant="ghost" size="sm" (click)="copy('store', cz.store.exportConfig())">
                    <ng-icon [name]="copied() === 'store' ? 'lucideCheck' : 'lucideCopy'" size="14" />
                    {{ copied() === 'store' ? 'Copied' : 'Copy' }}
                  </button>
                </div>
                <pre class="max-h-48 overflow-auto rounded-lg border border-border bg-secondary/60 p-3 font-mono text-[11px] leading-relaxed">{{ cz.store.exportConfig() }}</pre>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        <div class="space-y-2 border-t border-border px-5 py-3">
          @if (cz.saveError()) {
            <p class="flex items-start gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
              <ng-icon name="lucideTriangleAlert" size="14" class="mt-0.5 shrink-0" />
              <span>{{ cz.saveError() }}</span>
            </p>
          }
          <div class="flex items-center gap-2">
            @if (cz.canSave) {
              <button
                hlmBtn
                variant="accent"
                size="sm"
                class="flex-1"
                (click)="cz.saveToDisk()"
                [disabled]="cz.saving() || !cz.dirty()"
              >
                @if (cz.saving()) {
                  <ng-icon name="lucideLoaderCircle" size="15" class="animate-spin" /> Saving…
                } @else if (cz.saved()) {
                  <ng-icon name="lucideCheck" size="15" /> Saved to source
                } @else {
                  <ng-icon name="lucideSave" size="15" /> Save to project
                }
              </button>
            } @else {
              <button hlmBtn variant="outline" size="sm" class="flex-1" (click)="tab.set('code')">
                <ng-icon name="lucideCode" size="15" /> Export code
              </button>
            }
            <button hlmBtn variant="ghost" size="sm" (click)="cz.reset()" [disabled]="!cz.dirty()" class="text-destructive">
              <ng-icon name="lucideRotateCcw" size="14" /> Reset
            </button>
          </div>
          <p class="text-center text-[11px] text-muted-foreground">
            @if (cz.saving()) {
              Writing files & hot-reloading…
            } @else if (cz.dirty()) {
              {{ cz.canSave ? 'Save writes to styles.css, customizer.service.ts & store-config.service.ts' : 'Unsaved live changes' }}
            } @else {
              Matches the compiled default theme
            }
          </p>
        </div>
      </aside>
    }
  `,
})
export class Customizer {
  protected readonly cz = inject(CustomizerService);
  protected readonly theme = inject(ThemeService);

  protected readonly tab = signal<Tab>('colors');
  protected readonly copied = signal<string | null>(null);

  protected readonly presets = PRESETS;
  protected readonly fonts = FONT_OPTIONS;
  protected readonly groups = COLOR_GROUPS.map((name) => ({
    name,
    tokens: COLOR_TOKENS.filter((t) => t.group === name),
  }));

  protected readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'colors', label: 'Style', icon: 'lucidePalette' },
    { id: 'brand', label: 'Brand', icon: 'lucideSparkles' },
    { id: 'menu', label: 'Menu', icon: 'lucideLayoutGrid' },
    { id: 'store', label: 'Store', icon: 'lucideStore' },
    { id: 'code', label: 'Code', icon: 'lucideCode' },
  ];

  protected readonly editSide = computed<ThemeSide>(() => (this.theme.isDark() ? 'dark' : 'light'));

  protected swatch(token: string): string {
    const override = this.cz.colors()[this.editSide()][token];
    return override ?? this.cz.resolveHex(token);
  }

  protected onColor(token: string, event: Event): void {
    this.cz.setColor(this.editSide(), token, (event.target as HTMLInputElement).value);
  }

  protected onRadius(event: Event): void {
    this.cz.setRadius(parseFloat((event.target as HTMLInputElement).value));
  }

  protected onFont(event: Event): void {
    this.cz.setFont((event.target as HTMLSelectElement).value);
  }

  protected onBaseFont(event: Event): void {
    this.cz.setBaseFont(parseInt((event.target as HTMLInputElement).value, 10));
  }

  protected onCurrency(key: 'symbol' | 'code' | 'position' | 'decimals' | 'locale', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    if (key === 'decimals') this.cz.store.setCurrency({ decimals: parseInt(value, 10) || 0 });
    else if (key === 'position') this.cz.store.setCurrency({ position: value === 'after' ? 'after' : 'before' });
    else this.cz.store.setCurrency({ [key]: value });
  }

  protected onTax(key: 'rate' | 'label', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (key === 'rate') this.cz.store.setTax({ rate: Math.max(0, parseFloat(value) || 0) });
    else this.cz.store.setTax({ label: value });
  }

  protected onShippingConfig(key: 'freeThreshold' | 'flatRate', event: Event): void {
    const value = Math.max(0, parseFloat((event.target as HTMLInputElement).value) || 0);
    this.cz.store.setShipping({ [key]: value });
  }

  protected onShipping(index: number, key: 'label' | 'desc' | 'price', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (key === 'price') this.cz.store.updateShippingMethod(index, { price: Math.max(0, parseFloat(value) || 0) });
    else this.cz.store.updateShippingMethod(index, { [key]: value });
  }

  protected onBrand(key: 'name' | 'logoText' | 'logoUrl', event: Event): void {
    this.cz.setBrand({ [key]: (event.target as HTMLInputElement).value });
  }

  /** Show the URL field empty while an uploaded (data URL) image is active. */
  protected logoUrlField(): string {
    const url = this.cz.brand().logoUrl;
    return url.startsWith('data:') ? '' : url;
  }

  protected onLogoFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.cz.setBrand({ logoUrl: String(reader.result) });
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected clearLogo(): void {
    this.cz.setBrand({ logoUrl: '' });
  }

  protected onNav(index: number, key: 'label' | 'link', event: Event): void {
    this.cz.updateNav(index, { [key]: (event.target as HTMLInputElement).value });
  }

  protected toggleTheme(): void {
    this.theme.set(this.theme.isDark() ? 'light' : 'dark');
  }

  protected async copy(id: string, text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(id);
      setTimeout(() => this.copied.set(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
}
