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
    estimate: 'Estimare',
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
    },
    readMore: 'Citește studiul de caz',
    emptyTitle: 'Studiu de caz în pregătire',
    emptyBody:
      'Aici vor apărea proiecte reale, cu problema clientului, soluția aleasă și rezultatul măsurabil.',
  },

  caseStudy: {
    backToWork: 'Înapoi la proiecte',
    clientLabel: 'Client',
    yearLabel: 'An',
    techLabel: 'Tehnologii',
    metricsTitle: 'Cifre măsurate',
    visitSite: 'Vezi site-ul live',
    viewCode: 'Vezi codul sursă',
    ctaTitle: 'Vrei un proiect ca acesta?',
    ctaBody: 'Spune-mi ce ai nevoie și îți răspund cu întrebări concrete și o estimare.',
    ctaButton: 'Cere o ofertă',
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

  comparison: {
    eyebrow: 'Comparație',
    title: 'Șablon gata făcut sau site la comandă?',
    subtitle:
      'Întrebarea cea mai dreaptă pe care mi-o pune un client. Răspunsul cinstit: depinde. Uite diferențele reale, inclusiv situația în care șablonul e alegerea mai bună.',
    criterionLabel: 'Criteriu',
    columnDiy: 'Șablon gata făcut',
    columnCustom: 'Site făcut la comandă',
    diyWinsLabel: 'Aici câștigă șablonul',
    rows: [
      {
        criterion: 'Cost inițial',
        diy: 'Mic — de la câteva zeci de euro pe lună',
        custom: 'Mai mare, plătit o singură dată',
        diyWins: true,
      },
      {
        criterion: 'Timp până la publicare',
        diy: 'Câteva ore, dacă te mulțumești cu ce oferă',
        custom: '1–4 săptămâni, în funcție de complexitate',
        diyWins: true,
      },
      {
        criterion: 'Cost pe termen lung',
        diy: 'Abonament lunar, permanent, care crește în timp',
        custom: 'Doar găzduirea și domeniul, câteva zeci de euro pe an',
      },
      {
        criterion: 'Viteză de încărcare',
        diy: 'Îngreunat de cod generic și scripturi nefolosite',
        custom: 'Doar codul necesar — de aceea site-ul ăsta are 100 la Lighthouse',
      },
      {
        criterion: 'Poziționare în Google',
        diy: 'Bazele sunt acolo, dar controlul tehnic e limitat',
        custom: 'Control complet: structură, viteză, date structurate',
      },
      {
        criterion: 'Cui aparține site-ul',
        diy: 'Trăiește pe platforma lor; mutarea înseamnă refacere',
        custom: 'Al tău integral — cod, conținut, domeniu',
      },
      {
        criterion: 'Cât de departe poate crește',
        diy: 'Până unde permite platforma, apoi te blochezi',
        custom: 'Fără plafon — se adaugă orice funcționalitate',
      },
      {
        criterion: 'Cine îl repară când se strică',
        diy: 'Suport prin formular, în engleză, cu răspuns în zile',
        custom: 'Eu, direct, pe telefon sau e-mail',
      },
    ],
    honestNote:
      'Dacă testezi o idee de afacere sau ai nevoie de o pagină online mâine, un șablon e alegerea rațională — ți-o spun chiar dacă înseamnă că nu lucrăm împreună acum. Un site la comandă merită când site-ul aduce clienți, nu doar bifează o prezență.',
  },

  configurator: {
    eyebrow: 'Estimare',
    title: 'Află în 30 de secunde cât te costă',
    subtitle:
      'Alege ce vrei să construiești și ce funcționalități îți trebuie. Primești un interval de preț și un termen orientativ, pe loc, fără să lași datele tale.',
    stepLabel: 'Pasul',
    stepOf: 'din',
    stepTitles: ['Ce construim?', 'Ce funcționalități?', 'Estimarea ta'],
    typeQuestion: 'Ce fel de proiect ai în minte?',
    typeLabels: {
      landing: {
        label: 'Landing page',
        description: 'O singură pagină, un singur obiectiv',
      },
      presentation: {
        label: 'Site de prezentare',
        description: 'Firma ta: servicii, portofoliu, contact',
      },
      shop: {
        label: 'Magazin online',
        description: 'Vinzi produse direct de pe site',
      },
      webapp: {
        label: 'Aplicație web',
        description: 'Platformă sau instrument făcut pe măsură',
      },
    },
    featureQuestion: 'De ce ai nevoie în plus?',
    featureHint: 'Alege câte vrei. Poți reveni oricând.',
    featureLabels: {
      multilang: 'Versiune în mai multe limbi',
      cms: 'Panou de administrare a conținutului',
      blog: 'Secțiune de blog',
      payments: 'Plăți online',
      booking: 'Sistem de programări',
      accounts: 'Conturi de utilizator',
      integrations: 'Integrări cu alte sisteme (facturare, CRM)',
      seo: 'Pachet SEO extins',
      copywriting: 'Redactarea textelor',
      maintenance: 'Mentenanță 6 luni',
    },
    featureIncluded: 'inclus',
    resultTitle: 'Estimarea ta',
    resultPriceLabel: 'Interval de preț',
    resultTimeLabel: 'Timp până la lansare',
    resultWeeks: 'săptămâni',
    resultSummaryTitle: 'Ce ai ales',
    resultNoFeatures: 'Doar pachetul de bază',
    disclaimer:
      'Estimare orientativă, fără TVA. Nu e o ofertă fermă: prețul final îl stabilim după ce discutăm, și poate ieși și mai mic dacă unele lucruri nu îți sunt necesare.',
    back: 'Înapoi',
    next: 'Continuă',
    restart: 'Ia-o de la capăt',
    cta: 'Trimite-mi această estimare',
    messageTemplate:
      'Am folosit configuratorul de pe site și am ales:\n\n{details}\n\nAș vrea să discutăm despre acest proiect.',
  },

  audit: {
    eyebrow: 'Gratuit',
    title: 'Ai deja un site? Îți spun ce nu merge.',
    body: 'Trimite-mi adresa și primești în 48 de ore trei probleme concrete care îți costă clienți — cu explicații pe înțelesul tău, nu cu jargon.',
    bullets: [
      'Ce încetinește site-ul și cât de mult',
      'De ce nu apari în Google pe ce ar trebui',
      'Ce îi face pe vizitatori să plece fără să te contacteze',
    ],
    cta: 'Vreau auditul gratuit',
    promise: 'Fără obligații și fără insistențe după. Dacă îți e util, revii tu.',
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
      website: 'Site-ul tău actual',
      websitePlaceholder: 'https://site-ul-tau.ro',
      websiteHint: 'Opțional. Completează-l dacă vrei auditul gratuit.',
      projectType: 'Tip de proiect',
      projectTypeOptions: [
        { id: 'presentation', label: 'Site de prezentare' },
        { id: 'landing', label: 'Landing page' },
        { id: 'shop', label: 'Magazin online' },
        { id: 'webapp', label: 'Aplicație web' },
        { id: 'audit', label: 'Audit gratuit al site-ului existent' },
        { id: 'optimization', label: 'Optimizare site existent' },
        { id: 'other', label: 'Altceva / nu sunt sigur' },
      ],
      budget: 'Buget estimat',
      budgetOptions: [
        { id: 'lt500', label: 'Sub 500 €' },
        { id: '500-1500', label: '500 – 1.500 €' },
        { id: '1500-3000', label: '1.500 – 3.000 €' },
        { id: 'gt3000', label: 'Peste 3.000 €' },
        { id: 'unknown', label: 'Încă nu știu' },
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
