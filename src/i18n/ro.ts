import type { Content } from './types';

export const ro: Content = {
  meta: {
    title: 'Alex Delcea — Site-uri și aplicații web pentru afaceri',
    description:
      'Creez site-uri de prezentare, magazine online și aplicații web rapide, optimizate pentru Google și gândite să aducă clienți. Cere o ofertă gratuită.',
    ogAlt: 'Alex Delcea — dezvoltare de site-uri și aplicații web',
  },

  nav: {
    services: 'Servicii',
    process: 'Cum lucrăm',
    portfolio: 'Proiecte',
    pricing: 'Prețuri',
    contact: 'Contact',
    cta: 'Cere ofertă',
    menuOpen: 'Deschide meniul',
    menuClose: 'Închide meniul',
    skipToContent: 'Sari la conținut',
    ariaPrimary: 'Navigare principală',
    ariaMobile: 'Meniu mobil',
  },

  langSwitch: {
    label: 'Schimbă limba',
    ro: 'Română',
    en: 'English',
  },

  hero: {
    badge: 'Disponibil pentru proiecte noi',
    titleLead: 'Site-uri și aplicații web care',
    titleAccent: 'aduc clienți',
    titleTail: ', nu doar vizite.',
    subtitle:
      'Construiesc prezențe online rapide și clare, gândite în jurul unui singur obiectiv: ca vizitatorul să înțeleagă ce oferi și să te contacteze. De la site de prezentare până la aplicații web complexe.',
    ctaPrimary: 'Cere o ofertă gratuită',
    ctaSecondary: 'Vezi cum lucrez',
    stats: [
      { value: '95+', label: 'Scor Lighthouse garantat' },
      { value: '2–4', label: 'Săptămâni până la lansare' },
      { value: '100%', label: 'Adaptat pentru mobil' },
    ],
  },

  services: {
    eyebrow: 'Servicii',
    title: 'Ce pot construi pentru tine',
    subtitle:
      'De la o primă prezență online până la aplicații pe care echipa ta le folosește zilnic. Fiecare proiect vine cu cod curat, viteză și posibilitatea de a crește ulterior.',
    items: [
      {
        icon: 'browser',
        title: 'Site de prezentare',
        description:
          'Site-ul care îți spune povestea și transformă vizitatorii în cereri de ofertă. Structură clară, text convingător, apel la acțiune vizibil pe fiecare ecran.',
        features: [
          'Design personalizat, nu șablon',
          'Optimizat pentru Google (SEO tehnic)',
          'Formular de contact funcțional',
          'Panou de administrare, opțional',
        ],
      },
      {
        icon: 'cart',
        title: 'Magazin online',
        description:
          'Vinde direct de pe site, fără comisioane de marketplace. Proces de cumpărare scurt, plăți sigure și un panou simplu din care îți gestionezi produsele.',
        features: [
          'Plăți online integrate',
          'Gestiune produse și stocuri',
          'Checkout optimizat pentru conversie',
          'Facturare și livrare conectate',
        ],
      },
      {
        icon: 'app',
        title: 'Aplicație web custom',
        description:
          'Când un site nu e de ajuns: platforme interne, dashboard-uri, portaluri pentru clienți sau instrumente care automatizează munca repetitivă din firmă.',
        features: [
          'Conturi și niveluri de acces',
          'Integrări cu servicii externe (API)',
          'Rapoarte și date în timp real',
          'Arhitectură pregătită să crească',
        ],
      },
      {
        icon: 'gauge',
        title: 'Optimizare și mentenanță',
        description:
          'Ai deja un site, dar se încarcă greu, nu apare în Google sau arată prost pe telefon? Îl analizez, îl repar și rămân disponibil pe termen lung.',
        features: [
          'Audit de viteză și SEO',
          'Reparat probleme de afișare pe mobil',
          'Actualizări de securitate',
          'Suport lunar, la nevoie',
        ],
      },
    ],
  },

  process: {
    eyebrow: 'Cum lucrăm',
    title: 'Un proces simplu, fără surprize',
    subtitle:
      'Știi de la început ce primești, cât costă și când e gata. Comunicăm direct, fără intermediari și fără jargon tehnic inutil.',
    steps: [
      {
        title: 'Discuția inițială',
        description:
          'Vorbim 30 de minute despre afacerea ta, ce vrei să obții de la site și cine sunt clienții tăi. Gratuit și fără obligații.',
      },
      {
        title: 'Oferta și planul',
        description:
          'Primești în scris ce conține proiectul, prețul final și termenul de livrare. Prețul nu se schimbă pe parcurs dacă nu schimbăm împreună cerințele.',
      },
      {
        title: 'Design',
        description:
          'Îți arăt cum va arăta site-ul înainte să scriu prima linie de cod. Ajustăm împreună până ești mulțumit de direcție.',
      },
      {
        title: 'Dezvoltare',
        description:
          'Construiesc site-ul și îți trimit un link de test unde vezi progresul în timp real. Poți da feedback în orice moment.',
      },
      {
        title: 'Lansare și suport',
        description:
          'Punem site-ul online, îl conectăm la Google și te învăț cum să îl administrezi. Rămân disponibil și după predare.',
      },
    ],
  },

  portfolio: {
    eyebrow: 'Proiecte',
    title: 'Proiecte recente',
    subtitle:
      'Fiecare proiect pornește de la o problemă concretă de business. Mai jos, contextul, soluția și rezultatul.',
    labels: {
      problem: 'Provocarea',
      solution: 'Soluția',
      result: 'Rezultatul',
      visit: 'Vezi site-ul',
    },
    items: [],
    emptyTitle: 'Studiu de caz în pregătire',
    emptyBody:
      'Aici vor apărea proiecte reale, cu problema clientului, soluția aleasă și rezultatul măsurabil.',
  },

  testimonials: {
    eyebrow: 'Testimoniale',
    title: 'Ce spun clienții',
    subtitle: 'Păreri reale, de la oameni cu care am lucrat.',
    items: [],
    emptyTitle: 'Loc rezervat unui testimonial real',
    emptyBody:
      'Această secțiune se completează pe măsură ce clienții își împărtășesc experiența. Nu afișăm recenzii inventate.',
  },

  pricing: {
    eyebrow: 'Prețuri',
    title: 'Pachete și prețuri orientative',
    subtitle:
      'Prețul final depinde de complexitate, dar vreau să știi de la început în ce interval te încadrezi. Fără costuri ascunse.',
    note: 'Prețurile sunt orientative și nu includ TVA. Oferta exactă vine după discuția inițială, în funcție de nevoile tale reale.',
    popular: 'Cel mai ales',
    plans: [
      {
        name: 'Landing Page',
        price: 'de la 400 €',
        priceNote: 'livrare în ~1 săptămână',
        description:
          'O singură pagină, construită în jurul unui singur obiectiv: o campanie, un produs sau un eveniment.',
        features: [
          'O pagină, design personalizat',
          'Formular de contact',
          'Optimizare de bază pentru Google',
          'Adaptat pentru telefon și tabletă',
          '30 de zile de ajustări incluse',
        ],
        cta: 'Cere ofertă',
        featured: false,
      },
      {
        name: 'Site de prezentare',
        price: 'de la 900 €',
        priceNote: 'livrare în 2–4 săptămâni',
        description:
          'Site complet pentru firma ta: servicii, portofoliu, contact. Cea mai potrivită alegere pentru majoritatea afacerilor.',
        features: [
          'Până la 8 pagini',
          'Design personalizat, în identitatea ta vizuală',
          'SEO tehnic complet + Google Analytics',
          'Panou de administrare a conținutului',
          'Versiune bilingvă, opțional',
          '60 de zile de suport incluse',
        ],
        cta: 'Cere ofertă',
        featured: true,
      },
      {
        name: 'Aplicație web',
        price: 'de la 2.500 €',
        priceNote: 'termen stabilit împreună',
        description:
          'Platforme și instrumente construite pe măsură, pentru fluxuri de lucru care nu încap într-un site obișnuit.',
        features: [
          'Analiză și arhitectură dedicate',
          'Conturi, roluri și niveluri de acces',
          'Integrări cu sisteme externe',
          'Bază de date și rapoarte',
          'Documentație și instruire',
          'Contract de mentenanță, opțional',
        ],
        cta: 'Hai să discutăm',
        featured: false,
      },
    ],
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Hai să discutăm despre proiectul tău',
    subtitle:
      'Spune-mi în câteva rânduri ce ai nevoie. Îți răspund cu întrebări concrete și, dacă e cazul, cu o estimare de preț.',
    form: {
      name: 'Nume',
      namePlaceholder: 'Numele tău sau al firmei',
      email: 'E-mail',
      emailPlaceholder: 'adresa@exemplu.ro',
      projectType: 'Tip de proiect',
      projectTypeOptions: [
        'Site de prezentare',
        'Magazin online',
        'Aplicație web',
        'Optimizare site existent',
        'Altceva / nu sunt sigur',
      ],
      budget: 'Buget estimat',
      budgetOptions: [
        'Sub 500 €',
        '500 – 1.500 €',
        '1.500 – 3.000 €',
        'Peste 3.000 €',
        'Încă nu știu',
      ],
      message: 'Detalii despre proiect',
      messagePlaceholder:
        'Ce fel de afacere ai, ce vrei să obții de la site și dacă ai un termen limită.',
      submit: 'Trimite mesajul',
      sending: 'Se trimite…',
      success: 'Mulțumesc! Am primit mesajul și îți răspund în cel mult 24 de ore.',
      error: 'Mesajul nu a putut fi trimis. Scrie-mi direct pe e-mail și rezolvăm.',
      required: 'obligatoriu',
      privacy: 'Datele tale sunt folosite exclusiv ca să îți răspund. Nu le trimit nimănui.',
    },
    directTitle: 'Preferi direct?',
    directBody: 'Scrie-mi un e-mail și îți răspund personal.',
    emailLabel: 'E-mail',
    responseTime: 'Răspund de obicei în aceeași zi lucrătoare.',
  },

  footer: {
    tagline: 'Site-uri și aplicații web pentru afaceri care vor să fie găsite.',
    rights: 'Toate drepturile rezervate.',
    builtWith: 'Construit cu Astro. Fără șabloane cumpărate.',
    nav: 'Navigare',
  },
};
