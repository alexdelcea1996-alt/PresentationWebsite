import type { Locale } from '../i18n';

const withBase = (path: string) => `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');

/**
 * The demos, one per offer that is worth showing rather than describing.
 *
 * Two of them are applications you play with; two are complete example sites,
 * shown inside a browser frame. `demo` keeps the bare slug in both languages —
 * it is a product name rather than a phrase, and translating it would gain
 * nothing in search. The segment after it is translated, because "magazin" and
 * "store" are words a visitor would actually search for.
 */
export const demoPath = (locale: Locale) => withBase(locale === 'en' ? 'en/demo/' : 'demo/');

export const storeDemoPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/demo/store/' : 'demo/magazin/');

export const landingDemoPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/demo/landing-page/' : 'demo/landing-page/');

export const siteDemoPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/demo/business-website/' : 'demo/site-de-prezentare/');

/**
 * The example sites themselves — the pages that appear *inside* the frame.
 *
 * They live under an `exemplu`/`example` segment so one rule keeps them out of
 * the sitemap (see `astro.config.ts`): they are fiction, and a search engine
 * indexing an invented plumbing company under my domain helps nobody.
 */
export const exampleLandingPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/demo/example/workshop/' : 'demo/exemplu/atelier/');

export const exampleSitePath = (locale: Locale, page: 'home' | 'services' | 'contact' = 'home') => {
  const root = locale === 'en' ? 'en/demo/example/plumber/' : 'demo/exemplu/instalatii/';
  if (page === 'home') return withBase(root);
  const segment = locale === 'en'
    ? { services: 'services/', contact: 'contact/' }[page]
    : { services: 'servicii/', contact: 'contact/' }[page];
  return withBase(root + segment);
};

/** Which demo, if any, a service card links to. Keyed by the service `key`. */
export const demoForService = (locale: Locale, key: string | undefined) => {
  if (key === 'webapp') return demoPath(locale);
  if (key === 'shop') return storeDemoPath(locale);
  if (key === 'landing') return landingDemoPath(locale);
  if (key === 'presentation') return siteDemoPath(locale);
  return undefined;
};
