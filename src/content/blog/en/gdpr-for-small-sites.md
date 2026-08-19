---
urlSlug: gdpr-for-a-small-website
title: 'GDPR for a small website: what actually has to be done'
metaTitle: GDPR for a small website
description: Not every site needs a cookie banner, but almost every site with a form needs something else. What is required in practice, and where to check it at the source.
publishedAt: 2026-08-19
category: Guide
---

First of all: I am not a lawyer and none of this is legal advice. It is what I have seen while
building sites, and what you can verify yourself at the source. For complicated situations — health
data, children, large-scale processing — ask a solicitor. It is worth the money.

Now the useful part.

## The two laws everybody mixes up

Almost all the confusion comes from these being two different things:

**GDPR** — Regulation (EU) 2016/679. It governs **personal data**: who collects it, why, how long
they keep it, what rights you have over it. It applies whether or not you use cookies.

**The cookie rules** — these come from somewhere else, the ePrivacy Directive and its national
implementations. They govern **what you store on the visitor's device**, even when it is not personal
data.

Hence the most common mistake: people put a cookie banner on a site that has no cookies, and write
not a line about the form through which they actually collect data.

## Do you need a cookie banner?

The practical rule: **yes, if you put something on the visitor's device that the site does not need
in order to work.**

**You do not need one for:** a site that only displays pages, a shopping basket, a login session, a
language or theme preference. Those are strictly necessary for the service the user asked for.

**You do need one for:** Google Analytics, the Facebook pixel, any advertising tool, embedded maps or
videos that set cookies, a third-party live chat.

And if you do need one, the banner has to actually work: nothing loads until the person presses
"Accept", and refusing must be as easy as accepting. A banner with one button that has already loaded
everything does not cover you — it is just an obstacle in front of your visitor for nothing.

**The alternative I often recommend:** choose tools that need no consent at all. There are analytics
systems that set no cookies and do not follow people between sites. The site you are reading is built
that way — which is why you saw no banner on arrival.

## What is required anyway, if you have a contact form

GDPR applies here regardless of cookies, because a name, an email address and a phone number are
personal data.

**A privacy policy** stating at least: who you are (with contact details), what data you collect, for
what purpose, on what legal basis, who you pass it to (your service providers included), how long you
keep it, what rights the person has and how to exercise them, plus the right to complain to the
supervisory authority.

**A link to that policy next to the submit button**, where it gets read, not only in the footer.

**A consent tick box only if one is needed.** For a form where somebody asks you for a quote, the
basis is usually legitimate interest or pre-contractual steps rather than consent — in which case a
mandatory tick box is surplus. A box is needed if you intend to send them a newsletter afterwards, and
then it must be separate, unticked, and distinct from sending the message.

**Never pre-ticked boxes.** That is explicitly prohibited.

If you want a concrete example, [this site's privacy policy](/en/privacy/) is written on exactly the
structure above. Do not copy it word for word — your details are different — but you can see what
information sits where.

## Three things almost always forgotten

**Where the messages end up.** If the form sends through somebody else's service, that provider
processes data on your behalf and has to be named. Same for hosting, same for your email provider.

**How long you keep it.** "Forever" is not an answer. Pick a period and write it down.

**What you do when somebody asks for their data or its deletion.** You do not need a system. You need
to know which address the request arrives at and who answers it, within a month.

## What is NOT necessarily required

**A Data Protection Officer.** Mandatory only in specific situations — public authorities, large-scale
systematic monitoring, special categories of data at scale. A small business with a contact form is
not there.

**A banner if you have no non-essential cookies.** See above.

**A subscription "compliance" service.** For a business website, the obligations above are met with
one well-written page and a sober choice of tools.

## Where to check, at the source

- The text of the regulation, on [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj).
- Guidance from your own national supervisory authority — every EU country has one, and they publish
  plain-language material for small businesses.

They are written more clearly than you would expect, and for a small site the chapter on informing
the data subject is enough.

## In short

If your site simply presents what you do and has a contact form: you need a serious privacy policy, a
link to it next to the form, and care about which tools you add. You probably do not need a banner.

If you add Analytics, advertising or chat: you also need a consent mechanism that genuinely blocks
loading until acceptance.

And if you are not sure which category you are in, send me your address. I look at this too when I do
the free audit — within 48 hours, in writing, and no call afterwards.
