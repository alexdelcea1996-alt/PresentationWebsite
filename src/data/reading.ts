import type { ServicePage } from './services';

/**
 * What to read next, chosen by hand for each page that has a reader to lose.
 *
 * Every article on the blog links to a page that sells; until now no page that
 * sells linked back. A visitor reading the price list with a question the cards
 * cannot answer — why do quotes differ so much, what does it cost after launch
 * — had the answer written, published and one menu away, with nothing on the
 * page pointing at it. Search engines read the same silence: the two articles
 * about cost had a single link between them from the rest of the site.
 *
 * Chosen rather than computed. "Same category" or "shares a tag" picks what is
 * similar; what a reader needs next is what comes after their question, which
 * is a judgement — the page about a store points at store costs, the platform
 * choice and the legal minimum, not at three more articles about stores.
 *
 * Keyed by the file name both translations share, so one list serves both
 * languages. `ReadNext` fails the build on a key that matches no article: a
 * renamed post must break loudly here, not quietly shorten a list.
 */
type PostKey =
  | 'before-you-order-a-website'
  | 'contact-form-gets-no-messages'
  | 'gdpr-for-small-sites'
  | 'google-business-profile'
  | 'how-much-does-a-website-cost'
  | 'how-much-does-an-online-store-cost'
  | 'landing-page-or-website'
  | 'website-or-social-media'
  | 'what-to-write-on-your-site'
  | 'what-you-pay-after-launch'
  | 'who-owns-your-website'
  | 'why-google-cant-find-you'
  | 'why-i-cut-the-landing-page-into-six'
  | 'why-your-site-is-slow'
  | 'wordpress-or-custom';

type Reading = readonly [PostKey, PostKey, ...PostKey[]];

export const readingForService: Record<ServicePage['data']['key'], Reading> = {
  landing: ['landing-page-or-website', 'how-much-does-a-website-cost', 'contact-form-gets-no-messages'],
  presentation: ['how-much-does-a-website-cost', 'landing-page-or-website', 'what-to-write-on-your-site'],
  shop: ['how-much-does-an-online-store-cost', 'wordpress-or-custom', 'gdpr-for-small-sites'],
  webapp: ['who-owns-your-website', 'what-you-pay-after-launch', 'before-you-order-a-website'],
  optimization: ['why-your-site-is-slow', 'why-google-cant-find-you', 'contact-form-gets-no-messages'],
};

/** The category pages that sell. Projects and contact have a job of their own. */
export const readingForPage = {
  services: ['landing-page-or-website', 'wordpress-or-custom', 'website-or-social-media'],
  pricing: ['how-much-does-a-website-cost', 'how-much-does-an-online-store-cost', 'what-you-pay-after-launch'],
  estimate: ['before-you-order-a-website', 'how-much-does-a-website-cost', 'why-your-site-is-slow'],
} as const satisfies Record<string, Reading>;

/** The end of every article: what comes after the question it answered. */
export const readingForPost: Record<PostKey, Reading> = {
  'before-you-order-a-website': ['what-to-write-on-your-site', 'how-much-does-a-website-cost', 'who-owns-your-website'],
  'contact-form-gets-no-messages': ['why-your-site-is-slow', 'why-google-cant-find-you', 'what-to-write-on-your-site'],
  'gdpr-for-small-sites': ['contact-form-gets-no-messages', 'who-owns-your-website', 'how-much-does-an-online-store-cost'],
  'google-business-profile': ['why-google-cant-find-you', 'website-or-social-media', 'what-to-write-on-your-site'],
  'how-much-does-a-website-cost': ['what-you-pay-after-launch', 'landing-page-or-website', 'wordpress-or-custom'],
  'how-much-does-an-online-store-cost': ['what-you-pay-after-launch', 'gdpr-for-small-sites', 'how-much-does-a-website-cost'],
  'landing-page-or-website': ['how-much-does-a-website-cost', 'what-to-write-on-your-site', 'website-or-social-media'],
  'website-or-social-media': ['google-business-profile', 'landing-page-or-website', 'how-much-does-a-website-cost'],
  'what-to-write-on-your-site': ['before-you-order-a-website', 'contact-form-gets-no-messages', 'why-google-cant-find-you'],
  'what-you-pay-after-launch': ['who-owns-your-website', 'how-much-does-a-website-cost', 'wordpress-or-custom'],
  'who-owns-your-website': ['what-you-pay-after-launch', 'wordpress-or-custom', 'before-you-order-a-website'],
  'why-google-cant-find-you': ['google-business-profile', 'why-your-site-is-slow', 'why-i-cut-the-landing-page-into-six'],
  'why-i-cut-the-landing-page-into-six': ['why-your-site-is-slow', 'why-google-cant-find-you', 'contact-form-gets-no-messages'],
  'why-your-site-is-slow': ['why-google-cant-find-you', 'wordpress-or-custom', 'contact-form-gets-no-messages'],
  'wordpress-or-custom': ['who-owns-your-website', 'what-you-pay-after-launch', 'how-much-does-a-website-cost'],
};

/** Narrows a post's file name to a key the map above knows, if it is one. */
export const isPostKey = (key: string): key is PostKey => key in readingForPost;
