---
urlSlug: why-i-cut-the-landing-page-into-six
title: Why I cut my site's landing page into six, with the numbers before and after
metaTitle: Why I cut the landing page into six
description: The landing page had 13 sections and 17 screens; now 6 and 6. The numbers before and after, what halved, what did not move, and how to spot it on your site.
publishedAt: 2026-09-05
category: Behind the scenes
---

Until this week, the site you are reading was one page. A long one: 13 sections, 17 screens of
scrolling, and a top menu that led nowhere — it jumped to anchors inside the same page. I built it
that way on purpose, and I had a good reason. Then I measured, and the reason was no longer enough.

This article is about what I changed and why, with the real figures. Not to show off — a page that
halved is a page that was twice too big — but because the same mistake is on a lot of business
sites, and its signs are easy to recognise once you know them.

## Why it seemed like a good idea

The argument for one long page is real: a visitor arrives at the top, scrolls, and the order of the
sections is a funnel. Who you are first, then what you do, then the proof, then the price, then the
form. Nobody gets lost, because there is nowhere to get lost.

It works for somebody who starts at the top. The trouble is that almost nobody starts at the top.

## Why it was not

Three things, all found by looking at how the page was used rather than how I imagined it was.

**The prices were nine sections away.** Somebody searching for "how much does a website cost" who
lands on the page does not want to read about my process first. They want the price list. On a long
page the list was there — eleven thousand pixels below where they landed.

**A link could not send one part.** When somebody wanted to show a business partner the offer, they
sent the site's address. The whole site. The partner opened seventeen screens with no way of knowing
that the relevant part was somewhere in the middle.

**One page was competing for nine questions.** Google indexes pages, not sections. A page that talks
about services, prices, process, guarantees, portfolio, estimate and contact all at once is a page
that is not *about* anything in particular — and for each of those questions it loses to a page that
is about just one.

## What I did

I moved the sections to the pages the menu had been promising all along:

- **Services** — what I build, how a project runs, and why a site made by a person beats a template
- **Projects** — the case studies and two complete example sites you can use right on the page
- [**Pricing**](/en/pricing/) — the packages, what I guarantee in writing, and the questions that come before a quote
- [**Estimate**](/en/estimate/) — the configurator and the instant audit
- **Contact** — the form, and underneath it, the person who reads it

The landing page stayed the shortest route to any of them: who I am, the measured proof, a summary
of the services, one case study, three marked ways on and a button. Every piece on it is the real
section, shortened — not new text written *about* the section.

## The numbers, before and after

Measured on the same machine, in the same browser, at the same screen width, on the page as it was
and the page as it is. Nothing estimated.

| | Before | After |
|---|---|---|
| Sections on the landing page | 13 | 6 |
| Length, on a 1280 × 900 screen | 17.4 screens | 5.9 screens |
| Words on the landing page | 2,253 | 570 |
| The HTML document, compressed | 24.3 kB | 12.1 kB |
| JavaScript embedded in the page | 16.1 kB | 10.1 kB |
| Lighthouse on mobile, landing page | 98–99 | 99–100 |

The five new pages each came out at 100 on mobile — not because they do anything special, but
because each loads only what it needs. The contact form, the configurator and the audit were three
of the biggest scripts on the site, and all three were being downloaded on the landing page by a
visitor who only wanted to see the prices.

## What did not change, to be fair

**Total bytes downloaded, hardly at all:** 95 kilobytes before, 91 after. The HTML document halved,
but the fonts and the stylesheet are shared by every page and did not move. If you expected a page
half as long to download twice as fast — no. It *renders* faster and it *reads* faster, which is a
different thing and, for a visitor, the more important one.

**The Lighthouse score was already close to the ceiling.** One extra point is not the argument. The
argument is that the person looking for prices finds them in the first section of a page called
"Pricing".

## What had to keep working, unseen

The split itself took less time than the things that were not allowed to break with it.

**The old links.** `site.com/#pricing` is in articles already published, in emails already sent and
in bookmarks, and none of them can be edited. The landing page recognises them and forwards them to
the page that now holds the section, with whatever parameters they carried. An old link that lands
at the top of a page which no longer contains what it promised looks as though the thing was
deleted.

**The estimate that becomes an enquiry.** The configurator used to fill in the contact form
directly — the form was three sections down, in the same document. It is now a page away, and the
estimate has to cross a navigation carrying the project type, the budget and the itemised summary,
and then be forgotten, so that a visit an hour later does not find the form filled with somebody
else's answers.

**One main heading per page.** The sections had second-level headings, because they were sections.
When a section becomes a page, its heading has to become the first level, and everything under it
moves down one — otherwise a screen reader announces a page with no title.

All of this is covered by automated checks — how many, as of today, is written in the
[colophon](/en/colophon/), which is recomputed on every build. A split without them would have been
a day's work and a month of broken links.

## How to tell whether your site has the same problem

Three signs; any one is enough:

1. **The top menu jumps to anchors**, not pages. If the address in the browser does not change when
   you press "Pricing", you are on one long page.
2. **You cannot send somebody a link to one part.** Try it: send yourself, on WhatsApp, the link to
   your own prices. If no such link exists, your customers cannot send it either.
3. **Google shows you with the wrong description.** You search for your company and the result talks
   about something other than what you searched for — because the page talks about everything at
   once and the engine picked a part for you.

None of them is a reason to panic. They are a reason to measure, and then, if the figures show what
mine showed, to cut. If you want to see where you would start, the [estimate](/en/estimate/) takes
thirty seconds and asks for no email address.
