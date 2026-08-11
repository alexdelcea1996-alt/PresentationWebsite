# Site de prezentare — Alex Delcea

Site bilingv (română / engleză) prin care îmi promovez serviciile de creare de
site-uri și aplicații web. Construit cu [Astro](https://astro.build) și
[Tailwind CSS](https://tailwindcss.com), livrat static pe Cloudflare.

Planul complet al proiectului, cu decizii și roadmap, este în [`PLAN.md`](./PLAN.md).

## Scoruri măsurate

Rulat cu Lighthouse pe build-ul de producție:

| | Performanță | Accesibilitate | Bune practici | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobil | 99 | 100 | 100 | 100 |

Zero încălcări axe-core (WCAG 2.1 AA) pe toate paginile, în ambele limbi și în
ambele teme. Fonturile: 57 kB pentru tot site-ul. Zero JavaScript de framework.

## Comenzi

| Comandă | Ce face |
|---|---|
| `npm install` | Instalează dependențele |
| `npm run dev` | Pornește serverul de dezvoltare pe `localhost:4321` |
| `npm run build` | Generează site-ul în `dist/` |
| `npm run preview` | Servește local build-ul de producție |
| `npm run check` | Verifică tipurile (TypeScript + Astro) |
| `npm run fonts` | Redescarcă și resubsetează fonturile (vezi mai jos) |
| `npm run og` | Regenerează imaginile de partajare pe social media |

## Structura

```
src/
├── i18n/
│   ├── types.ts      # structura conținutului — ambele limbi o respectă
│   ├── ro.ts         # TOT textul în română
│   ├── en.ts         # TOT textul în engleză
│   └── index.ts      # helper-e + id-urile de secțiuni
├── data/site.ts      # nume, e-mail, telefon, rețele sociale
├── components/
│   ├── sections/     # Hero, Services, Process, Portfolio, …
│   └── …             # Header, Footer, Icon, LanguageSwitcher
├── layouts/Base.astro  # <head>, SEO, hreflang, date structurate
├── pages/
│   ├── index.astro     # RO, la /
│   └── en/index.astro  # EN, la /en/
└── assets/fonts/     # fonturile self-hosted (commit-uite intenționat)
```

Regula de bază: **textul stă în `src/i18n/`, datele de contact în
`src/data/site.ts`**. Componentele doar afișează. Ca să schimbi un preț sau un
titlu nu trebuie să atingi cod de interfață.

## Cum actualizez conținutul

### Datele mele de contact

Editează `src/data/site.ts` (nume, e-mail, telefon, GitHub, LinkedIn). Câmpurile
lăsate goale pur și simplu nu se afișează.

### Un text de pe site

Caută-l în `src/i18n/ro.ts` și schimbă-l. Apoi fă aceeași modificare în
`src/i18n/en.ts` — dacă uiți ceva, `npm run check` îți semnalează.

### Un proiect nou în portofoliu

Fiecare proiect e un studiu de caz cu pagină proprie. Creezi **două fișiere cu
același nume**, câte unul per limbă:

```
src/content/case-studies/ro/nume-proiect.md
src/content/case-studies/en/nume-proiect.md
```

Numele identic al fișierului e ce leagă cele două traduceri între ele (pentru
`hreflang` și comutatorul de limbă). Adresa din browser vine din câmpul
`urlSlug`, care poate fi diferit per limbă.

```yaml
---
urlSlug: nume-proiect          # segmentul din URL, tradus
title: Numele proiectului
summary: O frază care apare pe card și ca descriere în Google.
client: Numele clientului
category: Site de prezentare
year: 2026
url: https://exemplu.ro        # opțional
repo: https://github.com/...   # opțional
tech: [Astro, Tailwind]
problem: Ce problemă avea clientul.
solution: Ce am construit.
result: Rezultatul concret.
metrics:                       # opțional, doar valori măsurate
  - label: Scor Lighthouse
    value: 100/100
order: 1                       # mai mic = mai sus în listă
---

Textul lung al studiului de caz, în Markdown.
```

Paginile apar automat la `/studii-de-caz/<urlSlug>` și `/en/case-studies/<urlSlug>`,
intră în sitemap și se leagă din secțiunea de portofoliu.

Cât timp nu există niciun studiu de caz, secțiunea afișează sloturi punctate,
marcate vizibil ca neterminate. **Nu completa cu proiecte inventate** — site-ul e
cartea ta de vizită.

Notă tehnică: câmpul se numește `urlSlug`, nu `slug`, pentru că Astro rezervă
`slug` în schemele de colecții și respinge schema în tăcere dacă îl folosești.

### Un testimonial

La fel, în `testimonials.items`. Aceeași regulă, mai strictă: pune aici doar
păreri reale, primite de la clienți reali. O recenzie inventată e o minciună
spusă în numele altcuiva.

### Prețurile

`pricing.plans` în ambele fișiere de limbă. Valorile actuale sunt orientative
și trebuie confirmate înainte de lansare.

### O pagină nouă de serviciu

Fiecare serviciu poate avea o pagină dedicată, care țintește căutări cu intenție
comercială („creare magazin online preț"). La fel ca studiile de caz: două fișiere
cu același nume, câte unul per limbă.

```
src/content/services/ro/online-store.md
src/content/services/en/online-store.md
```

Câmpul `key` (`presentation` | `shop` | `webapp` | `optimization`) leagă pagina de
cardul corespunzător din secțiunea de servicii — cardul devine automat link când
pagina există. Structura completă a frontmatter-ului se vede în
`src/content/services/ro/business-website.md`, care e tiparul de urmat.

Două lucruri contează la scris, dacă vrei ca paginile să ajute la SEO și nu să
strice:

1. **Conținut genuin diferit per pagină.** Patru pagini care sunt variații pe
   aceleași fraze sunt tratate de Google drept conținut duplicat și fac rău. Fiecare
   pagină are nevoie de propriile obiecții, propriile întrebări frecvente și propriile
   exemple.
2. **Secțiunea „nu ți se potrivește dacă" nu e opțională.** Faptul că trimiți
   deschis un vizitator către altceva — sau către un concurent — construiește mai
   multă încredere decât pierzi în trafic.

Paginile apar la `/servicii/<urlSlug>` și `/en/services/<urlSlug>`, intră în sitemap
și primesc `hreflang` corect între ele.

### Un articol nou pe blog

Aceeași convenție: două fișiere cu același nume, câte unul per limbă.

```
src/content/blog/ro/titlu-articol.md
src/content/blog/en/titlu-articol.md
```

```yaml
---
urlSlug: titlu-articol-in-romana   # segmentul din URL, tradus
title: Titlul articolului
description: O frază care apare pe card și ca descriere în Google (sub 155 caractere).
publishedAt: 2026-09-01
updatedAt: 2026-10-15              # opțional, se afișează dacă există
category: Ghid
draft: false                       # true = invizibil peste tot, inclusiv în RSS
---

Textul articolului, în Markdown.
```

Articolele apar la `/blog/<urlSlug>` și `/en/blog/<urlSlug>`, sortate după dată
(cel mai recent primul), și intră automat în sitemap și în fluxul RSS
(`/rss.xml` și `/en/rss.xml`). Timpul de citire se calculează singur.

Poți scrie doar într-o limbă: articolul apare atunci doar pe versiunea
respectivă, fără să strice nimic. Iar `draft: true` îl ține ascuns până e gata.

**Ce subiecte merită.** Articolele nu trebuie să repete paginile de serviciu — dacă
un articol spune același lucru ca pagina de serviciu, cele două se concurează
în Google în loc să se ajute. Cele mai utile sunt ghidurile practice la care
răspunzi oricum la telefon.

## Formularul de contact

Fără configurare, formularul deschide clientul de e-mail al vizitatorului cu
mesajul deja completat. Funcționează, dar pierzi mesajele celor care nu au un
client de e-mail configurat.

Ca să primești mesajele direct în inbox:

1. Creează un cont gratuit pe [web3forms.com](https://web3forms.com) și ia cheia de acces.
2. În Cloudflare, la proiect: **Settings → Environment variables → Production**,
   nume `PUBLIC_WEB3FORMS_KEY`, valoare cheia. Apoi declanșează un redeploy.
3. Pentru dezvoltare locală, pune-o în `.env`:
   ```
   PUBLIC_WEB3FORMS_KEY=cheia-ta
   ```

Formularul comută automat pe trimitere reală când cheia există.

## Publicare — Cloudflare

Site-ul se publică pe Cloudflare (proiectul rulează pe **Workers**, cu build automat
la fiecare push): CDN global, HTTPS și trafic generos, gratuit. Nu folosește GitHub
Actions (care nu pornește pe acest cont — vezi nota de la final).

Site-ul e live la
**https://presentationwebsite.alexdelcea1996.workers.dev**

Proiectul e deja conectat la repository în Cloudflare, cu setările:

| Câmp | Valoare |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `claude/portfolio-website-planning-v7mz1y` |

Fiecare push pe branch-ul de producție declanșează un build nou, automat.

### Adresa site-ului

`astro.config.ts` decide adresa în această ordine: variabila `SITE_URL`, apoi
`CF_PAGES_URL`, apoi adresa `workers.dev` scrisă explicit ca ultimă variantă.

De ce e scrisă explicit: `CF_PAGES_URL` e injectată doar de build-urile Cloudflare
**Pages**, nu și de cele **Workers** — iar acest proiect rulează pe Workers. Fără
valoarea explicită, adresa canonică, `hreflang`, `og:url`, sitemap-ul și `robots.txt`
ar trimite toate către un domeniu inexistent, ceea ce strică indexarea în Google.

Dacă schimbi vreodată adresa (domeniu propriu sau alt proiect Cloudflare), setează
`SITE_URL` în variabilele de mediu — are prioritate și nu trebuie să atingi codul.

### Variabile de mediu

În Cloudflare: **Settings → Environment variables → Production**.

| Variabilă | Când o setezi |
|---|---|
| `PUBLIC_WEB3FORMS_KEY` | Ca formularul să trimită în inbox (vezi secțiunea de mai sus) |
| `SITE_URL` | Când schimbi adresa: domeniu propriu sau alt proiect Cloudflare |

### Domeniu propriu

1. Cumpără domeniul și adaugă-l în Cloudflare la **Custom domains** (dacă domeniul
   e deja pe Cloudflare, DNS-ul se configurează singur).
2. Adaugă variabila `SITE_URL=https://domeniul-tau.ro` la Production și redeploy.

`robots.txt` se generează la build din aceeași valoare, deci se actualizează singur.

### Notă: GitHub Actions nu funcționează pe acest cont

Am încercat întâi publicarea prin GitHub Pages. După ce repo-ul a devenit public,
workflow-urile se compilează corect, dar job-urile mor în ~2 secunde fără să
execute niciun pas și fără să primească un runner (`runner_id: 0`). Am reîncercat
după 8 minute, rezultat identic. Cum pe repo-urile publice runnerele sunt gratuite,
blocajul e la nivel de cont — cel mai probabil Actions dezactivat din
**Settings → Actions → General**, sau o restricție de billing.

Am șters workflow-urile ca să nu lase eșecuri roșii pe un repo public care e el
însuși parte din portofoliu. Dacă rezolvi problema de cont și vrei CI înapoi (build
și type-check la fiecare push), se readaugă în câteva minute.

## Teme (light / dark)

Site-ul pornește pe tema preferată de sistemul vizitatorului și reține alegerea
făcută din butonul de soare/lună din header. Tema e aplicată de un script inline
în `<head>`, înainte de primul paint, deci nu apare niciodată un flash de culoare
greșită la încărcare.

**Cum sunt organizate culorile.** Toți tokenii de culoare sunt definiți în
`src/styles/global.css`, o singură dată, iar tema light doar le schimbă valorile.
Numele sunt date după **rol, nu după cât de închise sunt**:

| Token | Rol |
|---|---|
| `surface` | fundalul paginii |
| `surface-raised` | carduri |
| `surface-hover` | carduri la hover, elemente ridicate |
| `surface-deep` | footer și panouri mai adânci |
| `border` / `border-strong` | contururi |
| `fg` / `fg-muted` / `fg-subtle` | text principal / secundar / discret |
| `on-accent` | text peste gradientul accent — **nu se schimbă cu tema** |

Consecința practică: ca să adaugi o componentă nouă care funcționează în ambele
teme, folosești tokenii de mai sus și nu scrii nicio culoare fixă. Nicio
componentă nu știe că există teme.

`on-accent` e singurul fixat, pentru că stă peste gradientul indigo→cyan, care e
luminos în ambele teme.

## Fonturi

Space Grotesk și Inter sunt descărcate ca fonturi variabile, **subsetate la
caracterele pe care site-ul le folosește efectiv** și commit-uite în repo, în
`src/assets/fonts/`. Build-ul nu depinde de rețea și dă același rezultat oriunde.

Subsetarea taie 170 kB la **57 kB** (−66%). Cel mai mare câștig e la fișierul
`latin-ext` al lui Inter: 83 kB → 7 kB, pentru că din tot alfabetul extins
european site-ul are nevoie doar de diacriticele românești.

`npm run fonts` reia tot lanțul: descarcă de la Google, adună caracterele din
`src/i18n/`, `src/content/` și `src/data/`, le unește cu o listă de bază
(ASCII, Latin-1, setul românesc complet — și cu virgulă, și cu sedilă — plus
semnele tipografice folosite în design) și rulează `pyftsubset`.

**Când trebuie rulat din nou:** dacă adaugi conținut în altă limbă, cu litere
care nu sunt în lista de bază (de exemplu poloneză sau maghiară). Altfel acele
câteva litere se vor afișa cu fontul de sistem. Necesită `pip install fonttools brotli`.

Fiecare familie are două fișiere separate pe `unicode-range`: `latin` și
`latin-ext` — al doilea se descarcă doar pe paginile care chiar folosesc
diacritice.

## Securitate

Header-ele HTTP sunt generate la build de `scripts/build-headers.mjs`, care
scrie `dist/_headers` (formatul citit de Cloudflare). Rulează automat ca parte
din `npm run build`.

Politica de securitate a conținutului (CSP) nu folosește `unsafe-inline`.
Site-ul are câteva scripturi inline de care nu se poate lipsi — în primul rând
cel care stabilește tema înainte de primul paint — iar a permite tot codul
inline ca să le acopere ar anula aproape tot rostul unui CSP. Un site static nu
poate folosi nonce-uri, pentru că HTML-ul nu se generează la fiecare cerere, așa
că scriptul calculează **hash-uri SHA-256** din blocurile inline pe care Astro
chiar le-a emis și le trece în politică.

Consecința practică: **dacă modifici un script inline sau CSS-ul fonturilor,
hash-urile se regenerează singure la următorul build.** Nu ai ce întreține
manual. Dar dacă adaugi un serviciu extern (analytics, hartă, widget), trebuie
adăugat explicit în `scripts/build-headers.mjs` — altfel browserul îl blochează.

Pe lângă CSP: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy` care refuză cameră, microfon și localizare, și
`Cross-Origin-Opener-Policy`.
