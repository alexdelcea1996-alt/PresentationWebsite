---
urlSlug: this-site
title: The site you are reading right now
summary: A bilingual business site built to prove its own quality — with measured scores rather than promises.
client: Own project
category: Business website
year: 2026
url: https://presentationwebsite.alexdelcea1996.workers.dev
repo: https://github.com/alexdelcea1996-alt/PresentationWebsite
tech:
  - Astro
  - Tailwind CSS
  - TypeScript
  - Cloudflare
problem: >-
  A web developer looking for clients has a specific credibility problem: whatever they write about
  speed, SEO or accessibility, the client has no way to check it. And if their own site loads slowly
  or breaks on a phone, the argument defeats itself.
solution: >-
  I built this site as a verifiable demonstration rather than a brochure. Zero framework JavaScript,
  self-hosted fonts split by character range, content kept entirely separate from the interface, and
  a bilingual structure where a missing translation fails the build instead of leaving a gap on the
  page.
result: >-
  The numbers below are measured on the production build, not estimated. The code is public, so
  anyone can verify the claims — including a client who wants a second opinion from another
  developer.
coverDesktop: ../images/this-site-desktop.png
coverMobile: ../images/this-site-mobile.png
coverAlt: The site's home page on desktop and on a phone, in the dark theme.
metrics:
  - label: Lighthouse desktop
    value: 100/100
    score: 100
  - label: Lighthouse mobile
    value: 98/100
    score: 98
  - label: Accessibility violations
    value: '0'
  - label: Framework JavaScript
    value: 0 kB
order: 0
---

## The goal

The site had a single business objective: turn a visitor into an enquiry. Anything that did not
serve that goal was left out — including things that would have looked impressive in a pitch but
would have slowed the page down.

## The decisions that mattered

**Static, not dynamic.** Pages are generated at build time and served straight from a CDN. There is
no server to fall over and no database to maintain. Hosting costs nothing.

**Fonts live in the repository.** Space Grotesk and Inter are downloaded as variable fonts and served
from the same domain, split by `unicode-range`. The file carrying Romanian diacritics is fetched only
by pages that actually use them, and the build depends on no external service.

**Content is separate from code.** All copy sits in two files, one per language, checked against the
same type contract. A missing translation becomes a compile error rather than a blank space
discovered by a visitor.

**Accessibility from the start.** Verified contrast, full keyboard navigation, and animations that
stop for anyone who asked for that in their system settings. The automated audit passes with no
violations in either language.

## The outcome

A site that loads instantly, appears correctly in Google in both languages, and can be verified by
anyone — because the source is public. The pricing configurator on the page is itself working proof
that I can build web applications, not just brochure sites.
