import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import type { ImageFunction } from 'astro:content';

/**
 * Case studies live as Markdown, one file per language under a folder named
 * after the locale: `case-studies/ro/<key>.md` and `case-studies/en/<key>.md`.
 * The shared file name is what pairs the two translations together, while the
 * `slug` field carries the localised URL segment.
 */
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: ({ image }: { image: ImageFunction }) => z.object({
    /**
     * Localised URL segment, e.g. `acest-site` / `this-site`.
     * Not named `slug`: Astro reserves that key in collection schemas.
     */
    urlSlug: z.string(),
    title: z.string(),
    /** Shown on the card and as the meta description. */
    summary: z.string(),
    client: z.string(),
    category: z.string(),
    year: z.number(),
    /**
     * Live site, when it is public. The literal `self` means "this site" and
     * resolves to `SITE_URL` at build time — a case study about the site you
     * are reading should not carry a hostname typed by hand, or moving the
     * domain leaves it pointing at the old address.
     */
    url: z.union([z.url(), z.literal('self')]).optional(),
    /** Public source code, when there is any. */
    repo: z.url().optional(),
    tech: z.array(z.string()).min(1),
    problem: z.string(),
    solution: z.string(),
    result: z.string(),
    /** Headline numbers. Only ever measured values — never estimates. */
    metrics: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          /**
           * Draws the value as a dial, for anything scored out of 100. Kept as
           * a separate number rather than parsed out of `value`, so the display
           * string stays free to say whatever reads best.
           */
          score: z.number().min(0).max(100).optional(),
        }),
      )
      .default([]),
    /**
     * Real screenshots of the finished work — desktop and phone. Optional, so a
     * case study can be written before the pictures exist, but a project with no
     * picture is a project nobody looks at.
     */
    coverDesktop: image().optional(),
    coverMobile: image().optional(),
    /** Describes the screenshots for anyone who cannot see them. */
    coverAlt: z.string().optional(),
    /** Lower numbers surface first. */
    order: z.number().default(0),
  }),
});

/**
 * One landing page per service, per language, targeting the searches people
 * actually type ("creare site de prezentare preț"). Same folder-per-locale
 * convention as the case studies.
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    /** Matches `key` on the matching card in the services section. */
    key: z.enum(['landing', 'presentation', 'shop', 'webapp', 'optimization']),
    /** Localised URL segment. Not `slug` — Astro reserves that key. */
    urlSlug: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    eyebrow: z.string(),
    title: z.string(),
    lead: z.string(),
    /** Three short facts shown under the headline. */
    highlights: z.array(z.object({ label: z.string(), value: z.string() })).length(3),
    includesTitle: z.string(),
    includes: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
    idealForTitle: z.string(),
    idealFor: z.array(z.string()).min(1),
    /** Being explicit about who this is wrong for builds more trust than it costs. */
    notForTitle: z.string(),
    notFor: z.array(z.string()).min(1),
    faqTitle: z.string(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
    ctaTitle: z.string(),
    ctaBody: z.string(),
    ctaButton: z.string(),
    order: z.number().default(0),
  }),
});

/**
 * Articles, one file per language under a locale folder. Same convention as the
 * other collections: the shared file name pairs the two translations.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** Localised URL segment. Not `slug` — Astro reserves that key. */
    urlSlug: z.string(),
    title: z.string(),
    /**
     * Optional shorter form for the <title> tag and og:title, for when the
     * headline plus the brand suffix would pass 60 characters and truncate in
     * search results. The H1 keeps the full headline — a reader deserves the
     * whole sentence; a results page does not have room for it.
     */
    metaTitle: z.string().optional(),
    /** Used on the card and as the meta description, so keep it under ~155 characters. */
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Short label shown on the card, e.g. "Ghid" / "Guide". */
    category: z.string(),
    /** Excluded from listings, feeds and the sitemap while true. */
    draft: z.boolean().default(false),
  }),
});

/**
 * Legal pages — the privacy policy today, terms if they ever become necessary.
 * Same folder-per-locale convention as everything else: the shared file name
 * pairs the translations, `urlSlug` carries the localised address.
 *
 * These are prose rather than i18n strings on purpose: a policy is a document
 * that gets read and amended as a whole, not a set of interface labels.
 */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    /** Pairs the page with its route; `privacy` today. */
    key: z.enum(['privacy']),
    /** Localised URL segment. Not `slug` — Astro reserves that key. */
    urlSlug: z.string(),
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    /** Shown at the top. A policy without a date is a policy nobody can trust. */
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { 'case-studies': caseStudies, services, blog, legal };
