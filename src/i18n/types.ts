/**
 * The shape of all site copy. Both locale files must satisfy this contract,
 * so a missing translation is a type error rather than a blank spot on the page.
 */

export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  /** Key into the icon map in `src/components/Icon.astro`. */
  icon: 'browser' | 'cart' | 'app' | 'gauge';
  title: string;
  description: string;
  features: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Project {
  name: string;
  category: string;
  problem: string;
  solution: string;
  result: string;
  tech: string[];
  url?: string;
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
    contact: string;
    cta: string;
    menuOpen: string;
    menuClose: string;
    skipToContent: string;
    /** Distinct accessible names, so the three <nav> landmarks stay distinguishable. */
    ariaPrimary: string;
    ariaMobile: string;
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
  services: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Service[];
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
    labels: { problem: string; solution: string; result: string; visit: string };
    /** Empty until real case studies exist — the section renders honest empty slots. */
    items: Project[];
    emptyTitle: string;
    emptyBody: string;
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
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      projectType: string;
      projectTypeOptions: string[];
      budget: string;
      budgetOptions: string[];
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
    responseTime: string;
  };
  footer: {
    tagline: string;
    rights: string;
    builtWith: string;
    nav: string;
  };
}
