/**
 * Pricing model behind the quote configurator.
 *
 * Numbers live here rather than in the locale files so the two languages can
 * never quote different prices. The visible labels are translated per locale
 * in `src/i18n/*.ts`, keyed by the ids below.
 *
 * These are deliberately coarse starting points, presented as a range and
 * always labelled as an estimate — never as a quote.
 */

export const projectTypeIds = ['landing', 'presentation', 'shop', 'webapp'] as const;
export type ProjectTypeId = (typeof projectTypeIds)[number];

export const featureIds = [
  'multilang',
  'cms',
  'blog',
  'payments',
  'booking',
  'accounts',
  'integrations',
  'seo',
  'copywriting',
  'maintenance',
] as const;
export type FeatureId = (typeof featureIds)[number];

export interface ProjectTypeOption {
  id: ProjectTypeId;
  /** Starting price in EUR, excluding VAT. */
  basePrice: number;
  /** Rough delivery time in weeks. */
  baseWeeks: number;
}

export interface FeatureOption {
  id: FeatureId;
  price: number;
  weeks: number;
  /** Project types this add-on is offered for. */
  appliesTo: readonly ProjectTypeId[];
}

// Each base price has to match the "from" figure on the pricing card and on the
// service page — a visitor can have all three open, and two numbers for one job
// read as a bait price. The `offers` suite checks it on every run; it was added
// after the store went a while with a page, a price and no card at all.
export const projectTypes: readonly ProjectTypeOption[] = [
  { id: 'landing', basePrice: 400, baseWeeks: 1 },
  { id: 'presentation', basePrice: 900, baseWeeks: 3 },
  { id: 'shop', basePrice: 2200, baseWeeks: 5 },
  { id: 'webapp', basePrice: 2500, baseWeeks: 8 },
];

export const features: readonly FeatureOption[] = [
  { id: 'multilang', price: 300, weeks: 1, appliesTo: ['landing', 'presentation', 'shop', 'webapp'] },
  { id: 'cms', price: 500, weeks: 1, appliesTo: ['landing', 'presentation'] },
  { id: 'blog', price: 350, weeks: 1, appliesTo: ['presentation'] },
  { id: 'payments', price: 600, weeks: 2, appliesTo: ['shop', 'webapp'] },
  { id: 'booking', price: 700, weeks: 2, appliesTo: ['presentation', 'webapp'] },
  { id: 'accounts', price: 900, weeks: 2, appliesTo: ['shop', 'webapp'] },
  { id: 'integrations', price: 800, weeks: 2, appliesTo: ['shop', 'webapp'] },
  { id: 'seo', price: 400, weeks: 1, appliesTo: ['landing', 'presentation', 'shop', 'webapp'] },
  { id: 'copywriting', price: 350, weeks: 1, appliesTo: ['landing', 'presentation', 'shop', 'webapp'] },
  { id: 'maintenance', price: 450, weeks: 0, appliesTo: ['landing', 'presentation', 'shop', 'webapp'] },
];

/** Upper bound of the quoted range, as a multiplier over the computed total. */
export const RANGE_MULTIPLIER = 1.3;

/** Prices are shown rounded to this step, so an estimate never looks exact. */
export const ROUNDING_STEP = 50;
