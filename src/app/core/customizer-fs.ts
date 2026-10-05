/**
 * Dev-only "write back to source" helpers for the Theme Studio.
 *
 * Uses the browser File System Access API (Chromium/Edge, secure context —
 * `localhost` qualifies) so the customizer can persist changes straight into the
 * project's source files: no copy/paste required. None of this is ever reachable
 * in production because the whole customizer is gated behind `isDevMode()`.
 *
 * The string-transform functions are pure and framework-free so the risky part
 * (rewriting source) is easy to reason about and test.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface StylePatch {
  radius: number;
  baseFont: number;
  font: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface ServicePatch {
  brand: { name: string; logoText: string; logoUrl: string };
  nav: { label: string; link: string }[];
  radius: number;
  baseFont: number;
  font: string;
}

export interface StoreConfigPatch {
  currency: { code: string; symbol: string; position: 'before' | 'after'; decimals: number; locale: string };
  tax: { rate: number; label: string };
  shipping: {
    methods: { id: string; label: string; desc: string; price: number }[];
    freeThreshold: number;
    flatRate: number;
  };
}

// --- Pure source transforms ------------------------------------------------

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replace `--token: value;` declarations inside a single CSS block. */
function patchBlock(css: string, blockRe: RegExp, tokens: Record<string, string>): string {
  const entries = Object.entries(tokens);
  if (!entries.length) return css;
  return css.replace(blockRe, (block) => {
    let b = block;
    for (const [token, value] of entries) {
      const re = new RegExp(`(--${escapeRe(token)}\\s*:\\s*)[^;]+;`);
      if (re.test(b)) b = b.replace(re, `$1${value};`);
      else b = b.replace(/\s*\}$/, `\n  --${token}: ${value};\n}`);
    }
    return b;
  });
}

/**
 * Rewrite `src/styles.css` with the current color tokens, radius and font.
 * `--radius` / `--font-sans` occur once each; color tokens are scoped to the
 * `:root { … }` (light) and `.dark { … }` (dark) blocks so each theme is updated
 * independently.
 */
export function patchStylesCss(css: string, { radius, baseFont, font, light, dark }: StylePatch): string {
  let out = css;
  out = out.replace(/--radius:\s*[^;]+;/, `--radius: ${radius}rem;`);
  out = out.replace(/--font-size-base:\s*[^;]+;/, `--font-size-base: ${baseFont}px;`);
  out = out.replace(/--font-sans:\s*[^;]+;/, `--font-sans:\n    ${font};`);
  out = patchBlock(out, /:root\s*\{[\s\S]*?\}/, light);
  out = patchBlock(out, /\.dark\s*\{[\s\S]*?\}/, dark);
  return out;
}

function quote(value: string): string {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Rewrite the `DEFAULT_*` baselines in `customizer.service.ts`. */
export function patchServiceTs(src: string, { brand, nav, radius, baseFont, font }: ServicePatch): string {
  let out = src;

  const brandLine =
    `export const DEFAULT_BRAND: BrandConfig = { ` +
    `name: ${quote(brand.name)}, logoText: ${quote(brand.logoText)}, logoUrl: ${quote(brand.logoUrl)} };`;
  out = out.replace(/export const DEFAULT_BRAND: BrandConfig = \{[^}]*\};/, brandLine);

  const navBody = nav.map((n) => `  { label: ${quote(n.label)}, link: ${quote(n.link)} },`).join('\n');
  const navBlock = `export const DEFAULT_NAV: NavItem[] = [\n${navBody}\n];`;
  out = out.replace(/export const DEFAULT_NAV: NavItem\[\] = \[[\s\S]*?\];/, navBlock);

  out = out.replace(/const DEFAULT_RADIUS = [^;]+;/, `const DEFAULT_RADIUS = ${radius};`);
  out = out.replace(/const DEFAULT_BASE_FONT = [^;]+;/, `const DEFAULT_BASE_FONT = ${baseFont};`);
  out = out.replace(/const DEFAULT_FONT = [^;]+;/, `const DEFAULT_FONT = ${JSON.stringify(font)};`);

  return out;
}

/** Rewrite the `DEFAULT_CURRENCY / TAX / SHIPPING` baselines in `store-config.service.ts`. */
export function patchStoreConfigTs(src: string, { currency, tax, shipping }: StoreConfigPatch): string {
  let out = src;

  const currencyLine =
    `export const DEFAULT_CURRENCY: CurrencyConfig = { ` +
    `code: ${quote(currency.code)}, symbol: ${quote(currency.symbol)}, position: ${quote(currency.position)}, ` +
    `decimals: ${currency.decimals}, locale: ${quote(currency.locale)} };`;
  out = out.replace(/export const DEFAULT_CURRENCY: CurrencyConfig = \{[\s\S]*?\};/, currencyLine);

  const taxLine = `export const DEFAULT_TAX: TaxConfig = { rate: ${tax.rate}, label: ${quote(tax.label)} };`;
  out = out.replace(/export const DEFAULT_TAX: TaxConfig = \{[\s\S]*?\};/, taxLine);

  const methods = shipping.methods
    .map(
      (m) =>
        `    { id: ${quote(m.id)}, label: ${quote(m.label)}, desc: ${quote(m.desc)}, price: ${m.price} },`,
    )
    .join('\n');
  const shippingBlock =
    `export const DEFAULT_SHIPPING: ShippingConfig = {\n` +
    `  methods: [\n${methods}\n  ],\n` +
    `  freeThreshold: ${shipping.freeThreshold},\n` +
    `  flatRate: ${shipping.flatRate},\n};`;
  out = out.replace(/export const DEFAULT_SHIPPING: ShippingConfig = \{[\s\S]*?\n\};/, shippingBlock);

  return out;
}

// --- Data-URL helpers ------------------------------------------------------

export function extFromDataUrl(dataUrl: string): string {
  const m = /^data:image\/([a-z0-9.+-]+);/i.exec(dataUrl);
  const type = (m?.[1] ?? 'png').toLowerCase();
  if (type === 'svg+xml') return 'svg';
  if (type === 'jpeg') return 'jpg';
  return type.replace(/[^a-z0-9]/g, '') || 'png';
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// --- File System Access ----------------------------------------------------

export function canSaveToDisk(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

const IDB_DB = 'nova-customizer';
const IDB_STORE = 'handles';
const IDB_KEY = 'projectRoot';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const r = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbSet(key: string, value: any): Promise<void> {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function verifyPermission(handle: any): Promise<boolean> {
  const opts = { mode: 'readwrite' } as any;
  if ((await handle.queryPermission?.(opts)) === 'granted') return true;
  if ((await handle.requestPermission?.(opts)) === 'granted') return true;
  return false;
}

async function looksLikeProject(root: any): Promise<boolean> {
  try {
    await root.getFileHandle('angular.json');
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the project root directory handle, reusing a previously granted one
 * (persisted in IndexedDB) or prompting the user to pick it once.
 */
export async function getProjectRoot(): Promise<any> {
  const cached = await idbGet(IDB_KEY).catch(() => null);
  if (cached && (await verifyPermission(cached)) && (await looksLikeProject(cached))) {
    return cached;
  }
  const picked = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
  if (!(await looksLikeProject(picked))) {
    throw new Error('That folder is not the project root — pick the folder containing angular.json.');
  }
  await idbSet(IDB_KEY, picked).catch(() => undefined);
  return picked;
}

async function getDir(root: any, parts: string[], create = false): Promise<any> {
  let dir = root;
  for (const part of parts) dir = await dir.getDirectoryHandle(part, { create });
  return dir;
}

export async function readProjectFile(root: any, path: string): Promise<{ handle: any; text: string }> {
  const parts = path.split('/');
  const dir = await getDir(root, parts.slice(0, -1));
  const handle = await dir.getFileHandle(parts[parts.length - 1]);
  const text = await (await handle.getFile()).text();
  return { handle, text };
}

export async function writeTextFile(handle: any, contents: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
}

export async function writeBinaryFile(root: any, path: string, bytes: Uint8Array): Promise<void> {
  const parts = path.split('/');
  const dir = await getDir(root, parts.slice(0, -1), true);
  const handle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await handle.createWritable();
  await writable.write(bytes);
  await writable.close();
}
