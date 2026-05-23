export type KabumPricingMode =
  | 'kabum_plus_percentage'
  | 'kabum_minus_percentage'
  | 'min_margin';

export interface KabumSyncSettingsForPricing {
  percentage: number;
  mode: KabumPricingMode;
  min_margin: number;
}

export function roundBrazilianRetailPrice(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const base = Math.max(0, value);

  const down = Math.max(0, Math.floor(base / 10) * 10 - 1);
  const up = Math.max(0, Math.ceil(base / 10) * 10 - 1);

  const chosen = Math.abs(base - down) <= Math.abs(base - up) ? down : up;
  return Number(chosen.toFixed(2));
}

export function calculateBalaoPrice(
  kabumPrice: number,
  settings: KabumSyncSettingsForPricing
): number {
  if (!Number.isFinite(kabumPrice) || kabumPrice <= 0) return 0;

  const percentage = Number.isFinite(settings.percentage) ? settings.percentage : 0;
  const minMargin = Number.isFinite(settings.min_margin) ? settings.min_margin : 0;

  let base = kabumPrice;
  if (settings.mode === 'kabum_plus_percentage') {
    base = kabumPrice * (1 + percentage / 100);
  } else if (settings.mode === 'kabum_minus_percentage') {
    base = kabumPrice * (1 - percentage / 100);
  } else if (settings.mode === 'min_margin') {
    base = kabumPrice + minMargin;
  }

  return roundBrazilianRetailPrice(base);
}

export function formatBRL(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
}

