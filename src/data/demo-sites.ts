/**
 * The two example sites shown in the demos: a landing page and a small business
 * website, each for an invented company.
 *
 * They live here rather than in `src/i18n/` on purpose. Everything in i18n is
 * copy for *this* site and has to be true; everything here is fiction, and
 * mixing the two would be the first step towards a made-up claim ending up on a
 * real page. The demo pages label it as invented, in both languages.
 *
 * Two different businesses, two different looks. If both examples looked like
 * this site they would prove nothing — the point of showing them is that the
 * structure is chosen per job, not applied from a template.
 */
import type { Locale } from '../i18n';

export interface ExampleLanding {
  /** The invented brand. */
  brand: string;
  tagline: string;
  /** Sits above the heading — the one fact that makes the offer concrete. */
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  /** Under the button: the details that decide whether someone clicks. */
  ctaNote: string;
  agendaTitle: string;
  agenda: { time: string; title: string; body: string }[];
  takeawayTitle: string;
  takeaways: string[];
  hostTitle: string;
  hostName: string;
  hostBody: string;
  priceTitle: string;
  price: string;
  priceNote: string;
  includes: string[];
  formTitle: string;
  formBody: string;
  fields: { name: string; phone: string; people: string };
  placeholders: { name: string; phone: string };
  peopleOptions: string[];
  submit: string;
  successTitle: string;
  successBody: string;
  faqTitle: string;
  faq: { question: string; answer: string }[];
  footer: string;
}

export interface ExampleSite {
  brand: string;
  tagline: string;
  nav: { label: string; home: string; services: string; contact: string };
  /** The home page. */
  home: {
    title: string;
    heroTitle: string;
    heroLead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: { value: string; label: string }[];
    servicesTitle: string;
    servicesLead: string;
    whyTitle: string;
    why: { title: string; body: string }[];
    areaTitle: string;
    areaBody: string;
    areas: string[];
  };
  /** The services page. */
  services: {
    title: string;
    lead: string;
    items: { title: string; body: string; bullets: string[] }[];
    note: string;
  };
  /** The contact page. */
  contact: {
    title: string;
    lead: string;
    formTitle: string;
    fields: { name: string; phone: string; message: string };
    placeholders: { name: string; phone: string; message: string };
    submit: string;
    successTitle: string;
    successBody: string;
    detailsTitle: string;
    phoneLabel: string;
    phone: string;
    emailLabel: string;
    email: string;
    hoursLabel: string;
    hours: string;
    urgentLabel: string;
    urgent: string;
  };
  footer: string;
}

export const exampleLanding: Record<Locale, ExampleLanding> = {
  ro: {
    brand: 'Rindea',
    tagline: 'Atelier de tâmplărie',
    eyebrow: 'Sâmbătă, 12 octombrie · Cluj-Napoca · 8 locuri',
    title: 'Într-o zi îți faci singur un taburet din lemn masiv',
    lead: 'Un atelier de șapte ore pentru oameni care n-au ținut niciodată o daltă în mână. Pleci acasă cu obiectul făcut de tine, nu cu o diplomă.',
    cta: 'Rezervă un loc',
    ctaNote: '380 lei · 10:00–17:00 · fără experiență necesară',
    agendaTitle: 'Cum arată cele șapte ore',
    agenda: [
      {
        time: '10:00',
        title: 'Lemnul și sculele',
        body: 'Ce e frasinul, ce e stejarul și de ce contează. Cum ții o daltă fără să te tai.',
      },
      {
        time: '11:00',
        title: 'Tai și dai la rindea',
        body: 'Primele piese, pe ferăstrău manual. Aici se vede că nu e greu, doar nefamiliar.',
      },
      {
        time: '13:30',
        title: 'Îmbinări, fără șuruburi',
        body: 'Cepuri și scobituri. Partea care sperie și care iese, la toată lumea, din prima.',
      },
      {
        time: '15:30',
        title: 'Șlefuit și uleiat',
        body: 'Finisajul care face diferența între „făcut acasă" și „făcut bine".',
      },
    ],
    takeawayTitle: 'Ce pleacă cu tine',
    takeaways: [
      'Taburetul, terminat și uleiat, făcut de mâna ta',
      'Lista de scule cu care poți începe acasă, cu prețuri reale',
      'Un plan pe hârtie, ca să-l mai poți face o dată',
    ],
    hostTitle: 'Cine ține atelierul',
    hostName: 'Vlad Marinescu',
    hostBody: 'Tâmplar de doisprezece ani, din care ultimii patru cu ateliere de weekend. Lucrează cu mâna, nu cu utilaje de serie — de asta se poate face într-o zi, la o masă, cu tine alături.',
    priceTitle: 'Cât costă',
    price: '380 lei',
    priceNote: 'de persoană, materialele incluse',
    includes: [
      'Lemnul, sculele și șorțul, la fața locului',
      'Prânz și cafea, cu o pauză reală la mijloc',
      'Grupă de maximum 8 oameni, ca să ajung la fiecare',
    ],
    formTitle: 'Rezervă-ți locul',
    formBody: 'Îți scriu în aceeași zi cu detaliile de plată. Locul se ține 48 de ore.',
    fields: { name: 'Numele tău', phone: 'Telefon', people: 'Câte locuri' },
    placeholders: { name: 'Ion Popescu', phone: '07xx xxx xxx' },
    peopleOptions: ['1 loc', '2 locuri', '3 locuri'],
    submit: 'Trimite rezervarea',
    successTitle: 'Gata, locul e reținut',
    successBody: 'Asta e tot ce face formularul într-un demo — pe un site real ai fi primit deja un mesaj. Nu s-a trimis nimic nicăieri.',
    faqTitle: 'Trei lucruri pe care le întreabă toți',
    faq: [
      {
        question: 'Chiar nu-mi trebuie experiență?',
        answer: 'Nu. Jumătate dintre oameni n-au tăiat niciodată o scândură. De asta grupa e mică.',
      },
      {
        question: 'Cum îl duc acasă?',
        answer: 'Încape pe bancheta din spate a oricărei mașini. Dacă vii cu trenul, îl împachetez.',
      },
      {
        question: 'Dacă nu pot veni?',
        answer: 'Anunță-mă cu trei zile înainte și treci pe data următoare, fără costuri.',
      },
    ],
    footer: 'Rindea · Atelier de tâmplărie · Cluj-Napoca',
  },
  en: {
    brand: 'Rindea',
    tagline: 'Woodworking workshop',
    eyebrow: 'Saturday, 12 October · Cluj-Napoca · 8 places',
    title: 'In one day you build yourself a solid wood stool',
    lead: 'A seven-hour workshop for people who have never held a chisel. You go home with the thing you made, not with a certificate.',
    cta: 'Book a place',
    ctaNote: '380 lei · 10:00–17:00 · no experience needed',
    agendaTitle: 'What the seven hours look like',
    agenda: [
      {
        time: '10:00',
        title: 'The wood and the tools',
        body: 'What ash is, what oak is, and why it matters. How to hold a chisel without cutting yourself.',
      },
      {
        time: '11:00',
        title: 'Sawing and planing',
        body: 'The first pieces, by hand. This is where you find out it is not hard, only unfamiliar.',
      },
      {
        time: '13:30',
        title: 'Joints, no screws',
        body: 'Mortise and tenon. The part that sounds frightening and that everybody gets right first time.',
      },
      {
        time: '15:30',
        title: 'Sanding and oiling',
        body: 'The finish that separates "made at home" from "made well".',
      },
    ],
    takeawayTitle: 'What you take with you',
    takeaways: [
      'The stool, finished and oiled, made by your own hands',
      'A starter tool list with real prices',
      'A paper plan, so you can build it again',
    ],
    hostTitle: 'Who runs the workshop',
    hostName: 'Vlad Marinescu',
    hostBody: 'A carpenter of twelve years, the last four of them running weekend workshops. He works by hand rather than with production machinery — which is why this fits into one day, at one bench, with you beside him.',
    priceTitle: 'What it costs',
    price: '380 lei',
    priceNote: 'per person, materials included',
    includes: [
      'Wood, tools and an apron, all provided',
      'Lunch and coffee, with a real break in the middle',
      'Groups of eight at most, so everyone gets attention',
    ],
    formTitle: 'Book your place',
    formBody: 'I write back the same day with payment details. The place is held for 48 hours.',
    fields: { name: 'Your name', phone: 'Phone', people: 'How many places' },
    placeholders: { name: 'John Smith', phone: '07xx xxx xxx' },
    peopleOptions: ['1 place', '2 places', '3 places'],
    submit: 'Send booking',
    successTitle: 'Done, your place is held',
    successBody: 'That is all the form does in a demo — on a real site you would already have a message. Nothing was sent anywhere.',
    faqTitle: 'Three things everybody asks',
    faq: [
      {
        question: 'Do I really need no experience?',
        answer: 'No. Half the people have never cut a board. That is why the group is small.',
      },
      {
        question: 'How do I get it home?',
        answer: 'It fits on the back seat of any car. If you came by train, I will pack it.',
      },
      {
        question: 'What if I cannot make it?',
        answer: 'Tell me three days ahead and move to the next date, at no cost.',
      },
    ],
    footer: 'Rindea · Woodworking workshop · Cluj-Napoca',
  },
};

export const exampleSite: Record<Locale, ExampleSite> = {
  ro: {
    brand: 'Termoflux',
    tagline: 'Instalații termice și sanitare',
    nav: { label: 'Meniu principal', home: 'Acasă', services: 'Servicii', contact: 'Contact' },
    home: {
      title: 'Termoflux — instalații termice și sanitare în Brașov',
      heroTitle: 'Centrala nu pornește azi, nu peste două săptămâni',
      heroLead: 'Montăm, reparăm și verificăm instalații termice și sanitare în Brașov și împrejurimi. Venim cu preț spus înainte, nu descoperit la final.',
      ctaPrimary: 'Cere o programare',
      ctaSecondary: 'Vezi serviciile',
      trust: [
        { value: '24h', label: 'Răspuns la solicitare' },
        { value: '14 ani', label: 'De când lucrăm în Brașov' },
        { value: '2 ani', label: 'Garanție la montaj' },
      ],
      servicesTitle: 'Ce facem',
      servicesLead: 'Patru lucruri, făcute bine, în loc de o listă din care nu se înțelege nimic.',
      whyTitle: 'De ce ne sună oamenii a doua oară',
      why: [
        {
          title: 'Prețul se spune la telefon',
          body: 'Pentru intervențiile obișnuite îți dăm intervalul înainte să pornim. Dacă la fața locului e altceva, te sunăm înainte să facem.',
        },
        {
          title: 'Venim în intervalul stabilit',
          body: 'O fereastră de două ore, nu „undeva în cursul zilei". Dacă întârziem, te anunțăm noi.',
        },
        {
          title: 'Lăsăm curat în urmă',
          body: 'Folii pe jos, molozul plecat cu noi. Nu rămâne o baie de curățat după ce am terminat.',
        },
      ],
      areaTitle: 'Unde ajungem',
      areaBody: 'Brașov și localitățile din jur, fără taxă de deplasare în oraș.',
      areas: ['Brașov', 'Săcele', 'Codlea', 'Ghimbav', 'Sânpetru', 'Hărman'],
    },
    services: {
      title: 'Servicii — Termoflux',
      lead: 'Fiecare intervenție are un preț de pornire spus dinainte. Cele complicate le vedem întâi și abia apoi le ofertăm.',
      items: [
        {
          title: 'Montaj centrale termice',
          body: 'Centrale pe gaz, în condensație, cu toate avizele și punerea în funcțiune. Recomandăm puterea după casă, nu după catalog.',
          bullets: ['Demontarea celei vechi și evacuarea ei', 'Probe de presiune și punere în funcțiune', 'Doi ani garanție la manoperă'],
        },
        {
          title: 'Reparații și urgențe',
          body: 'Centrala dă eroare, caloriferele nu se încălzesc, o țeavă curge. Venim în aceeași zi pentru avarii cu apă.',
          bullets: ['Diagnostic la fața locului', 'Piese comune, aduse cu noi', 'Prețul confirmat înainte de reparație'],
        },
        {
          title: 'Instalații sanitare',
          body: 'Băi complete, bucătării, rețele de apă și canalizare. Lucrăm cu constructorul tău sau singuri, de la zero.',
          bullets: ['Trasee noi de apă rece, caldă și canalizare', 'Montaj obiecte sanitare', 'Probe înainte de închiderea pereților'],
        },
        {
          title: 'Verificări și revizii',
          body: 'Revizia anuală obligatorie și verificarea periodică, cu documentele care rămân la tine.',
          bullets: ['Curățarea schimbătorului și a arzătorului', 'Verificarea presiunii și a tirajului', 'Documentele completate pe loc'],
        },
      ],
      note: 'Prețurile de pornire se dau la telefon. Pentru lucrări mari venim la fața locului și dăm ofertă scrisă, gratuit.',
    },
    contact: {
      title: 'Contact — Termoflux',
      lead: 'Sună-ne sau scrie-ne. Pentru avarii cu apă, telefonul e mai rapid.',
      formTitle: 'Scrie-ne ce ai nevoie',
      fields: { name: 'Nume', phone: 'Telefon', message: 'Ce s-a întâmplat' },
      placeholders: {
        name: 'Numele tău',
        phone: '07xx xxx xxx',
        message: 'Centrala dă eroare E10 de aseară, apa caldă merge…',
      },
      submit: 'Trimite',
      successTitle: 'Mesaj trimis',
      successBody: 'Atât face formularul într-un demo — pe un site real, mesajul ar fi ajuns deja pe e-mail. Nu s-a trimis nimic nicăieri.',
      detailsTitle: 'Date de contact',
      phoneLabel: 'Telefon',
      phone: '0268 000 000',
      emailLabel: 'E-mail',
      email: 'contact@termoflux.example',
      hoursLabel: 'Program',
      hours: 'Luni–vineri, 08:00–18:00 · sâmbătă, 09:00–13:00',
      urgentLabel: 'Avarii cu apă',
      urgent: 'În aceeași zi, inclusiv sâmbăta',
    },
    footer: 'Termoflux SRL · Brașov · Toate drepturile rezervate',
  },
  en: {
    brand: 'Termoflux',
    tagline: 'Heating and plumbing',
    nav: { label: 'Main menu', home: 'Home', services: 'Services', contact: 'Contact' },
    home: {
      title: 'Termoflux — heating and plumbing in Brașov',
      heroTitle: 'The boiler starts today, not in a fortnight',
      heroLead: 'We install, repair and service heating and plumbing systems in Brașov and the surrounding towns. The price is agreed before we start, not discovered at the end.',
      ctaPrimary: 'Book a visit',
      ctaSecondary: 'See the services',
      trust: [
        { value: '24h', label: 'To answer a request' },
        { value: '14 years', label: 'Working in Brașov' },
        { value: '2 years', label: 'Warranty on installation' },
      ],
      servicesTitle: 'What we do',
      servicesLead: 'Four things, done properly, instead of a list nobody can read.',
      whyTitle: 'Why people call us a second time',
      why: [
        {
          title: 'The price is quoted on the phone',
          body: 'For ordinary jobs you get the range before we start. If it turns out to be something else on site, we call you before we do it.',
        },
        {
          title: 'We arrive inside the agreed window',
          body: 'A two-hour window, not "sometime during the day". If we are running late, we are the ones who call.',
        },
        {
          title: 'We leave it clean',
          body: 'Sheets on the floor, debris leaves with us. You are not left with a bathroom to clean after we finish.',
        },
      ],
      areaTitle: 'Where we come',
      areaBody: 'Brașov and the towns around it, with no call-out fee inside the city.',
      areas: ['Brașov', 'Săcele', 'Codlea', 'Ghimbav', 'Sânpetru', 'Hărman'],
    },
    services: {
      title: 'Services — Termoflux',
      lead: 'Every job has a starting price quoted in advance. The complicated ones we look at first and quote afterwards.',
      items: [
        {
          title: 'Boiler installation',
          body: 'Gas condensing boilers, with all the paperwork and commissioning. We size them to the house, not to the catalogue.',
          bullets: ['Removing and disposing of the old one', 'Pressure testing and commissioning', 'Two years of warranty on the work'],
        },
        {
          title: 'Repairs and emergencies',
          body: 'The boiler throws an error, the radiators stay cold, a pipe is leaking. Same-day for anything involving water.',
          bullets: ['Diagnosis on site', 'Common parts carried with us', 'The price confirmed before the repair'],
        },
        {
          title: 'Plumbing',
          body: 'Whole bathrooms, kitchens, water and waste runs. We work alongside your builder or on our own, from scratch.',
          bullets: ['New hot, cold and waste runs', 'Fitting sanitary ware', 'Testing before the walls are closed'],
        },
        {
          title: 'Servicing and checks',
          body: 'The annual service and the periodic inspection, with the paperwork left with you.',
          bullets: ['Cleaning the exchanger and the burner', 'Checking pressure and flue draught', 'Documents filled in on the spot'],
        },
      ],
      note: 'Starting prices are given over the phone. For larger work we come out and write a quote, free of charge.',
    },
    contact: {
      title: 'Contact — Termoflux',
      lead: 'Call us or write. For anything involving water, the phone is faster.',
      formTitle: 'Tell us what you need',
      fields: { name: 'Name', phone: 'Phone', message: 'What happened' },
      placeholders: {
        name: 'Your name',
        phone: '07xx xxx xxx',
        message: 'The boiler has been showing error E10 since last night, hot water still works…',
      },
      submit: 'Send',
      successTitle: 'Message sent',
      successBody: 'That is all the form does in a demo — on a real site the message would already be in the inbox. Nothing was sent anywhere.',
      detailsTitle: 'Contact details',
      phoneLabel: 'Phone',
      phone: '0268 000 000',
      emailLabel: 'Email',
      email: 'contact@termoflux.example',
      hoursLabel: 'Hours',
      hours: 'Monday–Friday, 08:00–18:00 · Saturday, 09:00–13:00',
      urgentLabel: 'Water emergencies',
      urgent: 'Same day, Saturdays included',
    },
    footer: 'Termoflux SRL · Brașov · All rights reserved',
  },
};
