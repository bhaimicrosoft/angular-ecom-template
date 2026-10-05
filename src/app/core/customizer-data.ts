/**
 * Static configuration for the dev-only visual customizer: which design tokens
 * are editable, the font choices, and one-click brand palettes.
 */

export interface ColorTokenDef {
  token: string;
  label: string;
  group: 'Brand' | 'Surfaces' | 'State';
}

export const COLOR_TOKENS: ColorTokenDef[] = [
  { token: 'accent', label: 'Accent', group: 'Brand' },
  { token: 'accent-foreground', label: 'Accent text', group: 'Brand' },
  { token: 'primary', label: 'Primary', group: 'Brand' },
  { token: 'ring', label: 'Focus ring', group: 'Brand' },
  { token: 'background', label: 'Background', group: 'Surfaces' },
  { token: 'foreground', label: 'Foreground', group: 'Surfaces' },
  { token: 'card', label: 'Card surface', group: 'Surfaces' },
  { token: 'secondary', label: 'Secondary', group: 'Surfaces' },
  { token: 'muted-foreground', label: 'Muted text', group: 'Surfaces' },
  { token: 'border', label: 'Border', group: 'Surfaces' },
  { token: 'destructive', label: 'Danger', group: 'State' },
  { token: 'success', label: 'Success', group: 'State' },
];

export const COLOR_GROUPS = ['Brand', 'Surfaces', 'State'] as const;

export interface FontOption {
  label: string;
  stack: string;
  google?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    label: 'Inter',
    stack: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    google: 'Inter:wght@400;500;600;700;800',
  },
  {
    label: 'System UI',
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Poppins',
    stack: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    google: 'Poppins:wght@400;500;600;700;800',
  },
  {
    label: 'Manrope',
    stack: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    google: 'Manrope:wght@400;500;600;700;800',
  },
  {
    label: 'Sora',
    stack: "'Sora', ui-sans-serif, system-ui, sans-serif",
    google: 'Sora:wght@400;500;600;700;800',
  },
  {
    label: 'Space Grotesk',
    stack: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    google: 'Space+Grotesk:wght@400;500;600;700',
  },
  {
    label: 'DM Sans',
    stack: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    google: 'DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700',
  },
];

export interface Preset {
  name: string;
  swatch: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export const PRESETS: Preset[] = [
  {
    name: 'Nova Orange',
    swatch: '#f97316',
    light: { accent: '#f97316', ring: '#f97316', 'accent-foreground': '#1a1205' },
    dark: { accent: '#fb923c', ring: '#fb923c', 'accent-foreground': '#1a1205' },
  },
  {
    name: 'Ocean',
    swatch: '#2563eb',
    light: { accent: '#2563eb', ring: '#2563eb', 'accent-foreground': '#f8fafc' },
    dark: { accent: '#60a5fa', ring: '#60a5fa', 'accent-foreground': '#0b1220' },
  },
  {
    name: 'Violet',
    swatch: '#7c3aed',
    light: { accent: '#7c3aed', ring: '#7c3aed', 'accent-foreground': '#f8fafc' },
    dark: { accent: '#a78bfa', ring: '#a78bfa', 'accent-foreground': '#140b1f' },
  },
  {
    name: 'Emerald',
    swatch: '#059669',
    light: { accent: '#059669', ring: '#059669', 'accent-foreground': '#f8fafc' },
    dark: { accent: '#34d399', ring: '#34d399', 'accent-foreground': '#04140d' },
  },
  {
    name: 'Rose',
    swatch: '#e11d48',
    light: { accent: '#e11d48', ring: '#e11d48', 'accent-foreground': '#fff1f2' },
    dark: { accent: '#fb7185', ring: '#fb7185', 'accent-foreground': '#1f0a10' },
  },
  {
    name: 'Cyan',
    swatch: '#0891b2',
    light: { accent: '#0891b2', ring: '#0891b2', 'accent-foreground': '#f0fdff' },
    dark: { accent: '#22d3ee', ring: '#22d3ee', 'accent-foreground': '#04141a' },
  },
  {
    name: 'Amber',
    swatch: '#d97706',
    light: { accent: '#d97706', ring: '#d97706', 'accent-foreground': '#1f1403' },
    dark: { accent: '#fbbf24', ring: '#fbbf24', 'accent-foreground': '#1f1403' },
  },
  {
    name: 'Slate',
    swatch: '#475569',
    light: { accent: '#475569', ring: '#475569', 'accent-foreground': '#f8fafc' },
    dark: { accent: '#94a3b8', ring: '#94a3b8', 'accent-foreground': '#0b1220' },
  },
];
