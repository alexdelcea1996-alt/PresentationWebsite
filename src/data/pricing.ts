import { getContent, type Locale } from '../i18n';

/** First run of digits, thousands separators stripped: "de la 2.200 €" → 2200. */
const amount = (price: string) =>
  Number(price.replace(/[.,\s](?=\d{3}\b)/g, '').match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY);

/**
 * Where the prices start, worded exactly as the price list words it.
 *
 * The landing page used to send a visitor who asked "what does it cost" to
 * another page without a single figure on the way, and the pricing page's own
 * search snippet announced "three packages" long after there were four. Both
 * now read the number from the plans themselves, so the one place a price is
 * typed is the card it belongs to — and the lowest is found by value rather
 * than by position, so reordering the cards cannot quietly change what the
 * landing page claims.
 */
export const startingPrice = (locale: Locale) =>
  getContent(locale).pricing.plans.reduce((low, plan) =>
    amount(plan.price) < amount(low.price) ? plan : low,
  ).price;
