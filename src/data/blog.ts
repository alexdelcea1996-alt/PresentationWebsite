import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type Post = CollectionEntry<'blog'>;

/** The shared file name that pairs a post with its other-language twin. */
export const postKey = (entry: Post) => entry.id.split('/').slice(1).join('/');

/** Published posts for a locale, newest first. Drafts never leave the editor. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const all = await getCollection('blog');
  return all
    .filter((entry) => entry.id.startsWith(`${locale}/`) && !entry.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/**
 * One post, found by the file name it shares with its translation. Lets a page
 * link to a specific article without hardcoding a localised URL — the slug in
 * the front matter stays the only place the address is written.
 */
export async function getPostByKey(locale: Locale, key: string): Promise<Post | undefined> {
  const all = await getCollection('blog');
  return all.find(
    (entry) => entry.id.startsWith(`${locale}/`) && postKey(entry) === key && !entry.data.draft,
  );
}

export async function getPostTranslations(entry: Post): Promise<Partial<Record<Locale, Post>>> {
  const all = await getCollection('blog');
  const key = postKey(entry);
  const result: Partial<Record<Locale, Post>> = {};

  for (const candidate of all) {
    if (postKey(candidate) !== key || candidate.data.draft) continue;
    result[candidate.id.split('/')[0] as Locale] = candidate;
  }

  return result;
}

const withBase = (path: string) => `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');

/** Index of the blog, per locale. */
export const blogIndexPath = (locale: Locale) => withBase(locale === 'en' ? 'en/blog/' : 'blog/');

/** A single post, with the trailing slash Astro uses for canonical URLs. */
export const postPath = (locale: Locale, slug: string) =>
  withBase(`${locale === 'en' ? 'en/blog' : 'blog'}/${slug}/`);

/** Rough reading time. 200 words a minute is the usual figure for prose. */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date, localeTag: string): string {
  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
