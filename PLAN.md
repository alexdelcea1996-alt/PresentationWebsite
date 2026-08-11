# Plan: Site de prezentare — servicii web development

> Documentul de planificare al proiectului. Se actualizează pe măsură ce luăm decizii noi.

## 1. Obiectiv

Site de prezentare personal care promovează serviciile de **creare de website-uri și
webapp-uri**, cu scopul de a genera cereri de ofertă (lead-uri) de la clienți.

Site-ul în sine este o carte de vizită: trebuie să demonstreze prin propria execuție
(design, viteză, SEO) calitatea serviciilor oferite.

**Public țintă:**
- Firme mici și mijlocii din România care au nevoie de prezență online (RO)
- Clienți internaționali / colaborări remote (EN)

## 2. Decizii cheie

| Decizie | Alegere | Motivație |
|---|---|---|
| Framework | **Astro 5 + Tailwind CSS 4** | Site static ultra-rapid (zero JS implicit), SEO excelent, componente moderne; se pot adăuga ulterior insule React pentru demo-uri interactive |
| Limbi | **RO (implicit) + EN** | RO la rădăcină (`/`), EN sub `/en/`, comutator în header, `hreflang` pentru SEO |
| Design | **Dark & premium** | Fundal închis, accente gradient, tipografie mare — stilul agențiilor moderne de web |
| Tip layout | **Single-page landing** (per limbă) | Conversie bună pentru servicii de freelancing; studii de caz dedicate pot deveni pagini separate în v2 |
| Hosting | **GitHub Pages** (deploy automat din GitHub Actions) | Gratuit, HTTPS, suport domeniu propriu; repo-ul e deja pe GitHub |
| Formular contact | **Web3Forms sau Formspree** (de confirmat) | Nu necesită backend pe un site static; fallback: link direct de e-mail și WhatsApp |

## 3. Arhitectura site-ului

O singură pagină lungă per limbă, cu navigare prin ancore:

```
/            → versiunea RO
/en/         → versiunea EN
```

Ordinea secțiunilor (aceeași în ambele limbi):

1. **Header** — logo/nume, linkuri ancoră, comutator RO/EN, buton CTA „Cere ofertă"
2. **Hero** — mesaj principal + subtitlu + 2 CTA-uri (Cere ofertă / Vezi proiecte) + 2-3 cifre cheie
3. **Servicii** — carduri: site de prezentare, magazin online, webapp custom, mentenanță & optimizare
4. **Proces de lucru** — 5 pași: Discuție → Ofertă → Design → Dezvoltare → Lansare & suport
5. **Portofoliu** — carduri de proiect (problemă → soluție → rezultat, tehnologii); pornim cu placeholder-e
6. **Testimoniale** — carduri cu recenzii; pornim cu structura, se populează pe parcurs
7. **Prețuri** — 3 pachete orientative („de la…") + CTA pentru ofertă personalizată
8. **Contact** — formular (nume, e-mail, tip proiect, buget, mesaj) + date directe de contact
9. **Footer** — linkuri, social, copyright

Opțional în viitor: secțiune FAQ (bună pentru SEO), pagini dedicate de studii de caz, blog.

## 4. Structura proiectului

```
/
├── astro.config.mjs          # config Astro + i18n + sitemap
├── src/
│   ├── styles/global.css     # Tailwind + design tokens
│   ├── i18n/
│   │   ├── ro.json           # traduceri RO
│   │   ├── en.json           # traduceri EN
│   │   └── utils.ts          # helper useTranslations()
│   ├── layouts/Base.astro    # <head>, meta, fonturi, hreflang
│   ├── components/
│   │   ├── Header.astro / Footer.astro / LanguageSwitcher.astro
│   │   └── sections/         # Hero, Services, Process, Portfolio,
│   │                         # Testimonials, Pricing, Contact
│   ├── data/                 # servicii, proiecte, pachete (conținut separat de UI)
│   └── pages/
│       ├── index.astro       # RO
│       └── en/index.astro    # EN
├── public/                   # favicon, imagine OG, robots.txt
└── .github/workflows/deploy.yml   # build + deploy pe GitHub Pages
```

Principiu: **conținutul stă în `src/data/` + `src/i18n/`**, componentele doar îl afișează.
Astfel actualizarea prețurilor sau adăugarea unui proiect nu atinge codul de UI.

## 5. Design system (dark & premium)

- **Fundal:** aproape negru cu tentă albastră (`#0B0F1A`), mesh/glow subtil de gradient în hero
- **Accent:** gradient indigo → cyan (folosit pe CTA-uri, hover, borduri de card)
- **Text:** alb cald pentru titluri, gri deschis pentru corp
- **Fonturi:** Space Grotesk (titluri) + Inter (text), self-hosted prin `@fontsource` pentru performanță
- **Componente:** carduri glassmorphism cu borduri gradient subtile, butoane cu glow la hover
- **Animații:** reveal la scroll (IntersectionObserver, CSS-first), discrete — fără librării grele
- **Accesibilitate:** contrast AA minim, focus states vizibile, `prefers-reduced-motion` respectat

## 6. i18n

- Astro i18n routing nativ: `defaultLocale: 'ro'`, `locales: ['ro', 'en']`
- Dicționare JSON per limbă, un singur set de componente
- `hreflang` RO/EN + `lang` corect pe `<html>` în fiecare versiune
- Comutatorul de limbă păstrează poziția (ancora) curentă

## 7. SEO & performanță

- Meta title/description per limbă, Open Graph + imagine OG dedicată
- `@astrojs/sitemap` + `robots.txt`
- JSON-LD `ProfessionalService` (nume, servicii, zonă, contact)
- Țintă Lighthouse: **95+ pe toate categoriile** (argument de vânzare în sine — poate fi afișat pe site)
- Imagini optimizate prin componenta `<Image>` din Astro (AVIF/WebP)

## 8. Deployment

- GitHub Actions cu `withastro/action` → GitHub Pages, la fiecare push pe `main`
- Ulterior: domeniu propriu (ex. `alexdelcea.ro` / `.dev` — de decis și achiziționat), HTTPS automat
- Opțional la lansare: analytics ușor (Plausible/Umami/GA4 — de decis)

## 9. Roadmap

| Fază | Livrabil | Conținut |
|---|---|---|
| **M1 — Fundație** | Schelet deployat, live pe GitHub Pages | Astro + Tailwind + i18n RO/EN + pipeline de deploy |
| **M2 — Identitate** | Prima impresie completă | Design tokens, Header + comutator limbă, Hero, Footer |
| **M3 — Conținut** | Toate secțiunile | Servicii, Proces, Portofoliu, Testimoniale, Prețuri (cu placeholder-e unde lipsește conținut real) |
| **M4 — Conversie & finisaj** | Site funcțional cap-coadă | Formular de contact funcțional, SEO complet, animații, audit Lighthouse + accesibilitate |
| **M5 — Lansare** | Site public oficial | Conținut real final, domeniu propriu, analytics, imagine OG |

## 10. Conținut necesar de la Alex

De pregătit pe parcurs (până la M5); între timp folosim placeholder-e marcate clar:

- [ ] Nume/brand exact afișat pe site (ex. „Alex Delcea — Web Developer" sau un nume de brand)
- [ ] Poză de profil sau logo (opțional, dar recomandat)
- [ ] Lista serviciilor exacte + descrieri scurte
- [ ] 2–3 proiecte pentru portofoliu (nume, descriere, link, capturi de ecran)
- [ ] Prețuri reale pentru pachete (sau decizia de a nu afișa prețuri)
- [ ] Date de contact publice: e-mail, telefon/WhatsApp, LinkedIn/GitHub
- [ ] Testimoniale reale (când există)
- [ ] Domeniu dorit

## 11. Decizii rămase deschise

1. Serviciul de formular: **Web3Forms** (gratuit, nelimitat) vs **Formspree** (50 mesaje/lună gratuit)
2. Afișăm prețuri concrete sau doar „de la X €" / „cere ofertă"?
3. Domeniul propriu — nume și extensie (.ro / .dev / .com)
4. Analytics la lansare — da/nu și care
