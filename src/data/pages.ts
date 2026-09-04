import type { Locale } from '../i18n';

const withBase = (path: string) => `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');

/**
 * The five pages the landing page used to be.
 *
 * For a long time this site was one scrolling page with the header linking to
 * anchors inside it. That reads well to somebody who arrived at the top and
 * kept going, and badly to everybody else: a person who wants the price list
 * has to scroll past nine sections to reach it, a search engine has one page to
 * rank for nine different questions, and a link somebody sends a colleague
 * carries the whole page rather than the part that was worth sending.
 *
 * So the sections moved out to the pages the header always implied. The slugs
 * are the words a Romanian visitor would actually type — `preturi`, `estimare`
 * — and the English side uses the English ones rather than transliterating.
 * Both are declared here, once, because a path spelled out at each call site is
 * a path that gets spelled differently at the twentieth one.
 *
 * The old anchors are not abandoned: `Home.astro` forwards a `#contact` or
 * `#pricing` that lands on the front page to the page that now holds it, so
 * links already published in articles and sent in emails still arrive.
 */
export const servicesIndexPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/services/' : 'servicii/');

export const projectsPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/projects/' : 'proiecte/');

export const pricingPath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/pricing/' : 'preturi/');

export const estimatePath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/estimate/' : 'estimare/');

export const contactPagePath = (locale: Locale) =>
  withBase(locale === 'en' ? 'en/contact/' : 'contact/');

/**
 * Which page a section that used to live on the front page now lives on.
 *
 * Keyed by the id it had there, so the forwarder on the home page and the
 * checks that prove the forwarding works read one table rather than two
 * hand-written copies of it.
 *
 * `services` and `portfolio` are deliberately absent: those two stayed, in
 * shorter form, so `/#services` still resolves where it always did and must
 * not be sent anywhere. The forwarder checks the page for the id before acting
 * anyway — but a table that listed them would be claiming something false.
 */
export const movedSections = {
  process: servicesIndexPath,
  comparison: servicesIndexPath,
  pricing: pricingPath,
  guarantees: pricingPath,
  faq: pricingPath,
  estimate: estimatePath,
  audit: estimatePath,
  contact: contactPagePath,
  about: contactPagePath,
  testimonials: contactPagePath,
} as const satisfies Record<string, (locale: Locale) => string>;
