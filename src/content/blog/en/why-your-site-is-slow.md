---
urlSlug: why-your-site-is-slow
title: Why your site is slow, and what you can fix yourself today
description: The four causes that slow down almost any small site, in order of impact. Three of them can be fixed without a developer, in one afternoon.
publishedAt: 2026-08-04
category: Guide
---

"Speed optimisation" sounds like something you have to pay for. Most of the time it is not. Of ten
slow sites I have looked at, in eight the main cause was something the owner could have fixed
themselves, in an afternoon, without writing a line of code.

Here are the real causes, in the order they matter.

## 1. The images. Almost always the images.

This is cause number one and nothing else is close. A photo taken on a phone is typically 4000 pixels
wide and between 3 and 8 megabytes. Uploaded straight to a site, the browser downloads all of it and
then shrinks it to fit an 800-pixel space. You paid the bandwidth for something nobody sees.

Ten photos at 5 MB each means 50 MB on one page. On mobile data, that is a page that takes tens of
seconds.

**What to do:** before uploading a photo, resize it to at most 1600 pixels wide and convert it to
WebP. [Squoosh](https://squoosh.app) does both in the browser, free, with nothing to install. A 5 MB
photo frequently ends up at 150 KB — thirty times smaller — at a quality difference nobody notices.

If you already have dozens of oversized photos uploaded, start with the ones on the home page. The
rest can wait.

## 2. The scripts you forgot were there

Every tool added to a site brings code that has to be downloaded and executed: the chat widget, the
embedded map, the cookie bar, the Facebook pixel, two analytics systems because you were not sure
which was better, a gallery plugin you tried once.

Each one looks small. Together they routinely outweigh the actual content of the page.

**What to do:** open your list of plugins or integrations and cut everything you have not used in the
last three months. The simple rule: if you cannot name a decision you made because of that tool, you
do not need it. The chat widget nobody answers is the most common candidate.

## 3. Fonts loaded from someone else's domain

If your site loads fonts directly from Google, the browser has to connect to a second server, wait
for the response, then download the files — and only then show your text. On a slow mobile connection
that means a second where the visitor stares at a blank page, or watches the text jump when the font
finally arrives.

**What to do:** this one needs someone technical, but it is a small job. Fonts can be hosted on your
own domain. This site, for example, serves its fonts from the same server and splits them so that
Romanian diacritics are only downloaded on pages that use them.

What you can do yourself: reduce the number of fonts. Two families are enough for any site. Four
different weights of each, no.

## 4. Cheap hosting

A €3-a-month hosting plan usually means a server shared with several hundred other sites. When one of
them has a traffic spike, everyone else slows down. There is no way to see this from your control
panel.

**How to check:** measure time to first byte (TTFB) in PageSpeed Insights. If it is consistently over
600 milliseconds and your images are already optimised, the server is the problem.

**What to do:** a static site — the kind that does not need a database on every visit — can be hosted
free on global infrastructure, with response times under 100 milliseconds. Not every site can move
easily, but it is worth asking.

## How to measure without drowning in charts

Go to [PageSpeed Insights](https://pagespeed.web.dev), enter your address and look at the **mobile
section**, not the desktop one. Most of your visitors are on a phone, and the desktop score is almost
always flattering.

Of all the numbers shown, follow one at first: **LCP** — how long until the largest visible element
appears, usually the main image. Under 2.5 seconds is fine. Over 4 and you have a problem that is
costing you visitors.

Ignore the rest for now. A score of 100 is not the goal; a site that feels fast is.

## What you cannot fix yourself

To be honest all the way: if the theme you use loads an entire framework for one carousel, or the
page structure is ten levels of nested containers, no amount of compressed images will save you.
Those need work in the code.

But it is worth trying the three things above first. Often they are enough, and if they are not, at
least you know the problem runs deeper and you are not paying someone to do what you could have done
yourself.

If you want to know which category you are in, I will tell you — send me your address and within 48
hours you get a written list of what I found, ordered by impact. It is free and I will not call you
afterwards.
