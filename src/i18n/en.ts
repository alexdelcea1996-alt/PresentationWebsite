import type { Content } from './types';

export const en: Content = {
  meta: {
    title: 'Alex Delcea — Websites and web apps that grow businesses',
    description:
      'I build fast, search-friendly websites, online stores and custom web apps designed to turn visitors into customers. Get a free quote.',
    ogAlt: 'Alex Delcea — website and web app development',
  },

  nav: {
    services: 'Services',
    process: 'Process',
    portfolio: 'Work',
    pricing: 'Pricing',
    estimate: 'Estimate',
    blog: 'Blog',
    contact: 'Contact',
    cta: 'Get a quote',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skipToContent: 'Skip to content',
    ariaPrimary: 'Main navigation',
    ariaMobile: 'Mobile menu',
  },

  theme: {
    switchToLight: 'Switch to the light theme',
    switchToDark: 'Switch to the dark theme',
  },

  langSwitch: {
    label: 'Change language',
    ro: 'Română',
    en: 'English',
  },

  hero: {
    badge: 'Available for new projects',
    titleLead: 'Websites and web apps that',
    titleAccent: 'win customers',
    titleTail: ', not just traffic.',
    subtitle:
      'I build fast, focused online presences with one goal in mind: that a visitor immediately understands what you offer and gets in touch. From a simple business site to a full web application.',
    ctaPrimary: 'Get a free quote',
    ctaSecondary: 'See how I work',
    stats: [
      { value: '95+', label: 'Guaranteed Lighthouse score' },
      { value: '2–4', label: 'Weeks to launch' },
      { value: '100%', label: 'Mobile ready' },
    ],
  },

  services: {
    eyebrow: 'Services',
    title: 'What I can build for you',
    subtitle:
      'From a first online presence to applications your team uses every day. Every project ships with clean code, real speed and room to grow.',
    readMore: 'See details and pricing',
    backToOverview: 'Back to services',
    items: [
      {
        icon: 'browser',
        key: 'presentation',
        title: 'Business website',
        description:
          'The site that tells your story and turns visitors into enquiries. Clear structure, persuasive copy and a visible call to action on every screen.',
        features: [
          'Custom design, never a template',
          'Built for Google (technical SEO)',
          'Working contact form',
          'Optional content admin panel',
        ],
      },
      {
        icon: 'cart',
        key: 'shop',
        title: 'Online store',
        description:
          'Sell straight from your own site, without marketplace commissions. A short path to checkout, secure payments and a simple panel to manage products.',
        features: [
          'Integrated online payments',
          'Product and stock management',
          'Checkout tuned for conversion',
          'Invoicing and shipping connected',
        ],
      },
      {
        icon: 'app',
        key: 'webapp',
        title: 'Custom web app',
        description:
          'For when a website is not enough: internal platforms, dashboards, client portals or tools that automate the repetitive work in your company.',
        features: [
          'Accounts and permission levels',
          'Third-party integrations (APIs)',
          'Live reporting and data',
          'Architecture ready to scale',
        ],
      },
      {
        icon: 'gauge',
        key: 'optimization',
        title: 'Optimisation and maintenance',
        description:
          'Already have a site that loads slowly, never shows up on Google or breaks on phones? I audit it, fix it and stay available long term.',
        features: [
          'Speed and SEO audit',
          'Mobile display issues fixed',
          'Security updates',
          'Monthly support if you need it',
        ],
      },
    ],
  },

  process: {
    eyebrow: 'Process',
    title: 'A simple process, no surprises',
    subtitle:
      'You know from day one what you get, what it costs and when it ships. We talk directly, with no middlemen and no unnecessary jargon.',
    steps: [
      {
        title: 'First conversation',
        description:
          'We spend 30 minutes on your business, what you want the site to achieve and who your customers are. Free, no strings attached.',
      },
      {
        title: 'Quote and plan',
        description:
          'You get the scope, the final price and the delivery date in writing. The price does not move unless we change the requirements together.',
      },
      {
        title: 'Design',
        description:
          'I show you how the site will look before I write a single line of code. We refine it together until the direction feels right.',
      },
      {
        title: 'Development',
        description:
          'I build the site and give you a staging link where you follow the progress live. You can send feedback at any point.',
      },
      {
        title: 'Launch and support',
        description:
          'We put the site online, connect it to Google and I walk you through managing it. I stay available after handover.',
      },
    ],
  },

  portfolio: {
    eyebrow: 'Work',
    title: 'Recent projects',
    subtitle:
      'Every project starts from a concrete business problem. Below: the context, the solution and the outcome.',
    labels: {
      problem: 'The challenge',
      solution: 'The solution',
      result: 'The outcome',
    },
    readMore: 'Read the case study',
    emptyTitle: 'Case study in progress',
    emptyBody:
      'Real projects will appear here, each with the client problem, the approach taken and the measurable result.',
  },

  caseStudy: {
    backToWork: 'Back to work',
    clientLabel: 'Client',
    yearLabel: 'Year',
    techLabel: 'Built with',
    metricsTitle: 'Measured numbers',
    visitSite: 'Visit the live site',
    viewCode: 'View the source code',
    ctaTitle: 'Want a project like this?',
    ctaBody: 'Tell me what you need and I reply with concrete questions and an estimate.',
    ctaButton: 'Get a quote',
  },

  testimonials: {
    eyebrow: 'Testimonials',
    title: 'What clients say',
    subtitle: 'Genuine feedback from people I have worked with.',
    items: [],
    emptyTitle: 'Reserved for a real testimonial',
    emptyBody:
      'This section fills up as clients share their experience. No invented reviews are shown here.',
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'Packages and indicative pricing',
    subtitle:
      'The final price depends on complexity, but you should know upfront which range you fall into. No hidden costs.',
    note: 'Prices are indicative and exclude VAT. The exact quote follows our first conversation, based on what you actually need.',
    popular: 'Most chosen',
    plans: [
      {
        name: 'Landing page',
        price: 'from €400',
        priceNote: 'delivered in ~1 week',
        description:
          'A single page built around one goal: a campaign, a product or an event.',
        features: [
          'One page, custom design',
          'Contact form',
          'Basic search engine optimisation',
          'Phone and tablet ready',
          '30 days of tweaks included',
        ],
        cta: 'Get a quote',
        featured: false,
      },
      {
        name: 'Business website',
        price: 'from €900',
        priceNote: 'delivered in 2–4 weeks',
        description:
          'A complete site for your company: services, work, contact. The right fit for most businesses.',
        features: [
          'Up to 8 pages',
          'Custom design in your visual identity',
          'Full technical SEO + Google Analytics',
          'Content administration panel',
          'Bilingual version, optional',
          '60 days of support included',
        ],
        cta: 'Get a quote',
        featured: true,
      },
      {
        name: 'Web application',
        price: 'from €2,500',
        priceNote: 'timeline agreed together',
        description:
          'Platforms and tools built to measure, for workflows that do not fit into an ordinary website.',
        features: [
          'Dedicated analysis and architecture',
          'Accounts, roles and permissions',
          'Integrations with external systems',
          'Database and reporting',
          'Documentation and training',
          'Optional maintenance contract',
        ],
        cta: 'Let us talk',
        featured: false,
      },
    ],
  },

  comparison: {
    eyebrow: 'Comparison',
    title: 'Off-the-shelf template or a custom site?',
    subtitle:
      'The fairest question a client asks me. The honest answer: it depends. Here are the real differences, including where a template is the better call.',
    criterionLabel: 'Criterion',
    columnDiy: 'Off-the-shelf template',
    columnCustom: 'Custom-built site',
    diyWinsLabel: 'Template wins here',
    rows: [
      {
        criterion: 'Upfront cost',
        diy: 'Low — from a few tens of euros a month',
        custom: 'Higher, paid once',
        diyWins: true,
      },
      {
        criterion: 'Time to publish',
        diy: 'A few hours, if you accept what it offers',
        custom: '1–4 weeks, depending on complexity',
        diyWins: true,
      },
      {
        criterion: 'Long-term cost',
        diy: 'A monthly subscription, forever, that grows over time',
        custom: 'Only hosting and the domain — tens of euros a year',
      },
      {
        criterion: 'Loading speed',
        diy: 'Weighed down by generic code and unused scripts',
        custom: 'Only the code you need — which is why this site scores 100 on Lighthouse',
      },
      {
        criterion: 'Google ranking',
        diy: 'The basics are there, but technical control is limited',
        custom: 'Full control: structure, speed, structured data',
      },
      {
        criterion: 'Who owns the site',
        diy: 'It lives on their platform; moving means rebuilding',
        custom: 'Entirely yours — code, content, domain',
      },
      {
        criterion: 'How far it can grow',
        diy: 'As far as the platform allows, then you are stuck',
        custom: 'No ceiling — any feature can be added',
      },
      {
        criterion: 'Who fixes it when it breaks',
        diy: 'Support forms and replies measured in days',
        custom: 'Me, directly, by phone or email',
      },
    ],
    honestNote:
      'If you are testing a business idea or need a page online tomorrow, a template is the rational choice — and I will say so even when it means we do not work together yet. A custom site earns its cost once the site brings in customers rather than just ticking the box of existing.',
  },

  configurator: {
    eyebrow: 'Estimate',
    title: 'Find out what it costs, in 30 seconds',
    subtitle:
      'Pick what you want to build and the features you need. You get a price range and a rough timeline immediately, without handing over your details.',
    stepLabel: 'Step',
    stepOf: 'of',
    stepTitles: ['What are we building?', 'Which features?', 'Your estimate'],
    typeQuestion: 'What kind of project do you have in mind?',
    typeLabels: {
      landing: {
        label: 'Landing page',
        description: 'One page, one goal',
      },
      presentation: {
        label: 'Business website',
        description: 'Your company: services, work, contact',
      },
      shop: {
        label: 'Online store',
        description: 'Sell products straight from your site',
      },
      webapp: {
        label: 'Web application',
        description: 'A platform or tool built to measure',
      },
    },
    featureQuestion: 'What else do you need?',
    featureHint: 'Pick as many as you like. You can go back at any point.',
    featureLabels: {
      multilang: 'Multiple languages',
      cms: 'Content administration panel',
      blog: 'Blog section',
      payments: 'Online payments',
      booking: 'Booking system',
      accounts: 'User accounts',
      integrations: 'Integrations with other systems (invoicing, CRM)',
      seo: 'Extended SEO package',
      copywriting: 'Copywriting',
      maintenance: '6 months of maintenance',
    },
    featureIncluded: 'included',
    resultTitle: 'Your estimate',
    resultPriceLabel: 'Price range',
    resultTimeLabel: 'Time to launch',
    resultWeeks: 'weeks',
    resultSummaryTitle: 'What you picked',
    resultNoFeatures: 'Base package only',
    disclaimer:
      'An indicative estimate, excluding VAT. It is not a firm quote: we set the final price after we talk, and it can come out lower if some of this turns out to be unnecessary.',
    back: 'Back',
    next: 'Continue',
    restart: 'Start over',
    cta: 'Send me this estimate',
    messageTemplate:
      'I used the configurator on your site and picked:\n\n{details}\n\nI would like to discuss this project.',
  },

  audit: {
    eyebrow: 'Free',
    title: 'Already have a site? I will tell you what is wrong with it.',
    body: 'Send me the address and within 48 hours you get three concrete problems that are costing you customers — explained in plain language, not jargon.',
    bullets: [
      'What slows the site down, and by how much',
      'Why you do not show up on Google for what you should',
      'What makes visitors leave without contacting you',
    ],
    cta: 'Get the free audit',
    promise: 'No strings and no follow-up pestering. If it helps, you come back on your own.',
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Let us talk about your project',
    subtitle:
      'Tell me in a few lines what you need. I reply with concrete questions and, where possible, a price estimate.',
    form: {
      name: 'Name',
      namePlaceholder: 'Your name or company',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      website: 'Your current site',
      websitePlaceholder: 'https://your-site.com',
      websiteHint: 'Optional. Fill this in if you want the free audit.',
      projectType: 'Project type',
      projectTypeOptions: [
        { id: 'presentation', label: 'Business website' },
        { id: 'landing', label: 'Landing page' },
        { id: 'shop', label: 'Online store' },
        { id: 'webapp', label: 'Web application' },
        { id: 'audit', label: 'Free audit of my existing site' },
        { id: 'optimization', label: 'Improving an existing site' },
        { id: 'other', label: 'Something else / not sure yet' },
      ],
      budget: 'Estimated budget',
      budgetOptions: [
        { id: 'lt500', label: 'Under €500' },
        { id: '500-1500', label: '€500 – €1,500' },
        { id: '1500-3000', label: '€1,500 – €3,000' },
        { id: 'gt3000', label: 'Over €3,000' },
        { id: 'unknown', label: 'Not sure yet' },
      ],
      message: 'Project details',
      messagePlaceholder:
        'What kind of business you run, what you want from the site, and whether you have a deadline.',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Thank you! I have received your message and will reply within 24 hours.',
      error: 'The message could not be sent. Email me directly and we will sort it out.',
      required: 'required',
      privacy: 'Your details are used only to reply to you. They are never shared.',
    },
    directTitle: 'Prefer to write directly?',
    directBody: 'Use whichever channel suits you. I answer personally.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    whatsappLabel: 'WhatsApp',
    whatsappMessage: 'Hi! I came across your site and would like to discuss a project.',
    responseTime: 'I usually reply within the same working day.',
  },

  blog: {
    metaTitle: 'Blog — practical guides on websites and the web | Alex Delcea',
    metaDescription:
      'Articles on speed, SEO and how building a website actually goes. Written for someone running a business, not for a programmer.',
    eyebrow: 'Blog',
    title: 'Guides written for people running a business',
    subtitle:
      'Things I end up explaining on the phone anyway, written down. No jargon, and no advice that ends in "contact us for details".',
    readingSuffix: 'min read',
    updatedLabel: 'Updated',
    backToBlog: 'Back to the blog',
    empty: 'The first article is being written.',
    rssLabel: 'Subscribe via RSS',
    ctaTitle: 'Got a question the article does not answer?',
    ctaBody: 'Write to me. I reply personally, even when the answer is that you do not need my services.',
    ctaButton: 'Send me a message',
  },

  booking: {
    title: 'Or just pick a time',
    body: 'The first conversation takes 30 minutes and is free. See when I am available and book without waiting for a reply.',
    cta: 'See available times',
    modalTitle: 'Book a conversation',
    openInNewTab: 'Open in a new tab',
    close: 'Close',
  },

  footer: {
    tagline: 'Websites and web apps for businesses that want to be found.',
    rights: 'All rights reserved.',
    builtWith: 'Built with Astro. No purchased templates.',
    nav: 'Navigation',
  },
};
