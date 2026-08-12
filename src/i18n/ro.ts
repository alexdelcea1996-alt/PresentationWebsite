import type { Content } from './types';

export const ro: Content = {
  meta: {
    title: 'Alex Delcea — Site-uri și aplicații web pentru afaceri',
    description:
      'Creez site-uri de prezentare, magazine online și aplicații web rapide, optimizate pentru Google și gândite să aducă clienți. Cere o ofertă gratuită.',
    ogAlt: 'Alex Delcea — dezvoltare de site-uri și aplicații web',
  },

  nav: {
    home: 'Acasă',
    services: 'Servicii',
    process: 'Cum lucrăm',
    portfolio: 'Proiecte',
    pricing: 'Prețuri',
    estimate: 'Estimare',
    demo: 'Demo',
    blog: 'Blog',
    contact: 'Contact',
    cta: 'Cere ofertă',
    menuOpen: 'Deschide meniul',
    menuClose: 'Închide meniul',
    skipToContent: 'Sari la conținut',
    ariaPrimary: 'Navigare principală',
    ariaMobile: 'Meniu mobil',
    ariaQuick: 'Contact rapid',
  },

  theme: {
    switchToLight: 'Comută pe tema luminoasă',
    switchToDark: 'Comută pe tema întunecată',
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

  liveMetrics: {
    title: 'Pagina asta, măsurată acum',
    note: 'Nu sunt cifre de prezentare. Le-a măsurat browserul tău, la vizita asta.',
    lcpLabel: 'Conținut afișat în',
    weightLabel: 'Cât cântărește',
    jsLabel: 'Din care JavaScript',
    pending: '—',
    verify: 'Verifică singur',
  },

  services: {
    eyebrow: 'Servicii',
    title: 'Ce pot construi pentru tine',
    subtitle:
      'De la o primă prezență online până la aplicații pe care echipa ta le folosește zilnic. Fiecare proiect vine cu cod curat, viteză și posibilitatea de a crește ulterior.',
    readMore: 'Vezi detalii și prețuri',
    demoCta: 'Vezi un demo funcțional',
    backToOverview: 'Înapoi la servicii',
    items: [
      {
        icon: 'target',
        key: 'landing',
        title: 'Landing page',
        description:
          'O pagină construită în jurul unei singure decizii, pentru o campanie, un produs sau un eveniment. Fără meniu care să scoată omul din pagina pe care ai plătit ca el să intre.',
        features: [
          'O structură făcută pentru o singură acțiune',
          'Text scris pentru pagina asta, nu luat din broșură',
          'Se încarcă sub o secundă pe internet mobil',
          'Măsurare, ca să știi dacă a mers',
        ],
      },
      {
        icon: 'browser',
        key: 'presentation',
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
        key: 'shop',
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
        key: 'webapp',
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
        key: 'optimization',
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
        name: 'Magazin online',
        price: 'de la 2.200 €',
        priceNote: 'livrare în 4–6 săptămâni',
        description:
          'Magazin propriu, cu plăți, facturare și curieri legate între ele. Relația cu clientul rămâne a ta, nu a unui marketplace.',
        features: [
          'Catalog cu variante, prețuri și stocuri',
          'Checkout scurt, cu plată online sau ramburs',
          'Facturare automată (SmartBill, Oblio, FGO)',
          'AWB generat automat la curier',
          'Fără comision pe vânzare din partea mea',
          'Termeni, retur și ANPC — structura pregătită',
        ],
        cta: 'Cere ofertă',
        featured: false,
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
    sendWhatsapp: 'Trimite-mi estimarea pe WhatsApp',
    copyLink: 'Copiază linkul estimării',
    copied: 'Link copiat',
    restored: 'Estimarea vine din linkul pe care l-ai deschis. Schimbă orice, se recalculează.',
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
    tool: {
      body: 'Pune adresa mai jos și vezi în 30 de secunde exact ce vede Google: viteză, accesibilitate, SEO. Fără să-mi lași datele tale.',
      label: 'Adresa site-ului tău',
      placeholder: 'exemplu.ro',
      submit: 'Verifică acum',
      running: 'Se analizează…',
      runningNote: 'Durează între 10 și 30 de secunde. Google chiar încarcă site-ul tău pe o conexiune de mobil, nu se uită peste el.',
      resultTitle: 'Ce spune Google despre site-ul tău, pe mobil',
      categories: {
        performance: 'Performanță',
        accessibility: 'Accesibilitate',
        bestPractices: 'Bune practici',
        seo: 'SEO',
      },
      issuesTitle: 'Cele mai costisitoare trei probleme',
      noIssues: 'Nu am găsit probleme mari de viteză. Site-ul tău stă bine — dacă tot vrei o părere, scrie-mi.',
      source: 'Măsurat de Google PageSpeed Insights, în timp real. Aceleași cifre le vezi și dacă rulezi testul singur.',
      ctaTitle: 'Vrei să reparăm ce e mai sus?',
      cta: 'Cere o ofertă',
      errorUrl: 'Nu pare o adresă validă. Încearcă ceva de forma exemplu.ro.',
      errorFailed: 'Nu am putut analiza adresa asta. Verifică dacă site-ul e public și încearcă din nou.',
      errorBusy: 'Prea multe verificări în acest moment. Încearcă peste un minut.',
    },
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
      submitNote: 'Răspund în cel mult 24 de ore — de obicei în aceeași zi lucrătoare.',
      success: 'Mulțumesc! Am primit mesajul și îți răspund în cel mult 24 de ore.',
      error: 'Mesajul nu a putut fi trimis. Scrie-mi direct pe e-mail și rezolvăm.',
      fallbackTitle: 'Mesajul e pregătit în aplicația ta de e-mail',
      fallbackBody:
        'Ți s-a deschis clientul de e-mail cu tot mesajul completat — mai ai doar de apăsat „trimite" acolo. Nu s-a deschis nimic? Ia una din scurtăturile de mai jos, mesajul pleacă la fel de bine pe oricare.',
      fallbackWhatsapp: 'Trimite mesajul pe WhatsApp',
      fallbackCopy: 'Copiază mesajul și adresa',
      fallbackCopied: 'Copiat — lipește-l unde îți e ușor',
      prefillNote: 'Preselectat după pagina din care vii: {label}. Schimbă-l dacă nu se potrivește.',
      steps: {
        progress: 'Pasul {current} din {total}',
        titles: ['Ce ai nevoie', 'Cine ești', 'Ce vrei să obții'],
        next: 'Continuă',
        back: 'Înapoi',
      },
      required: 'obligatoriu',
      privacy: 'Datele tale ajung în inboxul meu și le folosesc exclusiv ca să îți răspund. Nu le adaug pe nicio listă.',
    },
    directTitle: 'Preferi direct?',
    directBody: 'Scrie-mi pe canalul care îți convine. Îți răspund personal.',
    emailLabel: 'E-mail',
    phoneLabel: 'Telefon',
    whatsappLabel: 'WhatsApp',
    whatsappAction: 'Scrie-mi pe WhatsApp',
    whatsappMessage: 'Bună! Am văzut site-ul tău și aș vrea să discutăm despre un proiect.',
    responseTime: 'Răspund de obicei în aceeași zi lucrătoare.',
  },

  blog: {
    metaTitle: 'Blog — ghiduri practice despre site-uri și web | Alex Delcea',
    metaDescription:
      'Articole despre viteză, SEO și cum decurge realizarea unui site. Scrise pe înțelesul cuiva care conduce o afacere, nu al unui programator.',
    eyebrow: 'Blog',
    title: 'Ghiduri scrise pentru cine conduce o afacere',
    subtitle:
      'Lucruri pe care le explic oricum la telefon, puse în scris. Fără jargon și fără sfaturi care se termină cu „contactează-ne pentru detalii".',
    readingSuffix: 'min de citit',
    updatedLabel: 'Actualizat',
    backToBlog: 'Înapoi la blog',
    empty: 'Primul articol e în lucru.',
    rssLabel: 'Abonează-te prin RSS',
    ctaTitle: 'Ai o întrebare la care nu răspunde articolul?',
    ctaBody: 'Scrie-mi. Răspund personal, chiar dacă răspunsul e că nu ai nevoie de serviciile mele.',
    ctaButton: 'Trimite-mi un mesaj',
  },

  booking: {
    title: 'Sau alege direct o oră',
    body: 'Prima discuție durează 30 de minute și e gratuită. Vezi când sunt liber și rezervă fără să mai aștepți un răspuns.',
    cta: 'Vezi orele disponibile',
    modalTitle: 'Programează o discuție',
    openInNewTab: 'Deschide în filă nouă',
    close: 'Închide',
  },

  legal: {
    updatedLabel: 'Actualizată la ',
    privacyLink: 'Politica de confidențialitate',
  },

  thankYou: {
    metaTitle: 'Mesaj trimis — îți răspund în cel mult 24 de ore | Alex Delcea',
    metaDescription: 'Mesajul a ajuns la mine. Iată ce urmează și cum poți sări peste așteptare.',
    eyebrow: 'Mesaj trimis',
    title: 'Am primit mesajul',
    lead: 'A ajuns în inboxul meu. Nu îl adaug pe nicio listă și nu îl trimite nimeni mai departe — îl folosesc doar ca să îți răspund.',
    stepsTitle: 'Ce urmează',
    steps: [
      'Îți răspund în cel mult 24 de ore, de obicei în aceeași zi lucrătoare. Personal, nu automat.',
      'Îți pun câteva întrebări concrete despre afacere și, dacă e cazul, îți dau o estimare de preț.',
      'Dacă mergem mai departe, primești în scris ce conține proiectul, prețul final și termenul.',
    ],
    bookTitle: 'Sari peste așteptare',
    bookBody:
      'Dacă vrei să vorbim mai repede, rezervă direct cele 30 de minute. Gratuit și fără obligații — aceeași discuție, doar mai devreme.',
    back: 'Înapoi pe prima pagină',
  },

  footer: {
    tagline: 'Site-uri și aplicații web pentru afaceri care vor să fie găsite.',
    rights: 'Toate drepturile rezervate.',
    builtWith: 'Construit cu Astro. Fără șabloane cumpărate.',
    nav: 'Navigare',
  },

  homeFaq: {
    eyebrow: 'Întrebări frecvente',
    title: 'Ce mă întreabă toată lumea înainte să scrie',
    subtitle:
      'Răspunsurile scurte sunt aici. Cele lungi sunt pe paginile de serviciu, unde fiecare are șapte întrebări în plus.',
    items: [
      {
        question: 'Cât costă, de fapt?',
        answer:
          'Un landing page pornește de la 400 €, un site de prezentare de la 900 €, un magazin online de la 2.200 €, o aplicație web de la 2.500 €. Sunt prețuri de pornire, fără TVA, iar oferta exactă vine după prima discuție, în funcție de ce ai nevoie. Dacă vrei o estimare acum, configuratorul de mai sus îți dă un interval în trei pași.',
      },
      {
        question: 'Cât durează?',
        answer:
          'O săptămână pentru un landing page, două-patru pentru un site de prezentare, patru-șase pentru un magazin. La aplicații web termenul se stabilește împreună, fiindcă depinde de câte lucruri trebuie să facă. Data intră în ofertă și o respect — cu o excepție pe care ți-o spun deschis: dacă textele și pozele vin pe bucăți, se mută și termenul.',
      },
      {
        question: 'Cum începem?',
        answer:
          'Îmi scrii, îți răspund în cel mult 24 de ore — de obicei în aceeași zi lucrătoare, personal, nu automat. Urmează 30 de minute de discuție, gratuite și fără obligații, despre ce faci și ce vrei să obții. După ele primești în scris ce conține proiectul, prețul final și termenul.',
      },
      {
        question: 'Ce trebuie să pregătesc eu?',
        answer:
          'Mai puțin decât crezi, dar nu nimic: textele despre ce faci, pozele pe care le ai și o idee clară despre ce vrei să facă vizitatorul. Am scris un articol întreg despre asta, cu o listă pe care o poți parcurge înainte să mă contactezi.',
      },
      {
        question: 'Site-ul rămâne al meu dacă plec?',
        answer:
          'Da, integral, din prima zi. Codul și conturile sunt pe numele tău, nu pe al meu. Nu există abonament obligatoriu: după perioada de suport inclusă nu ai nimic de plătit, iar dacă mâine vrei să lucrezi cu altcineva, iei tot și pleci. Nu construiesc dependență de mine ca model de business.',
      },
      {
        question: 'Îmi garantezi primul loc în Google?',
        answer:
          'Nu, și nu ai încredere în cine ți-l garantează. Pot garanta că partea tehnică nu te încurcă — viteză, structură, date pentru motoarele de căutare — și îți arăt măsurătorile înainte de livrare. Poziția depinde însă și de conținut, și de concurență, iar alea nu sunt sub controlul meu.',
      },
    ],
  },

  about: {
    eyebrow: 'Despre mine',
    title: 'Cine construiește, de fapt',
    subtitle:
      'Nu o agenție cu departamente. Un singur dezvoltator, care răspunde personal și livrează personal.',
    body: [
      'Sunt Alex Delcea și lucrez singur. Când îmi scrii, îți răspund eu — în cel mult 24 de ore, de obicei în aceeași zi lucrătoare. Nu există intermediar care să traducă ce ai spus tu în ce a înțeles altcineva.',
      'Prima discuție e de 30 de minute, gratuită și fără obligații. Dacă îmi dau seama că ai nevoie de altceva — sau de nimic — îți spun direct. Apoi primești în scris ce conține proiectul, prețul final și termenul, iar prețul nu se schimbă pe parcurs dacă nu schimbăm împreună cerințele.',
      'Site-ul pe care îl citești acum e construit după aceleași reguli pe care ți le propun: fără șabloane cumpărate, măsurat înainte de publicare, cu cifrele de la începutul paginii măsurate chiar de browserul tău, la vizita asta.',
    ],
    name: 'Alex Delcea',
    role: 'Dezvoltator web',
    facts: [
      'Răspuns în cel mult 24 de ore',
      'Prima discuție: 30 de minute, gratuit',
      'Lucrăm direct, fără intermediari',
    ],
    principles: [
      {
        title: 'Măsurători, nu adjective',
        body: 'Măsor cu Lighthouse înainte de livrare și îți trimit raportul. La optimizări, aceleași măsurători înainte și după — ca să vezi diferența, nu ca să mă crezi pe cuvânt.',
      },
      {
        title: 'Ce construiesc rămâne al tău',
        body: 'Codul și conturile sunt pe numele tău din prima zi, iar după perioada de suport inclusă nu ai nimic de plătit. Nu îmi construiesc afacerea din dependența ta de mine.',
      },
      {
        title: 'Spun și ce nu pot',
        body: 'Nu îți garantez primul loc în Google și nu mă dau avocat pe textele juridice. Lista întreagă cu ce nu promit e chiar deasupra, printre garanții.',
      },
    ],
    photoAlt: 'Alex Delcea, dezvoltator web',
    cta: 'Hai să vorbim 30 de minute',
  },

  guarantees: {
    eyebrow: 'Garanții',
    title: 'Ce îți garantez și ce nu',
    subtitle:
      'Fiecare rând de mai jos e o promisiune pe care o găsești și în ofertă. Inclusiv cele din dreapta — mai ales cele din dreapta.',
    yesTitle: 'Îți garantez',
    noTitle: 'Nu îți garantez',
    yes: [
      {
        title: 'Preț fix, agreat înainte',
        body: 'Primești în scris ce conține proiectul, prețul final și termenul. Prețul nu se schimbă pe parcurs dacă nu schimbăm împreună cerințele.',
      },
      {
        title: 'Codul și conturile sunt ale tale',
        body: 'Din prima zi, pe numele tău. Nu îți țin site-ul ostatic: dacă vrei să lucrezi mâine cu altcineva, iei tot și pleci.',
      },
      {
        title: 'Fără abonament obligatoriu',
        body: 'După perioada de suport inclusă nu ai nimic de plătit. Modificările ulterioare le facem la oră sau pe contract lunar — alegi tu.',
      },
      {
        title: 'Răspuns în cel mult 24 de ore',
        body: 'De obicei în aceeași zi lucrătoare, și îți răspund personal. Nu primești un mesaj automat.',
      },
      {
        title: 'Prima discuție e gratuită',
        body: '30 de minute despre afacerea ta, fără obligații. Dacă îmi dau seama că ai nevoie de altceva — sau de nimic — îți spun direct.',
      },
      {
        title: 'Măsurători, nu afirmații',
        body: 'Măsor cu Lighthouse înainte de livrare și îți trimit raportul. La optimizări, aceleași măsurători înainte și după.',
      },
    ],
    no: [
      {
        title: 'Locul întâi în Google',
        body: 'Nimeni onest nu poate, și nu ai încredere în cine îți garantează. Pot garanta că partea tehnică nu te încurcă; poziția depinde și de conținut, și de concurență.',
      },
      {
        title: 'Textele juridice',
        body: 'Pregătesc structura și îți explic ce înseamnă fiecare document, dar confirmarea finală o dă un jurist. Sunt dezvoltator, nu avocat.',
      },
      {
        title: 'Termenul, dacă întârzie conținutul',
        body: 'Respect data din ofertă. Dar dacă textele și pozele vin pe bucăți, se mută și termenul — și îți spun din timp, nu în ultima zi.',
      },
    ],
  },

  demoNav: {
    label: 'Demo-uri',
    bookings: 'Programări',
    store: 'Magazin',
    landing: 'Landing page',
    site: 'Site de prezentare',
  },

  demoFrame: {
    frameTitle: 'Exemplul, deschis într-un browser',
    viewLabel: 'Cum îl vezi',
    desktop: 'Ecran mare',
    mobile: 'Telefon',
    openFull: 'Deschide-l pe tot ecranul',
  },

  landingDemo: {
    metaTitle: 'Demo: cum arată un landing page care convertește | Alex Delcea',
    metaDescription:
      'Un landing page complet, funcțional, deschis într-o ramă de browser. O pagină, o singură decizie, formular care răspunde. Încearcă-l, apoi vezi ce se schimbă la un site de prezentare.',
    eyebrow: 'Exemplu funcțional',
    title: 'Un landing page, întreg, nu o captură',
    lead: 'Pagina de mai jos e reală: derulează, apasă butonul, completează formularul. E făcută pentru un atelier de tâmplărie inventat, ca să se vadă structura fără să conteze cine e clientul.',
    disclaimer:
      'Firma, prețul și data sunt inventate, iar formularul nu trimite nimic nicăieri. Pagina e construită exact ca una livrată: fără șabloane, fără JavaScript de care să depindă textul.',
    lookForTitle: 'La ce să te uiți în timp ce derulezi',
    lookFor: [
      'Nu are meniu. Fiecare intrare într-un meniu e un mod de a pleca din pagina pentru care ai plătit ca omul să intre.',
      'Data, ora, prețul și numărul de locuri se văd fără să derulezi. Astea decid clickul, nu povestea firmei.',
      'Un singur buton, repetat de două ori, care duce în același loc.',
      'Formularul cere trei lucruri. Fiecare câmp în plus scade numărul de completări.',
      'Cele trei întrebări de la final sunt obiecțiile reale, nu întrebări de decor.',
    ],
    whyTitle: 'De ce arată așa',
    whyBody:
      'Un landing page nu e un site mai mic. Are o singură treabă — să transforme oamenii pe care îi aduci tu din reclame sau dintr-o listă — și tot ce nu ajută treaba aia iese din pagină, inclusiv lucruri adevărate și bune despre firmă.',
    builtTitle: 'Cum e construit',
    builtBody:
      'Aceeași tehnologie ca site-ul pe care îl citești: HTML static, fără framework, cu textul vizibil chiar dacă JavaScript-ul nu pornește. Se încarcă sub o secundă pe internet mobil — ceea ce contează direct când plătești fiecare click.',
    cta: 'Vreau un landing page ca ăsta',
  },

  siteDemo: {
    metaTitle: 'Demo: cum arată un site de prezentare pe trei pagini | Alex Delcea',
    metaDescription:
      'Un site de prezentare complet, cu meniu care funcționează și trei pagini navigabile, deschis într-o ramă de browser. Vezi diferența față de un landing page.',
    eyebrow: 'Exemplu funcțional',
    title: 'Un site de prezentare, cu meniul care chiar merge',
    lead: 'Trei pagini navigabile, pentru o firmă de instalații inventată. Umblă prin meniu: acasă, servicii, contact. Asta e diferența față de landing page-ul de alături.',
    disclaimer:
      'Firma, numărul de telefon și zonele deservite sunt inventate, iar formularul nu trimite nimic nicăieri. Structura e însă cea pe care o livrez.',
    lookForTitle: 'La ce să te uiți în timp ce navighezi',
    lookFor: [
      'Meniul există și funcționează. Aici e binevenit: omul ajunge cu o întrebare la care prima pagină poate să nu fie răspunsul.',
      'Fiecare serviciu are titlul lui, ca să poată fi găsit separat în Google. O pagină singură nu se poziționează pe mai multe căutări.',
      'Prima frază spune când vii, nu de câți ani există firma. Pentru o centrală stricată, asta e întrebarea.',
      'Numărul de telefon stă lângă formular, nu ascuns după el.',
      'Cele trei cifre de sus sunt verificabile de client, nu superlative.',
    ],
    whyTitle: 'De ce arată așa',
    whyBody:
      'Un site de prezentare acoperă subiecte, nu o singură decizie: o pagină pentru fiecare lucru pe care îl vinzi, fiecare găsibilă separat. De aceea are meniu, de aceea are mai multe pagini și de aceea costă și durează mai mult decât un landing page.',
    builtTitle: 'Cum e construit',
    builtBody:
      'Static, fără CMS de întreținut și fără plugin-uri de actualizat. Fiecare pagină e un fișier care se servește instant; nu există bază de date care să cadă și nici panou de administrare care să fie spart.',
    cta: 'Vreau un site ca ăsta',
  },
  demo: {
    doneCta: 'Vreau un instrument ca ăsta în firma mea',
    metaTitle: 'Demo: cum arată o aplicație web făcută la comandă | Alex Delcea',
    metaDescription:
      'O aplicație de programări, funcțională, direct în pagină. Adaugă, confirmă și anulează programări — exact felul de instrument intern care înlocuiește un Excel și un grup de WhatsApp.',
    eyebrow: 'Demo interactiv',
    title: 'Așa arată un proces care iese din Excel',
    lead: 'Un sistem de programări pentru un salon, un cabinet sau un atelier. Nu e o captură și nu e un film — funcționează. Încearcă-l: adaugă o programare, marchează un client ca venit, anulează alta.',
    disclaimer:
      'Datele sunt inventate și se salvează doar în browserul tău. Nu pleacă nicăieri și nu le vede nimeni, nici eu.',
    noJs: 'Demo-ul are nevoie de JavaScript — e o aplicație, nu o pagină. Restul site-ului funcționează și fără.',
    prevDay: 'Ziua anterioară',
    nextDay: 'Ziua următoare',
    todayLabel: 'Azi',
    statBookings: 'programări',
    statRevenue: 'încasări estimate',
    filterLabel: 'Filtrează după stare',
    filters: { all: 'Toate', confirmed: 'Confirmate', arrived: 'Venite', cancelled: 'Anulate' },
    statuses: { confirmed: 'Confirmat', arrived: 'A venit', cancelled: 'Anulat' },
    addButton: 'Adaugă programare',
    addTitle: 'Programare nouă',
    fields: {
      name: 'Nume client',
      phone: 'Telefon',
      service: 'Serviciu',
      time: 'Ora',
      duration: 'Durată',
      price: 'Preț (lei)',
    },
    minutes: 'min',
    currency: 'lei',
    save: 'Salvează',
    cancelEdit: 'Renunță',
    actions: {
      arrived: 'Marchează venit',
      cancel: 'Anulează',
      restore: 'Reactivează',
      remove: 'Șterge',
    },
    empty: 'Nicio programare în ziua asta. Adaugă una și vezi cum se comportă.',
    reset: 'Resetează datele demo',
    services: ['Tuns', 'Vopsit', 'Coafat', 'Consultație', 'Tratament'],
    seed: [
      { name: 'Maria Ionescu', phone: '0721 000 111', service: 1, time: '09:30', duration: 90, price: 220, status: 'arrived', day: 0 },
      { name: 'Andrei Popa', phone: '0733 222 333', service: 0, time: '11:00', duration: 45, price: 80, status: 'confirmed', day: 0 },
      { name: 'Elena Dumitru', phone: '0744 555 666', service: 2, time: '13:15', duration: 60, price: 150, status: 'confirmed', day: 0 },
      { name: 'Cristina Radu', phone: '0755 777 888', service: 4, time: '16:00', duration: 30, price: 90, status: 'cancelled', day: 0 },
      { name: 'Bogdan Marin', phone: '0766 999 000', service: 3, time: '10:00', duration: 30, price: 60, status: 'confirmed', day: 1 },
      { name: 'Ioana Stan', phone: '0777 111 222', service: 1, time: '12:30', duration: 90, price: 240, status: 'confirmed', day: 1 },
    ],
    whyTitle: 'De ce contează',
    whyBody:
      'Un instrument ca ăsta nu îți aduce clienți noi. Îți scoate din zi jumătatea de oră pe care o pierzi căutând prin mesaje cine vine mâine — și elimină programările dublate, care te costă un client de fiecare dată.',
    builtTitle: 'Cum e construit',
    builtBody:
      'Fără niciun framework, în JavaScript simplu. Aceeași abordare ca restul site-ului: aplicația de mai sus se încarcă mai repede decât un ecran de așteptare din multe aplicații „moderne".',
    cta: 'Vreau ceva asemănător',
  },

  storeDemo: {
    metaTitle: 'Demo: cum arată un magazin online făcut la comandă | Alex Delcea',
    metaDescription:
      'Un magazin online funcțional, direct în pagină. Alege variante, pune în coș, treci prin checkout — cu costul livrării vizibil de la primul produs, nu ca surpriză la final.',
    eyebrow: 'Demo interactiv',
    title: 'Un magazin în care drumul până la comandă e scurt',
    lead: 'Șase produse cu variante și stoc, un coș și un checkout pe un singur ecran. Costul livrării apare din clipa în care pui primul produs în coș — nu la final, unde pierde cele mai multe coșuri. Încearcă-l.',
    disclaimer:
      'Produsele și comenzile sunt inventate și se salvează doar în browserul tău. Nu se plătește nimic și nu pleacă nicio comandă nicăieri.',
    noJs: 'Magazinul are nevoie de JavaScript — e o aplicație, nu o pagină. Restul site-ului funcționează și fără.',
    currency: 'lei',
    catalogueTitle: 'Produse',
    products: [
      {
        name: 'Etiopia Yirgacheffe',
        blurb: 'Floral, cu note de citrice. Prăjire deschisă, pentru filtru.',
        variants: [
          { label: '250 g', price: 45, stock: 12 },
          { label: '1 kg', price: 155, stock: 4 },
        ],
      },
      {
        name: 'Brazilia Cerrado',
        blurb: 'Ciocolată și alune, corp plin. Prăjire medie.',
        variants: [
          { label: '250 g', price: 38, stock: 20 },
          { label: '1 kg', price: 130, stock: 6 },
        ],
      },
      {
        name: 'Columbia Huila',
        blurb: 'Caramel și măr copt. Merge și la espresso, și la filtru.',
        variants: [
          { label: '250 g', price: 42, stock: 9 },
          { label: '1 kg', price: 145, stock: 0 },
        ],
      },
      {
        name: 'Kenya AA',
        blurb: 'Coacăze negre și aciditate vie. Pentru cine vrea ceva clar.',
        variants: [{ label: '250 g', price: 52, stock: 3 }],
      },
      {
        name: 'Amestec de casă',
        blurb: 'Echilibrat, iertător la măcinare. Espresso de zi cu zi.',
        variants: [
          { label: '250 g', price: 34, stock: 25 },
          { label: '1 kg', price: 115, stock: 11 },
        ],
      },
      {
        name: 'Decofeinizat Sumatra',
        blurb: 'Fără cofeină, dar cu corp. Decofeinizat cu apă, fără solvenți.',
        variants: [{ label: '250 g', price: 40, stock: 0 }],
      },
    ],
    addToCart: 'Adaugă în coș',
    outOfStock: 'Stoc epuizat',
    stockLeft: 'în stoc: {n}',
    cartTitle: 'Coșul tău',
    cartEmpty: 'Coșul e gol. Adaugă un produs și vezi cum se comportă.',
    remove: 'Scoate din coș',
    increase: 'Mai adaugă unul',
    decrease: 'Scade unul',
    subtotal: 'Subtotal',
    delivery: 'Livrare',
    deliveryFree: 'gratuită',
    freeLeft: 'Încă {amount} până la livrare gratuită',
    freeReached: 'Ai livrare gratuită',
    total: 'Total',
    checkout: 'Finalizează comanda',
    backToShop: 'Înapoi la produse',
    checkoutTitle: 'Datele de livrare',
    checkoutNote: 'Fără cont obligatoriu. Patru câmpuri, un singur ecran.',
    fields: { name: 'Nume și prenume', phone: 'Telefon', city: 'Oraș', address: 'Adresă' },
    payment: 'Plata',
    paymentCard: 'Card online',
    paymentCash: 'Ramburs la curier',
    paymentCashFee: '+{amount} taxă ramburs',
    placeOrder: 'Plasează comanda',
    doneCta: 'Vreau un magazin care face exact asta',
    doneTitle: 'Comanda a fost înregistrată',
    doneBody: 'Într-un magazin adevărat, de aici mai departe nu mai atingi nimic:',
    doneSteps: [
      'Factura se emite și pleacă spre client, prin SmartBill, Oblio sau FGO',
      'AWB-ul se generează la curier, iar clientul primește linkul de urmărire',
      'Stocul scade singur, iar ce s-a terminat nu mai poate fi comandat',
    ],
    orderLabel: 'Comanda',
    newOrder: 'Încearcă încă o comandă',
    reset: 'Resetează datele demo',
    whyTitle: 'De ce contează',
    whyBody:
      'Cele mai multe coșuri se abandonează la ultimul pas, când apare costul transportului. Aici îl vezi din primul produs, împreună cu cât mai ai până la livrarea gratuită. Nu e un truc de design — e singura diferență între un magazin care încasează și unul care doar afișează.',
    builtTitle: 'Cum e construit',
    builtBody:
      'Fără niciun framework, în JavaScript simplu, ca restul site-ului. Un magazin adevărat mai are în spate plăți, facturare și curieri — dar partea pe care o vede clientul arată și se mișcă exact așa.',
    cta: 'Vreau un magazin ca ăsta',
  },

  notFound: {
    metaTitle: 'Pagina nu există (404) | Alex Delcea',
    code: '404',
    title: 'Pagina asta nu există',
    body: 'Ori linkul e greșit, ori am mutat pagina și am uitat să pun o redirecționare. A doua variantă e vina mea — scrie-mi și o repar.',
    home: 'Înapoi la prima pagină',
    linksTitle: 'Sau mergi direct la',
  },
};
