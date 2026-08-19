import rss from '@astrojs/rss';
import { getContent, type Locale } from '../i18n';
import { getPosts, postPath } from './blog';
import { site } from './site';

/**
 * Builds the RSS feed for one locale. Shared by both feed endpoints so the two
 * languages cannot drift apart in structure.
 */
export async function buildFeed(locale: Locale, context: { site?: URL | undefined }) {
  const t = getContent(locale);
  const posts = await getPosts(locale);

  return rss({
    /*
      What a browser does with a feed address.

      Without this line it prints the source, which is correct behaviour and
      reads exactly like a broken page — and the link that leads here is a link
      a person clicks. `public/rss.xsl` turns the same bytes into something
      readable; feed readers ignore the declaration entirely.
    */
    stylesheet: '/rss.xsl',
    title: `${site.name} — ${t.blog.eyebrow}`,
    description: t.blog.metaDescription,
    site: context.site ?? '',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postPath(locale, post.data.urlSlug),
      categories: [post.data.category],
    })),
    customData: `<language>${locale === 'en' ? 'en-us' : 'ro-ro'}</language>`,
  });
}
