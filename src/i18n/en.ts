import type { Content } from './types';

export const en: Content = {
  meta: {
    title: 'Alex Delcea — Websites and web apps that grow businesses',
    description:
      'I build fast, search-friendly websites, online stores and custom web apps designed to turn visitors into customers. Get a free quote.',
    ogAlt: 'Alex Delcea — website and web app development',
  },

  nav: {
    home: 'Home',
    services: 'Services',
    process: 'Process',
    portfolio: 'Work',
    pricing: 'Pricing',
    estimate: 'Estimate',
    demo: 'Demo',
    blog: 'Blog',
    contact: 'Contact',
    cta: 'Get a quote',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skipToContent: 'Skip to content',
    ariaPrimary: 'Main navigation',
    ariaMobile: 'Mobile menu',
    ariaQuick: 'Quick contact',
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

  liveMetrics: {
    title: 'This page, measured just now',
    note: 'Not marketing numbers. Your own browser measured them on this visit.',
    lcpLabel: 'Content shown in',
    weightLabel: 'Total size',
    jsLabel: 'Of which JavaScript',
    pending: '—',
    verify: 'Check it yourself',
    verdict:
      'It loads on a weak signal too: this page is roughly {times}× lighter than the ordinary web page.',
    verdictPending: 'Measuring…',
    sourceLabel: 'median of the web, HTTP Archive, 2025',
    sourceHref: 'https://httparchive.org/reports/page-weight',
  },

  services: {
    eyebrow: 'Services',
    title: 'What I can build for you',
    subtitle:
      'From a first online presence to applications your team uses every day. Every project ships with clean code, real speed and room to grow.',
    readMore: 'See details and pricing',
    demoCta: 'See a working demo',
    backToOverview: 'Back to services',
    items: [
      {
        icon: 'target',
        key: 'landing',
        title: 'Landing page',
        description:
          'One page built around a single decision, for a campaign, a product or an event. No menu to walk people out of the page you just paid to get them onto.',
        features: [
          'A structure built for one action',
          'Copy written for this page, not lifted from a brochure',
          'Loads in under a second on mobile data',
          'Measurement, so you know whether it worked',
        ],
      },
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
    exampleTitle: 'And an example, with your own name on it',
    exampleBody:
      'The company below is invented — but the site is real and it works. Type your name, pick a colour, and see how yours would look.',
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
        name: 'Online store',
        price: 'from €2,200',
        priceNote: 'delivered in 4–6 weeks',
        description:
          'Your own store, with payments, invoicing and couriers wired together. The customer relationship stays with you, not with a marketplace.',
        features: [
          'Catalogue with variants, prices and stock',
          'Short checkout, card payment or cash on delivery',
          'Automatic invoicing (SmartBill, Oblio, FGO)',
          'Courier labels generated automatically',
          'No commission on your sales from me',
          'Terms, returns and consumer-protection — structure prepared',
        ],
        cta: 'Get a quote',
        featured: false,
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
    sendWhatsapp: 'Send me the estimate on WhatsApp',
    copyLink: 'Copy the estimate link',
    copied: 'Link copied',
    restored: 'This estimate came from the link you opened. Change anything and it recalculates.',
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
    cost: {
      title: 'Roughly what a slow site costs you',
      body:
        'Two numbers you already know about your business, and I show you the order of magnitude of the loss. Not a prediction — an arithmetic you could do on paper yourself.',
      visitorsLabel: 'Visitors per month',
      valueLabel: 'What one enquiry is worth to you',
      currency: 'lei',
      calculate: 'Work it out',
      resultLabel: 'Order of magnitude of the monthly loss',
      resultRange: 'between {low} and {high} lei a month',
      caveat:
        'This is a rough estimate, not a prediction. It rests on studies showing a link between speed and conversion rate — a statistical link, measured on other websites, not on yours. It knows nothing about what you sell, how well the copy is written, or who your customers are. Use it to decide whether speed is worth looking at, not to put a number in a budget.',
      sourceLabel: 'where the percentages come from',
      sourceHref: 'https://web.dev/case-studies/',
    },
    tool: {
      body: 'Put your address in below and see exactly what Google sees, in about 30 seconds: speed, accessibility, SEO. Without handing over your details.',
      label: 'Your website address',
      placeholder: 'example.com',
      submit: 'Check it now',
      running: 'Analysing…',
      runningNote: 'This takes 10 to 30 seconds. Google actually loads your site over a mobile connection rather than glancing at it.',
      resultTitle: 'What Google says about your site, on mobile',
      categories: {
        performance: 'Performance',
        accessibility: 'Accessibility',
        bestPractices: 'Best practices',
        seo: 'SEO',
      },
      issuesTitle: 'The three most expensive problems',
      noIssues: 'No major speed problems found. Your site is in good shape — if you still want a second opinion, write to me.',
      source: 'Measured live by Google PageSpeed Insights. You get the same numbers running the test yourself.',
      ctaTitle: 'Want the above fixed?',
      cta: 'Get a quote',
      errorUrl: 'That does not look like a valid address. Try something like example.com.',
      errorFailed: 'I could not analyse that address. Check the site is public and try again.',
      errorBusy: 'Too many checks right now. Try again in a minute.',
      strategyLabel: 'Measure on',
      strategyMobile: 'Phone',
      strategyDesktop: 'Desktop',
      measuredOn: 'Measured on {device}, at {time}.',
      selfTest: 'Measure this site too',
      selfTestNote:
        'The same tool, the same settings, on the page you are reading now. So you have something to compare against.',
      cachedNote: 'Kept from earlier in this session — it does not re-measure on every click.',
    },
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
      submitNote: 'I reply within 24 hours — usually the same working day.',
      success: 'Thank you! I have received your message and will reply within 24 hours.',
      error: 'The message could not be sent. Email me directly and we will sort it out.',
      fallbackTitle: 'Your message is ready in your email app',
      fallbackBody:
        'Your email client should have opened with the whole message filled in — all that is left is pressing "send" there. Nothing opened? Take one of the shortcuts below; the message travels just as well on either.',
      fallbackWhatsapp: 'Send the message on WhatsApp',
      fallbackCopy: 'Copy the message and the address',
      fallbackCopied: 'Copied — paste it wherever suits you',
      prefillNote: 'Preselected from the page you came from: {label}. Change it if it does not fit.',
      steps: {
        progress: 'Step {current} of {total}',
        titles: ['What you need', 'Who you are', 'What you want to achieve'],
        next: 'Continue',
        back: 'Back',
      },
      required: 'required',
      privacy: 'Your details land in my inbox and are used only to reply to you. They go on no list.',
    },
    directTitle: 'Prefer to write directly?',
    directBody: 'Use whichever channel suits you. I answer personally.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    whatsappLabel: 'WhatsApp',
    whatsappAction: 'Message me on WhatsApp',
    whatsappMessage: 'Hi! I came across your site and would like to discuss a project.',
    responseTime: 'I usually reply within the same working day.',
  },

  blog: {
    metaTitle: 'Blog — practical guides on websites | Alex Delcea',
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

  legal: {
    updatedLabel: 'Last updated ',
    privacyLink: 'Privacy policy',
  },

  thankYou: {
    metaTitle: 'Message sent — I reply within 24 hours | Alex Delcea',
    metaDescription: 'Your message reached me. Here is what happens next, and how to skip the wait.',
    eyebrow: 'Message sent',
    title: 'I have your message',
    lead: 'It landed in my inbox. It goes on no list and to nobody else — I use it only to reply to you.',
    stepsTitle: 'What happens next',
    steps: [
      'I reply within 24 hours, usually the same working day. Personally, not automatically.',
      'I ask a few concrete questions about the business and, where it makes sense, give you a price estimate.',
      'If we go ahead, you get the scope, the final price and the deadline in writing.',
    ],
    bookTitle: 'Skip the wait',
    bookBody:
      'If you would rather talk sooner, book the 30 minutes directly. Free and with no obligation — the same conversation, just earlier.',
    back: 'Back to the home page',
  },

  footer: {
    tagline: 'Websites and web apps for businesses that want to be found.',
    rights: 'All rights reserved.',
    builtWith: 'Built with Astro. No purchased templates.',
    builtFrom: 'Built from commit',
    colophonLink: 'How it keeps itself honest',
    nav: 'Navigation',
  },

  colophon: {
    metaTitle: 'Colophon — how this site keeps itself honest | Alex Delcea',
    metaDescription:
      'Which commit it was built from, how many checks are in the suite, which byte budgets are asserted, and what this page cannot know about itself.',
    eyebrow: 'Colophon',
    title: 'How this site keeps itself honest',
    lead: 'I sell you a website that tells the truth about your business. It would be odd not to show you what holds mine to account — including the things this page has no way of knowing about itself.',

    commitTitle: 'What it was built from',
    commitBody:
      'You cannot look at a page and tell whether it is the current one. So the commit this build came from is written here and in /version.txt — open both and compare them with the repository.',
    commitLabel: 'Commit',
    commitUnknown: 'unknown — built outside a git checkout',
    versionLink: 'See /version.txt',
    repoLink: 'The whole codebase',

    checksTitle: 'The checks',
    checksBody:
      'The suite runs against the BUILT site, not the source: CSP hashes, headers, hreflang alternates and share images only exist after a build. Most of the checks open a real browser and behave like a visitor.',
    checksLabel: 'checks in the suite',
    checksNote:
      'It says "in the suite", not "passing", and the difference matters: the build that produced this page ran BEFORE the tests did. A page announcing its own tests as green would be asserting exactly the kind of thing the rest of this site argues against. If you want the result, run the suite — it is in the repository, with instructions.',

    budgetsTitle: 'The budgets',
    budgetsBody:
      'Measuring on its own defends nothing: a slow creep upward passes green forever. The thresholds below are asserted, so going over fails the build. When something is exceeded on purpose, the threshold is raised in the same commit, with the reason written beside it.',
    budgetRows: [
      { label: 'Inline JavaScript on the landing page', value: 'at most 15 kB' },
      { label: 'The stylesheet, brotli-compressed', value: 'at most 10.5 kB' },
      { label: 'All four font files together', value: 'at most 64 kB' },
      { label: 'The landing page, compressed HTML', value: 'at most 25 kB' },
    ],

    cspTitle: 'The security policy',
    cspBody:
      'The site runs with a policy that has no "unsafe-inline": every inline script carries a SHA-256 hash, regenerated on every build. The practical consequence is that a script I did not put there does not run — not even if it somehow reaches the page.',

    limitsTitle: 'What this page cannot know',
    limitsBody:
      'The list below matters as much as the one above. A colophon that only lists what works is still an advertisement.',
    limits: [
      'Whether the tests passed. The build runs before them; the number above is how many checks exist, not how many passed.',
      'Whether the version you are reading is the newest one. It gives you its commit — comparing that with the repository is your move.',
      'How the site behaves on your connection and your phone. The band on the landing page measures this visit, in your browser, and nothing else.',
      'Whether any of this suits you. It is what I do, verified on my own site — not a promise about yours.',
    ],

    ctaTitle: 'Want the same rigour on your site?',
    ctaBody: 'In the first conversation I will tell you what can be measured and what cannot, before we work together.',
    ctaButton: 'Write to me',
  },

  checklist: {
    metaTitle: 'Pre-launch checklist | Alex Delcea',
    metaDescription:
      'What I check before putting a site online, point by point, with the suite that holds each line on this site. Made to be printed.',
    eyebrow: 'Guide',
    title: 'The list I go through before launch',
    lead: 'This is not a list of general advice. It is what I check, and beside every line is the suite in the repository that holds exactly that thing on this site. If the line breaks here, the build fails.',
    printHint: 'The page is made to be printed: Ctrl/Cmd + P gives you a clean copy, no menu and no background.',
    suiteNote:
      'The right-hand column is the file in tests/suites/ that holds the line. Run one suite on its own with npm test <name>.',

    groups: [
      {
        title: 'What a search engine sees',
        items: [
          { text: 'Every page has its own title and description, and they differ from each other.', suite: 'completeness' },
          { text: 'Every page declares which address is its canonical one.', suite: 'completeness' },
          { text: 'The language versions point at each other with hreflang, with x-default, and every target is itself in the sitemap.', suite: 'completeness' },
          { text: 'The sitemap and robots.txt are both served and do not contradict each other.', suite: 'completeness' },
          { text: 'The 404 is a whole page with navigation, marked noindex and kept out of the sitemap.', suite: 'completeness' },
        ],
      },
      {
        title: 'What shows up when someone shares a link',
        items: [
          { text: 'Every page has its own share image, not one generic card for the whole site.', suite: 'share-images' },
          { text: 'The image actually downloads and decodes at 1200×630, as a PNG.', suite: 'share-images' },
        ],
      },
      {
        title: 'What it weighs',
        items: [
          { text: 'Fonts are subsetted, not the whole families.', suite: 'weight' },
          { text: 'Every page has its weight asserted as a threshold, not merely reported.', suite: 'weight' },
          { text: 'No JavaScript bundle that nobody decided to ship.', suite: 'weight' },
        ],
      },
      {
        title: 'Accessibility',
        items: [
          { text: 'Zero axe findings on every page, at WCAG 2.1 AA.', suite: 'a11y' },
          { text: 'The same checks run on the light theme, not only the default one.', suite: 'a11y-light' },
          { text: 'The focus ring is distinguishable from the background in both themes.', suite: 'signature' },
          { text: 'A keyboard reaches every way of getting in touch on its own.', suite: 'channels' },
        ],
      },
      {
        title: 'Security and headers',
        items: [
          { text: 'A security policy with no "unsafe-inline", carrying a hash for every inline script.', suite: 'csp' },
          { text: 'HSTS set, security.txt served and not yet expired, cache rules on every kind of file.', suite: 'completeness' },
        ],
      },
      {
        title: 'The form',
        items: [
          { text: 'The form reports success only when the send was actually confirmed.', suite: 'interact' },
          { text: 'Both send paths carry the whole message, including where the visitor came from.', suite: 'interact' },
        ],
      },
      {
        title: 'Legal obligations (Romania)',
        items: [
          { text: 'The privacy policy is served, dated, and linked from the form.', suite: 'legal' },
          { text: 'Every outside service that touches a visitor’s data is named on the page.', suite: 'legal' },
        ],
      },
      {
        title: 'After launch',
        items: [
          { text: '/version.txt says which commit the live site was built from, and is never cached.', suite: 'completeness' },
        ],
      },
    ],

    ctaTitle: 'Want the list run against your site?',
    ctaBody: 'I will tell you what is already fine and what is not, without selling you anything before we have spoken.',
    ctaButton: 'Ask for an audit',
  },

  homeFaq: {
    eyebrow: 'Frequently asked',
    title: 'What everybody asks before writing',
    subtitle:
      'The short answers are here. The long ones are on the service pages, where each has seven more questions of its own.',
    items: [
      {
        question: 'What does it actually cost?',
        answer:
          'A landing page starts at €400, a business website at €900, an online store at €2,200, a web application at €2,500. Those are starting prices, before VAT, and the exact quote follows the first conversation, based on what you actually need. If you want a figure now, the configurator above gives you a range in three steps.',
      },
      {
        question: 'How long does it take?',
        answer:
          'About a week for a landing page, two to four for a business website, four to six for a store. For web applications the timeline is agreed together, because it depends on how much the thing has to do. The date goes into the quote and I keep to it — with one exception I will say out loud: if the text and the photos arrive in pieces, the date moves with them.',
      },
      {
        question: 'How do we start?',
        answer:
          'You write to me and I reply within 24 hours — usually the same working day, personally, not automatically. Then 30 minutes of conversation, free and with no obligation, about what you do and what you want to get out of it. After that you get the scope, the final price and the deadline in writing.',
      },
      {
        question: 'What do I need to prepare?',
        answer:
          'Less than you think, but not nothing: the words about what you do, whatever photos you have, and a clear idea of what you want a visitor to do. I wrote a whole article about it, with a list you can work through before getting in touch.',
      },
      {
        question: 'Is the site mine if I leave?',
        answer:
          'Yes, entirely, from day one. The code and the accounts are in your name, not mine. There is no compulsory retainer: once the included support period ends you owe nothing, and if you want to work with somebody else tomorrow, you take everything and go. I do not build dependence on me as a business model.',
      },
      {
        question: 'Can you guarantee first place on Google?',
        answer:
          'No, and do not trust anyone who does. What I can guarantee is that the technical side is not what holds you back — speed, structure, the data search engines read — and I show you the measurements before handover. Position also depends on your content and your competition, and neither of those is mine to control.',
      },
    ],
  },

  about: {
    eyebrow: 'About me',
    title: 'Who actually builds it',
    subtitle:
      'Not an agency with departments. One developer, who answers personally and delivers personally.',
    body: [
      "I'm Alex Delcea and I work on my own. When you write, I'm the one who answers — within 24 hours, usually the same working day. Nobody sits in between, translating what you said into what somebody else understood.",
      "The first conversation is 30 minutes, free and with no obligation. If it turns out you need something else — or nothing — I'll tell you straight. After that you get the scope, the final price and the deadline in writing, and the price doesn't move unless we change the requirements together.",
      'The site you are reading was built by the same rules I am proposing to you: no bought templates, measured before it went live, and the numbers near the top of this page were measured by your own browser, on this visit.',
    ],
    name: 'Alex Delcea',
    role: 'Web developer',
    facts: [
      'An answer within 24 hours',
      'First conversation: 30 minutes, free',
      'We work directly, no middlemen',
    ],
    principles: [
      {
        title: 'Measurements, not adjectives',
        body: 'I measure with Lighthouse before delivery and send you the report. For optimisation work, the same measurements before and after — so you can see the difference instead of taking my word for it.',
      },
      {
        title: 'What I build stays yours',
        body: 'The code and the accounts are in your name from day one, and once the included support period ends you owe nothing. Making you dependent on me is not my business model.',
      },
      {
        title: "I also say what I can't do",
        body: "I don't guarantee first place on Google and I don't play lawyer with your legal texts. The full list of what I won't promise is right above, among the guarantees.",
      },
    ],
    photoAlt: 'Alex Delcea, web developer',
    cta: "Let's talk for 30 minutes",
  },

  guarantees: {
    eyebrow: 'Guarantees',
    title: 'What I guarantee, and what I do not',
    subtitle:
      'Every line below is a promise you will also find in the quote. Including the ones on the right — especially those.',
    yesTitle: 'I guarantee',
    noTitle: 'I do not guarantee',
    yes: [
      {
        title: 'A fixed price, agreed upfront',
        body: 'You get the scope, the final price and the delivery date in writing. The price does not move unless we change the requirements together.',
      },
      {
        title: 'The code and accounts are yours',
        body: 'From day one, in your name. I do not hold your site hostage: if you want to work with someone else tomorrow, you take everything and go.',
      },
      {
        title: 'No mandatory retainer',
        body: 'Once the included support runs out you owe nothing. Later changes are hourly or on a monthly contract — your call.',
      },
      {
        title: 'A reply within 24 hours',
        body: 'Usually the same working day, and it is me replying. You will not get an autoresponder.',
      },
      {
        title: 'The first conversation is free',
        body: '30 minutes on your business, no strings. If I work out that you need something else — or nothing at all — I will say so plainly.',
      },
      {
        title: 'Measurements, not claims',
        body: 'I measure with Lighthouse before handover and send you the report. On optimisation work, the same measurements before and after.',
      },
    ],
    no: [
      {
        title: 'First place on Google',
        body: 'Nobody honest can, and do not trust anyone who does. I can guarantee the technical side will not hold you back; ranking also depends on content and competition.',
      },
      {
        title: 'The legal texts',
        body: 'I prepare the structure and explain what each document means, but a lawyer signs off on the final wording. I am a developer, not one.',
      },
      {
        title: 'The date, if the content is late',
        body: 'I keep to the date in the quote. But if text and images arrive in pieces, the date moves with them — and you hear it early, not on the last day.',
      },
    ],
  },

  demoNav: {
    label: 'Demos',
    bookings: 'Bookings',
    store: 'Store',
    landing: 'Landing page',
    site: 'Business website',
  },

  demoFrame: {
    frameTitle: 'The example, open in a browser',
    viewLabel: 'How you see it',
    desktop: 'Large screen',
    mobile: 'Phone',
    openFull: 'Open it full screen',
    personalizeTitle: 'Put your own name on it',
    personalizeBody:
      'Type your business name and pick a colour — the example below changes as you type. It stays an invented company; only what you typed changes.',
    nameLabel: 'Your business name',
    namePlaceholder: 'e.g. Ana Tailoring',
    colourLabel: 'Colour',
    colours: [
      { id: 'brown', label: 'Terracotta', value: '#8a4a1d' },
      { id: 'blue', label: 'Blue', value: '#12508f' },
      { id: 'green', label: 'Green', value: '#1f6b44' },
      { id: 'plum', label: 'Plum', value: '#6b2d5c' },
      { id: 'ink', label: 'Graphite', value: '#2b3440' },
    ],
    reset: 'Back to the example',
    cta: 'I want the real version, with my business on it',
    ribbonLabel: 'An example built by Alex Delcea — the company on this page is invented',
    ribbonBack: 'I want a site like this',
  },

  landingDemo: {
    metaTitle: 'Demo: a landing page that converts | Alex Delcea',
    metaDescription:
      'A complete, working landing page, open in a browser frame. One page, one decision, a form that answers. Try it, then see what changes on a business website.',
    eyebrow: 'Working example',
    title: 'A landing page, whole, not a screenshot',
    lead: 'The page below is real: scroll it, press the button, fill in the form. It is built for an invented woodworking workshop, so the structure shows without the client mattering.',
    disclaimer:
      'The business, the price and the date are invented, and the form sends nothing anywhere. The page itself is built exactly like a delivered one: no templates, and no JavaScript the text depends on.',
    lookForTitle: 'What to look at while you scroll',
    lookFor: [
      'There is no menu. Every entry in a menu is a way out of the page you paid to get somebody onto.',
      'The date, the time, the price and the number of places are visible without scrolling. Those decide the click, not the company story.',
      'One button, repeated twice, going to the same place.',
      'The form asks for three things. Every extra field costs you completions.',
      'The three questions at the end are the real objections, not decoration.',
    ],
    whyTitle: 'Why it looks like this',
    whyBody:
      'A landing page is not a smaller website. It has one job — converting the people you bring from ads or a list — and everything that does not serve that job comes out of the page, including true and flattering things about the business.',
    builtTitle: 'How it is built',
    builtBody:
      'The same way as the site you are reading: static HTML, no framework, with the text visible even if the JavaScript never runs. It loads in under a second on mobile data, which matters directly when you pay for every click.',
    cta: 'I want a landing page like this',
  },

  siteDemo: {
    metaTitle: 'Demo: a three-page business website | Alex Delcea',
    metaDescription:
      'A complete business website with a working menu and three navigable pages, open in a browser frame. See how it differs from a landing page.',
    eyebrow: 'Working example',
    title: 'A business website, with a menu that actually works',
    lead: 'Three navigable pages for an invented heating and plumbing firm. Walk through the menu: home, services, contact. That is the difference from the landing page next door.',
    disclaimer:
      'The company, the phone number and the areas covered are invented, and the form sends nothing anywhere. The structure, though, is the one I deliver.',
    lookForTitle: 'What to look at while you navigate',
    lookFor: [
      'The menu exists and works. Here it belongs: the visitor arrives with a question the home page may not answer.',
      'Each service has its own heading, so it can be found separately in search. A single page will not rank for several searches.',
      'The first sentence says when somebody turns up, not how many years the firm has existed. With a broken boiler, that is the question.',
      'The phone number sits beside the form, not hidden behind it.',
      'The three figures at the top are things a customer could check, not superlatives.',
    ],
    whyTitle: 'Why it looks like this',
    whyBody:
      'A business website covers subjects rather than one decision: a page for each thing you sell, each findable on its own. That is why it has a menu, why it has several pages, and why it costs and takes more than a landing page.',
    builtTitle: 'How it is built',
    builtBody:
      'Static, with no CMS to maintain and no plugins to update. Each page is a file served instantly; there is no database to fall over and no admin panel to break into.',
    cta: 'I want a site like this',
  },
  demo: {
    doneCta: 'I want a tool like this in my business',
    metaTitle: 'Demo: what a custom web application looks like | Alex Delcea',
    metaDescription:
      'A working bookings application, right on the page. Add, confirm and cancel appointments — the internal tool that replaces a spreadsheet and a group chat.',
    eyebrow: 'Interactive demo',
    title: 'This is what a process leaving the spreadsheet looks like',
    lead: 'A bookings system for a salon, a practice or a workshop. Not a screenshot and not a video — it works. Try it: add a booking, mark someone as arrived, cancel another.',
    disclaimer:
      'The data is invented and is saved only in your own browser. It goes nowhere and nobody sees it, including me.',
    noJs: 'The demo needs JavaScript — it is an application, not a page. The rest of the site works without it.',
    prevDay: 'Previous day',
    nextDay: 'Next day',
    todayLabel: 'Today',
    statBookings: 'bookings',
    statRevenue: 'estimated takings',
    filterLabel: 'Filter by status',
    filters: { all: 'All', confirmed: 'Confirmed', arrived: 'Arrived', cancelled: 'Cancelled' },
    statuses: { confirmed: 'Confirmed', arrived: 'Arrived', cancelled: 'Cancelled' },
    addButton: 'Add a booking',
    addTitle: 'New booking',
    fields: {
      name: 'Client name',
      phone: 'Phone',
      service: 'Service',
      time: 'Time',
      duration: 'Duration',
      price: 'Price (RON)',
    },
    minutes: 'min',
    currency: 'RON',
    save: 'Save',
    cancelEdit: 'Discard',
    actions: {
      arrived: 'Mark as arrived',
      cancel: 'Cancel',
      restore: 'Reinstate',
      remove: 'Delete',
    },
    empty: 'Nothing booked on this day. Add one and see how it behaves.',
    reset: 'Reset the demo data',
    services: ['Haircut', 'Colour', 'Styling', 'Consultation', 'Treatment'],
    seed: [
      { name: 'Maria Ionescu', phone: '0721 000 111', service: 1, time: '09:30', duration: 90, price: 220, status: 'arrived', day: 0 },
      { name: 'Andrei Popa', phone: '0733 222 333', service: 0, time: '11:00', duration: 45, price: 80, status: 'confirmed', day: 0 },
      { name: 'Elena Dumitru', phone: '0744 555 666', service: 2, time: '13:15', duration: 60, price: 150, status: 'confirmed', day: 0 },
      { name: 'Cristina Radu', phone: '0755 777 888', service: 4, time: '16:00', duration: 30, price: 90, status: 'cancelled', day: 0 },
      { name: 'Bogdan Marin', phone: '0766 999 000', service: 3, time: '10:00', duration: 30, price: 60, status: 'confirmed', day: 1 },
      { name: 'Ioana Stan', phone: '0777 111 222', service: 1, time: '12:30', duration: 90, price: 240, status: 'confirmed', day: 1 },
    ],
    whyTitle: 'Why it matters',
    whyBody:
      'A tool like this will not bring you new customers. It gives you back the half hour a day you lose scrolling through messages to work out who is coming tomorrow — and it removes double bookings, which cost you a customer every time.',
    builtTitle: 'How it is built',
    builtBody:
      'No framework at all, in plain JavaScript. The same approach as the rest of the site: the application above loads faster than the loading screen of many "modern" ones.',
    cta: 'I want something like this',
  },

  storeDemo: {
    metaTitle: 'Demo: what a custom online store looks like | Alex Delcea',
    metaDescription:
      'A working online store, right on the page. Pick variants, fill a basket, go through checkout — with the delivery cost on screen from the first item.',
    eyebrow: 'Interactive demo',
    title: 'A store where the road to the order is short',
    lead: 'Six products with variants and stock, a basket and a checkout on one screen. The delivery cost appears the moment you add the first item — not at the end, where most baskets are lost. Try it.',
    disclaimer:
      'The products and orders are invented and are saved only in your own browser. Nothing is charged and no order goes anywhere.',
    noJs: 'The store needs JavaScript — it is an application, not a page. The rest of the site works without it.',
    currency: 'RON',
    catalogueTitle: 'Products',
    products: [
      {
        name: 'Ethiopia Yirgacheffe',
        blurb: 'Floral, with citrus notes. Light roast, for filter.',
        variants: [
          { label: '250 g', price: 45, stock: 12 },
          { label: '1 kg', price: 155, stock: 4 },
        ],
      },
      {
        name: 'Brazil Cerrado',
        blurb: 'Chocolate and hazelnut, full bodied. Medium roast.',
        variants: [
          { label: '250 g', price: 38, stock: 20 },
          { label: '1 kg', price: 130, stock: 6 },
        ],
      },
      {
        name: 'Colombia Huila',
        blurb: 'Caramel and baked apple. Works for espresso and filter alike.',
        variants: [
          { label: '250 g', price: 42, stock: 9 },
          { label: '1 kg', price: 145, stock: 0 },
        ],
      },
      {
        name: 'Kenya AA',
        blurb: 'Blackcurrant and a lively acidity. For when you want it clear.',
        variants: [{ label: '250 g', price: 52, stock: 3 }],
      },
      {
        name: 'House blend',
        blurb: 'Balanced and forgiving to grind. Everyday espresso.',
        variants: [
          { label: '250 g', price: 34, stock: 25 },
          { label: '1 kg', price: 115, stock: 11 },
        ],
      },
      {
        name: 'Decaf Sumatra',
        blurb: 'No caffeine, still plenty of body. Water processed, no solvents.',
        variants: [{ label: '250 g', price: 40, stock: 0 }],
      },
    ],
    addToCart: 'Add to basket',
    outOfStock: 'Out of stock',
    stockLeft: 'in stock: {n}',
    cartTitle: 'Your basket',
    cartEmpty: 'The basket is empty. Add a product and see how it behaves.',
    remove: 'Remove from basket',
    increase: 'Add one more',
    decrease: 'Remove one',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    deliveryFree: 'free',
    freeLeft: '{amount} more for free delivery',
    freeReached: 'Delivery is free',
    total: 'Total',
    checkout: 'Go to checkout',
    backToShop: 'Back to the products',
    checkoutTitle: 'Delivery details',
    checkoutNote: 'No account required. Four fields, one screen.',
    fields: { name: 'Full name', phone: 'Phone', city: 'City', address: 'Address' },
    payment: 'Payment',
    paymentCard: 'Card online',
    paymentCash: 'Cash on delivery',
    paymentCashFee: '+{amount} cash-on-delivery fee',
    placeOrder: 'Place the order',
    doneCta: 'I want a store that does exactly this',
    doneTitle: 'The order is in',
    doneBody: 'In a real store, from here on you touch nothing:',
    doneSteps: [
      'The invoice is issued and sent to the customer, through SmartBill, Oblio or FGO',
      'The courier label is generated and the customer gets a tracking link',
      'Stock goes down on its own, and what has run out can no longer be ordered',
    ],
    orderLabel: 'Order',
    newOrder: 'Try another order',
    reset: 'Reset the demo data',
    whyTitle: 'Why it matters',
    whyBody:
      'Most baskets are abandoned at the last step, when the shipping cost finally appears. Here you see it from the first product, along with how much is left until delivery is free. It is not a design trick — it is the difference between a store that takes money and one that only displays things.',
    builtTitle: 'How it is built',
    builtBody:
      'No framework at all, in plain JavaScript, like the rest of the site. A real store has payments, invoicing and couriers behind it too — but the part the customer sees looks and moves exactly like this.',
    cta: 'I want a store like this',
  },

  notFound: {
    metaTitle: 'Page not found (404) | Alex Delcea',
    code: '404',
    title: 'This page does not exist',
    body: 'Either the link is wrong, or I moved the page and forgot to leave a redirect. The second one is on me — tell me and I will fix it.',
    home: 'Back to the home page',
    linksTitle: 'Or go straight to',
  },
};
