import { Product, ProductVariant } from '../models';

interface Seed {
  cat: string;
  brand: string;
  names: string[];
  tags: string[];
  base: number;
  colors?: { value: string; swatch: string }[];
  sizes?: string[];
}

const SEEDS: Seed[] = [
  {
    cat: 'audio',
    brand: 'Sonaré',
    names: ['Aura Wireless Headphones', 'Pulse Pro Earbuds', 'Vibe Studio Monitor', 'Echo Bass Speaker'],
    tags: ['wireless', 'noise-cancelling', 'bestseller'],
    base: 149,
    colors: [
      { value: 'Midnight', swatch: '#1f2937' },
      { value: 'Ivory', swatch: '#f5f5f4' },
      { value: 'Sage', swatch: '#9caf88' },
    ],
  },
  {
    cat: 'wearables',
    brand: 'Kairo',
    names: ['Chrono Smartwatch S3', 'Fit Band Active', 'Pulse Watch Ultra', 'Zen Ring Tracker'],
    tags: ['fitness', 'gps', 'new'],
    base: 199,
    colors: [
      { value: 'Graphite', swatch: '#374151' },
      { value: 'Rose Gold', swatch: '#e8b4a0' },
      { value: 'Silver', swatch: '#d4d4d8' },
    ],
    sizes: ['40mm', '44mm'],
  },
  {
    cat: 'computers',
    brand: 'Nimbus',
    names: ['Air Book 14"', 'Studio Laptop Pro', 'Nano Mini PC', 'Canvas Tablet 11"'],
    tags: ['portable', 'retina', 'pro'],
    base: 999,
    colors: [
      { value: 'Space Grey', swatch: '#4b5563' },
      { value: 'Starlight', swatch: '#efe9dd' },
    ],
    sizes: ['256GB', '512GB', '1TB'],
  },
  {
    cat: 'phones',
    brand: 'Lumen',
    names: ['Lumen X Pro', 'Lumen Lite', 'Lumen Fold', 'Lumen Edge 5G'],
    tags: ['5g', 'oled', 'flagship'],
    base: 799,
    colors: [
      { value: 'Obsidian', swatch: '#111827' },
      { value: 'Lavender', swatch: '#c4b5fd' },
      { value: 'Coral', swatch: '#fb7185' },
    ],
    sizes: ['128GB', '256GB', '512GB'],
  },
  {
    cat: 'cameras',
    brand: 'Optiq',
    names: ['Mirrorless M50', 'Vlog Cam Go', 'Action Cam X', 'Cine Lens 35mm'],
    tags: ['4k', 'stabilised', 'creator'],
    base: 649,
    colors: [
      { value: 'Black', swatch: '#18181b' },
      { value: 'Titanium', swatch: '#9ca3af' },
    ],
  },
  {
    cat: 'gaming',
    brand: 'Volt',
    names: ['Nova Console X', 'Pro Controller Elite', 'RGB Mech Keyboard', 'Precision Gaming Mouse'],
    tags: ['esports', 'rgb', 'wireless'],
    base: 89,
    colors: [
      { value: 'Carbon', swatch: '#27272a' },
      { value: 'Arctic', swatch: '#e5e7eb' },
    ],
  },
  {
    cat: 'home',
    brand: 'Haven',
    names: ['Smart Hub Mini', 'Aura Light Strip', 'Thermo Smart Sensor', 'Guard Door Cam'],
    tags: ['smart', 'wifi', 'automation'],
    base: 59,
    colors: [{ value: 'White', swatch: '#fafafa' }, { value: 'Charcoal', swatch: '#3f3f46' }],
  },
  {
    cat: 'accessories',
    brand: 'Field',
    names: ['Everyday Backpack', 'Woven Charge Cable', 'Leather Sleeve 14"', 'Magnetic Power Bank'],
    tags: ['travel', 'eco', 'essential'],
    base: 39,
    colors: [
      { value: 'Tan', swatch: '#c9a36b' },
      { value: 'Slate', swatch: '#64748b' },
      { value: 'Olive', swatch: '#6b7154' },
    ],
  },
];

/** Small deterministic PRNG so the catalogue is stable between reloads. */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const DESCRIPTIONS = [
  'Crafted from premium materials with an obsessive attention to detail, this piece blends timeless design with modern engineering.',
  'Engineered for people who refuse to compromise. Every element has been refined to deliver an experience that feels effortless.',
  'A studio-grade companion that keeps up with your ambition — powerful, refined and beautifully understated.',
  'Minimal on the outside, mighty on the inside. Designed to disappear into your day and reappear exactly when you need it.',
];

function buildVariants(
  rnd: () => number,
  base: number,
  colors?: { value: string; swatch: string }[],
  sizes?: string[],
): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const colorList = colors ?? [{ value: 'Default', swatch: '#a1a1aa' }];
  const sizeList = sizes ?? ['One Size'];
  let i = 0;
  for (const c of colorList) {
    for (const size of sizeList) {
      const bump = size === 'One Size' ? 0 : Math.round(i * (base * 0.08));
      variants.push({
        id: `v-${i}`,
        title: sizes ? `${c.value} · ${size}` : c.value,
        price: base + bump,
        available: rnd() > 0.12,
        options: [
          { name: 'Color', value: c.value, swatch: c.swatch },
          ...(sizes ? [{ name: 'Size', value: size }] : []),
        ],
      });
      i++;
    }
  }
  return variants;
}

function generate(): Product[] {
  const products: Product[] = [];
  let idx = 0;
  for (const seed of SEEDS) {
    seed.names.forEach((name, n) => {
      const rnd = seededRandom((idx + 1) * 7919);
      const onSale = rnd() > 0.55;
      const base = Math.round(seed.base * (0.85 + rnd() * 0.6));
      const compareAt = onSale ? Math.round(base * (1.15 + rnd() * 0.25)) : undefined;
      const ratingAvg = Math.round((3.6 + rnd() * 1.4) * 10) / 10;
      const images = Array.from({ length: 4 }, (_, k) => ({
        url: `https://picsum.photos/seed/${seed.cat}-${idx}-${k}/900/900`,
        alt: name,
      }));
      const variants = buildVariants(rnd, base, seed.colors, seed.sizes);
      const stock = Math.floor(rnd() * 40);
      products.push({
        id: `p-${idx}`,
        slug: `${seed.cat}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
        title: name,
        description: DESCRIPTIONS[n % DESCRIPTIONS.length],
        brand: seed.brand,
        categoryId: seed.cat,
        tags: seed.tags,
        price: variants[0]?.price ?? base,
        compareAtPrice: compareAt,
        currency: 'USD',
        images,
        thumbnail: images[0].url,
        rating: { average: ratingAvg, count: 12 + Math.floor(rnd() * 480) },
        stock,
        featured: n === 0 || rnd() > 0.82,
        createdAt: new Date(Date.now() - idx * 86_400_000).toISOString(),
        variants,
      });
      idx++;
    });
  }
  return products;
}

export const MOCK_PRODUCTS: Product[] = generate();
