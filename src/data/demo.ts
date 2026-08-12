import type { Locale } from '../i18n';

const withBase = (path: string) => `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');

/**
 * The playable application demos. Two of them now, one per offer that is worth
 * showing rather than describing.
 *
 * `demo` keeps the bare slug in both languages — it is a product name rather
 * than a phrase, and translating it would gain nothing in search. The second
 * segment is translated, because "magazin" and "store" are words a visitor
 * would actually search for.
 */
export const demoPath = (locale: Locale) => withBase(locale === 'en' ? 'en/demo/' : 'demo/');

export const storeDemoPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/demo/store/' : 'demo/magazin/');

/** Which demo, if any, a service card links to. Keyed by the service `key`. */
export const demoForService = (locale: Locale, key: string | undefined) => {
  if (key === 'webapp') return demoPath(locale);
  if (key === 'shop') return storeDemoPath(locale);
  return undefined;
};
