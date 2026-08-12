import type { Locale } from '../i18n';

const withBase = (path: string) => `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');

/**
 * The playable application demo. Same slug in both languages: it is a product
 * name rather than a phrase, and translating it would gain nothing in search.
 */
export const demoPath = (locale: Locale) => withBase(locale === 'en' ? 'en/demo/' : 'demo/');
