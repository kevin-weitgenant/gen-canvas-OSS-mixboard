export interface Model {
  value: string;
  label: string;
  tag: string;
}

export const MODELS: Model[] = [
  { value: 'flux-dev', label: 'Flux Dev', tag: 'Open Source' },
  { value: 'flux-schnell', label: 'Flux Schnell', tag: 'Fast' },
  { value: 'flux-pro', label: 'Flux Pro', tag: 'Premium' },
  { value: 'sd-xl', label: 'Stable Diffusion XL', tag: 'Open Source' },
  { value: 'sd-3', label: 'Stable Diffusion 3', tag: 'Open Source' },
  { value: 'dalle-3', label: 'DALL·E 3', tag: 'OpenAI' },
  { value: 'imagen-3', label: 'Imagen 3', tag: 'Google' },
  { value: 'midjourney', label: 'Midjourney', tag: 'Premium' },
  { value: 'ideogram-v2', label: 'Ideogram v2', tag: 'Creative' },
  { value: 'recraft-v3', label: 'Recraft v3', tag: 'Design' },
];

export const TAG_STYLES: Record<string, string> = {
  'Open Source': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fast': 'bg-amber-50 text-amber-700 border-amber-200',
  'Premium': 'bg-violet-50 text-violet-700 border-violet-200',
  'OpenAI': 'bg-blue-50 text-blue-700 border-blue-200',
  'Google': 'bg-sky-50 text-sky-700 border-sky-200',
  'Creative': 'bg-pink-50 text-pink-700 border-pink-200',
  'Design': 'bg-orange-50 text-orange-700 border-orange-200',
};

export const DEFAULT_TAG_STYLE = 'bg-slate-100 text-slate-600 border-slate-200';
