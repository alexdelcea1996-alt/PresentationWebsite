import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type CaseStudy = CollectionEntry<'case-studies'>;

/** The shared file name that pairs a case study with its other-language twin. */
export const translationKey = (entry: CaseStudy) => entry.id.split('/').slice(1).join('/');

export async function getCaseStudies(locale: Locale): Promise<CaseStudy[]> {
  const all = await getCollection('case-studies');
  return all
    .filter((entry) => entry.id.startsWith(`${locale}/`))
    .sort((a, b) => a.data.order - b.data.order);
}

/** Look up the same case study in the other language, for the hreflang links. */
export async function getTranslations(
  entry: CaseStudy,
): Promise<Partial<Record<Locale, CaseStudy>>> {
  const all = await getCollection('case-studies');
  const key = translationKey(entry);
  const result: Partial<Record<Locale, CaseStudy>> = {};

  for (const candidate of all) {
    if (translationKey(candidate) !== key) continue;
    const locale = candidate.id.split('/')[0] as Locale;
    result[locale] = candidate;
  }

  return result;
}

/**
 * URL of a case study within its own locale, respecting the configured base.
 * Keeps the trailing slash so these match the canonical URLs Astro emits.
 */
export function caseStudyPath(locale: Locale, slug: string): string {
  const segment = locale === 'en' ? 'en/case-studies' : 'studii-de-caz';
  return `${import.meta.env.BASE_URL}/${segment}/${slug}/`.replace(/\/{2,}/g, '/');
}
