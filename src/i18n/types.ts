/**
 * The shape of all site copy. Both locale files must satisfy this contract,
 * so a missing translation is a type error rather than a blank spot on the page.
 */

import type { FeatureId, ProjectTypeId } from '../data/configurator';

export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  /** Key into the icon map in `src/components/Icon.astro`. */
  icon: 'browser' | 'cart' | 'app' | 'gauge';
  /** Links the card to its landing page in the `services` collection, when one exists. */
  key?: 'presentation' | 'shop' | 'webapp' | 'optimization';
  title: string;
  description: string;
  features: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

/** One commitment, or one deliberate refusal to commit. */
export interface Promise_ {
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
}

/** Stable ids for the contact form's dropdowns, so the configurator can preselect them. */
export type ContactProjectTypeId = ProjectTypeId | 'audit' | 'optimization' | 'other';
export type BudgetId = 'lt500' | '500-1500' | '1500-3000' | 'gt3000' | 'unknown';

export interface SelectOption<T extends string> {
  id: T;
  label: string;
}

export interface ComparisonRow {
  criterion: string;
  diy: string;
  custom: string;
  /** Marks the row where the DIY option is genuinely the better choice. */
  diyWins?: boolean;
}

export interface Content {
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };
  nav: {
    services: string;
    process: string;
    portfolio: string;
    pricing: string;
    estimate: string;
    demo: string;
    blog: string;
    contact: string;
    cta: string;
    menuOpen: string;
    menuClose: string;
    skipToContent: string;
    /** Distinct accessible names, so the three <nav> landmarks stay distinguishable. */
    ariaPrimary: string;
    ariaMobile: string;
  };
  theme: {
    switchToLight: string;
    switchToDark: string;
  };
  langSwitch: {
    label: string;
    ro: string;
    en: string;
  };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: Stat[];
  };
  /** The band that measures the page it is sitting on. */
  liveMetrics: {
    title: string;
    note: string;
    lcpLabel: string;
    weightLabel: string;
    jsLabel: string;
    /** Placeholder held until the measurements land. */
    pending: string;
    verify: string;
  };
  services: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Service[];
    readMore: string;
    /** Shown only on the web-application service — the one the demo demonstrates. */
    demoCta: string;
    backToOverview: string;
  };
  process: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: ProcessStep[];
  };
  portfolio: {
    eyebrow: string;
    title: string;
    subtitle: string;
    labels: { problem: string; solution: string; result: string };
    readMore: string;
    emptyTitle: string;
    emptyBody: string;
  };
  caseStudy: {
    backToWork: string;
    clientLabel: string;
    yearLabel: string;
    techLabel: string;
    metricsTitle: string;
    visitSite: string;
    viewCode: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** Empty until real client reviews exist. Never populate with invented quotes. */
    items: Testimonial[];
    emptyTitle: string;
    emptyBody: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    note: string;
    popular: string;
    plans: PricingPlan[];
  };
  comparison: {
    eyebrow: string;
    title: string;
    subtitle: string;
    criterionLabel: string;
    columnDiy: string;
    columnCustom: string;
    rows: ComparisonRow[];
    diyWinsLabel: string;
    honestNote: string;
  };
  configurator: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stepLabel: string;
    stepOf: string;
    stepTitles: [string, string, string];
    typeQuestion: string;
    typeLabels: Record<ProjectTypeId, { label: string; description: string }>;
    featureQuestion: string;
    featureHint: string;
    featureLabels: Record<FeatureId, string>;
    featureIncluded: string;
    resultTitle: string;
    resultPriceLabel: string;
    resultTimeLabel: string;
    resultWeeks: string;
    resultSummaryTitle: string;
    resultNoFeatures: string;
    disclaimer: string;
    back: string;
    next: string;
    restart: string;
    cta: string;
    /** Pre-filled into the contact message; {details} is replaced with the picks. */
    messageTemplate: string;
  };
  audit: {
    eyebrow: string;
    title: string;
    body: string;
    bullets: string[];
    cta: string;
    promise: string;
    /**
     * The instant check, shown only when a PageSpeed key is configured. Without
     * one the band keeps the plain call to action above.
     */
    tool: {
      /** Replaces `body` above when the tool is live: that one promises 48 hours. */
      body: string;
      label: string;
      placeholder: string;
      submit: string;
      running: string;
      runningNote: string;
      resultTitle: string;
      /** Names of the four Lighthouse categories, in order. */
      categories: { performance: string; accessibility: string; bestPractices: string; seo: string };
      issuesTitle: string;
      noIssues: string;
      source: string;
      ctaTitle: string;
      cta: string;
      errorUrl: string;
      errorFailed: string;
      errorBusy: string;
    };
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      website: string;
      websitePlaceholder: string;
      websiteHint: string;
      projectType: string;
      projectTypeOptions: SelectOption<ContactProjectTypeId>[];
      budget: string;
      budgetOptions: SelectOption<BudgetId>[];
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
      required: string;
      privacy: string;
    };
    directTitle: string;
    directBody: string;
    emailLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
    /** Call to action on the WhatsApp link, in place of repeating the number. */
    whatsappAction: string;
    /** Pre-filled first message in the WhatsApp chat. */
    whatsappMessage: string;
    responseTime: string;
  };
  blog: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    /** Appended to the estimated minutes, e.g. "6 min de citit". */
    readingSuffix: string;
    updatedLabel: string;
    backToBlog: string;
    empty: string;
    rssLabel: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  booking: {
    title: string;
    body: string;
    cta: string;
    modalTitle: string;
    openInNewTab: string;
    close: string;
  };
  footer: {
    tagline: string;
    rights: string;
    builtWith: string;
    nav: string;
  };
  /**
   * Commitments already made elsewhere on the site, gathered in one place —
   * including the ones deliberately *not* made. Nothing here may be a new
   * promise: every line has to be traceable to existing copy.
   */
  guarantees: {
    eyebrow: string;
    title: string;
    subtitle: string;
    yesTitle: string;
    noTitle: string;
    yes: Promise_[];
    no: Promise_[];
  };
  /**
   * The playable demo. The site sells web applications but, the configurator
   * aside, only demonstrates a website — this is the thing that shows the claim
   * rather than repeating it.
   */
  demo: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
    disclaimer: string;
    noJs: string;
    /** Day navigation. */
    prevDay: string;
    nextDay: string;
    todayLabel: string;
    statBookings: string;
    statRevenue: string;
    filterLabel: string;
    filters: { all: string; confirmed: string; arrived: string; cancelled: string };
    statuses: { confirmed: string; arrived: string; cancelled: string };
    addButton: string;
    addTitle: string;
    fields: { name: string; phone: string; service: string; time: string; duration: string; price: string };
    minutes: string;
    /** Suffix on every money figure; both locales quote in RON. */
    currency: string;
    save: string;
    cancelEdit: string;
    actions: { arrived: string; cancel: string; restore: string; remove: string };
    empty: string;
    reset: string;
    /** Names offered in the service dropdown; also used by the seed rows. */
    services: string[];
    /** Fictional bookings the demo starts from. `day` is an offset from today. */
    seed: {
      name: string;
      phone: string;
      service: number;
      time: string;
      duration: number;
      price: number;
      status: 'confirmed' | 'arrived' | 'cancelled';
      day: number;
    }[];
    whyTitle: string;
    whyBody: string;
    builtTitle: string;
    builtBody: string;
    cta: string;
  };
  notFound: {
    metaTitle: string;
    code: string;
    title: string;
    body: string;
    home: string;
    linksTitle: string;
  };
}
