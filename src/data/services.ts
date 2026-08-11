import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type ServicePage = CollectionEntry<'services'>;

export async function getServicePages(locale: Locale): Promise<ServicePage[]> {
  const all = await getCollection('services');
  return all
    .filter((entry) => entry.id.startsWith(`${locale}/`))
    .sort((a, b) => a.data.order - b.data.order);
}

/** The same service in the other language, for the hreflang links. */
export async function getServiceTranslations(
  entry: ServicePage,
): Promise<Partial<Record<Locale, ServicePage>>> {
  const all = await getCollection('services');
  const result: Partial<Record<Locale, ServicePage>> = {};

  for (const candidate of all) {
    if (candidate.data.key !== entry.data.key) continue;
    result[candidate.id.split('/')[0] as Locale] = candidate;
  }

  return result;
}

/**
 * URL of a service page within its own locale, with a trailing slash so it
 * matches the canonical Astro emits.
 */
export function servicePath(locale: Locale, slug: string): string {
  const segment = locale === 'en' ? 'en/services' : 'servicii';
  return `${import.meta.env.BASE_URL}/${segment}/${slug}/`.replace(/\/{2,}/g, '/');
}
