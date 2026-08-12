import { ro } from './ro';
import { en } from './en';
import type { Content } from './types';

export const locales = ['ro', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ro';

/** BCP-47 tags for <html lang>, hreflang and Open Graph. */
export const localeTags: Record<Locale, string> = {
  ro: 'ro-RO',
  en: 'en-US',
};

const dictionaries: Record<Locale, Content> = { ro, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Copy for a locale, falling back to Romanian for anything unrecognised. */
export function getContent(locale: unknown): Content {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

/**
 * Section anchors are intentionally identical across locales so the language
 * switcher can carry the reader's current position from one language to the other.
 */
export const sectionIds = {
  services: 'services',
  process: 'process',
  comparison: 'comparison',
  portfolio: 'portfolio',
  guarantees: 'guarantees',
  about: 'about',
  testimonials: 'testimonials',
  pricing: 'pricing',
  estimate: 'estimate',
  faq: 'faq',
  audit: 'audit',
  contact: 'contact',
} as const;

export type { Content };
