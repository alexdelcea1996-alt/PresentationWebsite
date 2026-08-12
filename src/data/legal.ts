import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type LegalPage = CollectionEntry<'legal'>;
export type LegalKey = LegalPage['data']['key'];

/** The legal document for one locale, e.g. the privacy policy in Romanian. */
export async function getLegalPage(locale: Locale, key: LegalKey): Promise<LegalPage> {
  const all = await getCollection('legal');
  const entry = all.find((page) => page.id.startsWith(`${locale}/`) && page.data.key === key);
  if (!entry) throw new Error(`No "${key}" legal page for locale "${locale}"`);
  return entry;
}

/** Every translation of one document, keyed by locale — for the hreflang links. */
export async function getLegalTranslations(key: LegalKey) {
  const all = await getCollection('legal');
  const result: Partial<Record<Locale, LegalPage>> = {};
  for (const page of all) {
    if (page.data.key !== key) continue;
    result[page.id.split('/')[0] as Locale] = page;
  }
  return result;
}

/**
 * Address of a legal page. The slug is translated (`confidentialitate` /
 * `privacy`) because these are words people read, not product names.
 */
export function legalPath(locale: Locale, slug: string): string {
  const prefix = locale === 'en' ? 'en/' : '';
  return `${import.meta.env.BASE_URL}/${prefix}${slug}/`.replace(/\/{2,}/g, '/');
}
