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
    contact: 'Contact',
    cta: 'Get a quote',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skipToContent: 'Skip to content',
    ariaPrimary: 'Main navigation',
    ariaMobile: 'Mobile menu',
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
    items: [
      {
        icon: 'browser',
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
      visit: 'Visit the site',
    },
    items: [],
    emptyTitle: 'Case study in progress',
    emptyBody:
      'Real projects will appear here, each with the client problem, the approach taken and the measurable result.',
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
      projectType: 'Project type',
      projectTypeOptions: [
        'Business website',
        'Online store',
        'Web application',
        'Improving an existing site',
        'Something else / not sure yet',
      ],
      budget: 'Estimated budget',
      budgetOptions: [
        'Under €500',
        '€500 – €1,500',
        '€1,500 – €3,000',
        'Over €3,000',
        'Not sure yet',
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
    directTitle: 'Prefer email?',
    directBody: 'Write to me directly and I will answer personally.',
    emailLabel: 'Email',
    responseTime: 'I usually reply within the same working day.',
  },

  footer: {
    tagline: 'Websites and web apps for businesses that want to be found.',
    rights: 'All rights reserved.',
    builtWith: 'Built with Astro. No purchased templates.',
    nav: 'Navigation',
  },
};
