import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Case studies live as Markdown, one file per language under a folder named
 * after the locale: `case-studies/ro/<key>.md` and `case-studies/en/<key>.md`.
 * The shared file name is what pairs the two translations together, while the
 * `slug` field carries the localised URL segment.
 */
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
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
    /** Live site, when it is public. */
    url: z.url().optional(),
    /** Public source code, when there is any. */
    repo: z.url().optional(),
    tech: z.array(z.string()).min(1),
    problem: z.string(),
    solution: z.string(),
    result: z.string(),
    /** Headline numbers. Only ever measured values — never estimates. */
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    /** Lower numbers surface first. */
    order: z.number().default(0),
  }),
});

export const collections = { 'case-studies': caseStudies };
