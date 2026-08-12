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
| Mobil | 97–100 | 100 | 100 | 100 |

Prima pagină e cea care dă 97 pe mobil, fiindcă e cea mai lungă; subpaginile stau
la 99–100. Ce o ține acolo e **FCP-ul de 2,0 s**, singura metrică sub punctaj
maxim: TBT e 0, CLS e 0, LCP-ul e egal cu FCP-ul. Curba de punctaj Lighthouse e
abruptă exact în jurul valorii de 2 s, deci ultimul punct costă zecimi de secundă
pe drumul critic.

Am încercat două lucruri și le-am măsurat, nu le-am presupus:

- **Hero-ul nu mai depinde de JavaScript** ca să fie vizibil (vezi mai jos). LCP-ul
  a coborât până la FCP, dar scorul a rămas 97 — FCP-ul era bariera, nu reveal-ul.
- **Fără preîncărcarea fonturilor**, FCP-ul scade la 1,7–1,8 s, dar CLS-ul sare de
  la 0 la **0,19** (textul se reașază când intră fontul) și scorul cade la **85**.
  Preload-urile rămân; compromisul e prost.

Ce n-am făcut, deliberat: inlining la cei 55 kB de CSS ar scuti o rundă de rețea și
probabil ar aduce punctul, dar ar adăuga ~10 kB comprimați pe **fiecare** pagină, fără
cache între ele. Ar face vizita reală de 3 pagini mai lentă ca să câștige un punct
sintetic pe una. Las cifra măsurată.

Măsurat pe un server care comprimă ca Cloudflare (brotli): prima pagină trece
prin rețea în **18,4 kB**, nu în 126. Fără compresie, măsurătoarea locală arăta
un scor mobil mai mic decât realitatea de pe site-ul live.

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
| `npm test` | Rulează cele 711 de verificări peste build (vezi [`tests/`](./tests/README.md)) |
| `npm run fonts` | Redescarcă și resubsetează fonturile (vezi mai jos) |
| `npm run icons` | Regenerează setul de iconuri și manifestul din `favicon.svg` |
| `npm run shots` | Refotografiază site-ul pentru propriul studiu de caz |

`npm test` are nevoie de un build recent — testele verifică ce e în `dist/`, nu
codul sursă, fiindcă jumătate din ce se poate strica (hash-urile CSP, `_headers`,
`hreflang`) există doar după build:

```bash
npm run build && npm test
```

## Structura

```
src/
├── i18n/
│   ├── types.ts      # structura conținutului — ambele limbi o respectă
│   ├── ro.ts         # TOT textul în română
│   ├── en.ts         # TOT textul în engleză
│   └── index.ts      # helper-e + id-urile de secțiuni
├── data/site.ts      # nume, e-mail, telefon, WhatsApp, rețele sociale
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

Editează `src/data/site.ts` (nume, e-mail, telefon, WhatsApp, GitHub, LinkedIn).
Câmpurile lăsate goale pur și simplu nu se afișează.

Numerele se scriu exact cum vrei să apară pe site — linkurile se construiesc
doar din cifre, deci spațiile și `+`-ul sunt strict cosmetice:

```ts
phone: '+40 767 079 882',      // link tel:+40767079882
whatsapp: '+40 767 079 882',   // link wa.me/40767079882
phone: '',                     // rândul dispare peste tot
```

Ambele apar în cardul de contact **și** în footer, deci și pe paginile care nu
au secțiune de contact (servicii, blog, studii de caz). Numărul e scris o
singură dată în fiecare loc, pe rândul de telefon; linkul de WhatsApp poartă un
îndemn („Scrie-mi pe WhatsApp") în loc să-l repete. Textul e în
`contact.whatsappAction`.

Golirea lui `phone` scoate și `telephone` din datele structurate. Acolo se
publică forma apelabilă (`+40767079882`), nu cea cu spații — pe aia o citesc
motoarele de căutare.

Conversația de WhatsApp pornește cu un mesaj deja scris („Bună! Am văzut
site-ul tău…"), diferit pe RO și pe EN. Textul e în `contact.whatsappMessage`,
în `src/i18n/ro.ts` și `src/i18n/en.ts`; șterge-l dacă preferi chat gol.

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
coverDesktop: ../images/proiect-desktop.png   # opțional, dar recomandat
coverMobile: ../images/proiect-mobile.png     # opțional
coverAlt: Ce se vede în capturi, pentru cine nu le poate vedea.
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

**Capturile.** Pune fișierele în `src/content/case-studies/images/`. Le
optimizează Astro automat: AVIF, mai multe lățimi, `width`/`height` puse în
markup ca să nu sară pagina la încărcare. Nu le comprima tu înainte — dă-mi
originalul, la rezoluție mare.

Capturile apar în două locuri: ca miniatură pe cardul din portofoliu și, pe
pagina studiului de caz, într-o ramă de browser cu telefonul alături. Rama nu e
decor: o captură a unui site pusă pe un site se citește ca parte din pagină, nu
ca poza altui ecran.

Pentru site-ul ăsta, capturile se fac singure cu `npm run shots` (după un build).
Pentru proiectele clienților, îmi trimiți tu URL-ul sau fișierele.

### Un testimonial

În `testimonials.items`, în ambele fișiere de limbă. Aceeași regulă ca la
portofoliu, mai strictă: pune aici doar păreri reale, primite de la clienți
reali. O recenzie inventată e o minciună spusă în numele altcuiva.

Cât timp lista e goală, **secțiunea nu se randează deloc** și în locul ei stă
secțiunea de garanții. Trei casete punctate goale nu semnalau onestitate —
anunțau că nu ai clienți. La primul testimonial real, secțiunea reapare singură.

### Întrebările de pe prima pagină

`homeFaq` în `src/i18n/ro.ts` și `en.ts`, șase întrebări cu răspuns, afișate ca
acordeoane deasupra formularului de contact.

**Aceeași regulă ca la garanții: niciun răspuns nu are voie să promită ceva nou.**
Fiecare reformulează ceva deja publicat — prețurile din carduri, pașii din proces,
coloana „nu îți garantez", paginile de serviciu. Ultima întrebare e chiar refuzul:
nu se garantează primul loc în Google. Dacă schimbi un preț sau un termen în altă
parte, verifică și aici.

Răspunsul despre ce trebuie să pregătească clientul leagă articolul de blog
existent, iar adresa se rezolvă din colecție prin `getPostByKey()` — nu e scrisă a
doua oară. Testul deschide linkul și verifică să răspundă cu 200, ca să nu rămână
un link mort dacă articolul e redenumit.

Schema `FAQPage` se emite ca **bloc separat** de entitatea de afacere, iar testul
compară întrebările din schemă cu cele randate: nu pot diverge.

### Garanțiile

`guarantees` în `src/i18n/ro.ts` și `en.ts`, două liste: `yes` și `no`.

Regula acestei secțiuni: **nu are voie să conțină nicio promisiune nouă**.
Fiecare rând trebuie să existe deja altundeva pe site — în proces, în prețuri sau
în întrebările frecvente de pe paginile de serviciu. Secțiunea doar le adună la
un loc, unde le citește cineva.

Coloana `no` nu e decor. Site-ul spune în două locuri că nimeni onest nu poate
garanta locul întâi în Google; o secțiune de garanții care ar sări peste asta ar
contrazice restul site-ului și ar arăta ca oricare alta.

### „Despre mine" și poza

`about` în `src/i18n/ro.ts` și `en.ts`, afișat de `src/components/sections/About.astro`,
imediat sub garanții — întâi promisiunile, apoi cine le face.

Aceeași regulă, a treia oară: **niciun rând nu are voie să afirme ceva ce nu e deja
pe site.** Fără ani de experiență, fără număr de proiecte, fără biografie. Textul
reformulează răspunsul în 24 de ore, discuția gratuită de 30 de minute, prețul fix
din ofertă, codul pe numele tău și refuzul de a garanta locul în Google.

Testul păzește exact asta: adună toate cifrele din secțiune și cade dacă apare
alta în afară de **24** și **30**. Un rând ca „10 ani de experiență" nu trece de
suită — a fost verificat prin plantarea lui.

**Ca să apară poza:** pui un fișier numit exact `portrait.jpg` (sau `.png`, `.webp`,
`.avif`) în `src/assets/about/` și gata — nu se schimbă niciun cod. Format vertical
4:5 (de pildă 1200×1500 px); Astro o convertește în AVIF. Textul alternativ vine din
`about.photoAlt`. Fără fișier, cardul arată terminat: nume, rol, trei fapte și
buton — nu există chenar punctat care să aștepte ceva. Detalii în
`src/assets/about/README.md`.

### Prețurile

**Aceeași ofertă apare în patru liste scrise de mână**, în fișiere diferite:
cardurile din secțiunea de servicii, pachetele de preț (`pricing.plans`),
configuratorul (`src/data/configurator.ts`) și dropdown-ul din formular. Nimic
nu le ținea sincronizate, și au și divergat: magazinul online avea pagină
proprie, intrare în configurator și preț publicat de la 2.200 €, dar **niciun
card de preț** — cine se uita la prețuri trăgea concluzia că nu faci magazine.

Suita `offers` verifică acum invariantul: o ofertă care apare în mai multe
locuri trebuie să poarte aceeași cifră peste tot și să nu lipsească din
niciunul. Dacă adaugi un pachet, adaugă-l în toate patru — sau testele îți spun
care a rămas în urmă, cu cifra cu tot.

O singură ofertă rămâne intenționat asimetrică: **optimizarea** are pagină și
card de serviciu, dar nu e pachet, fiindcă e audit plus intervenție punctuală,
nu livrabile fixe. Restul apar în toate cele patru liste.

Grila de servicii are acum cinci carduri. La număr impar, ultimul se întinde pe
toată lățimea în loc să rămână singur într-un rând pe jumătate gol — se
calculează în `Services.astro`, nu e scris de mână.

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

**Prețurile din articole sunt verificate de teste.** Suita `offers` extrage fiecare
sumă în euro din fiecare articol și cade dacă apare una care nu e pe cardurile de
preț. Dacă schimbi un preț pe site, articolul care îl citează pică până îl aliniezi
— exact ca să nu rămână o cifră veche într-un text pe care nu ți-l mai amintești.
Aceeași suită deschide fiecare link intern din articole și verifică să răspundă cu
200, fiindcă Markdown nu are cum să prindă o adresă greșită la build.

**Tabelele funcționează** în articole (sintaxa obișnuită cu `|`). Sunt stilate în
`BlogPost.astro` și se strâng singure pe telefon, fără derulare orizontală.

### Politica de confidențialitate

`src/content/legal/{ro,en}/privacy.md` — o colecție de conținut, ca serviciile și blogul,
deci se scrie în Markdown și se împerechează pe limbi prin numele fișierului. Rutele sunt
`/confidentialitate/` și `/en/privacy/`; adresa vine din `urlSlug`, deci se schimbă dintr-un
singur loc.

**Regula ei: descrie ce face site-ul, nu ce ar suna bine.** Textul de dinainte de sub
formular spunea „Nu le trimit nimănui" — fals, fiindcă mesajul poate trece prin Web3Forms
pe drum spre inbox. Dacă schimbi vreodată felul în care funcționează ceva (alt serviciu de
formular, statistici, orice cere date), **actualizezi pagina și `updatedAt` din front
matter** în aceeași modificare.

Pagina e legată din două locuri, amândouă verificate de suita `legal`: sub formular (acolo
contează, când omul e pe cale să scrie) și în bara de jos din footer.

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

## Programare directă (Cal.com)

**Activă.** Calendarul conectat e
`cal.com/delcea-alexandru-arqdvl/30min`, setat prin `calLink` în
`src/data/site.ts`. Apare un card în secțiunea de contact, iar calendarul se
deschide într-un modal peste pagină, fără să părăsești site-ul.

Ca s-o schimbi sau s-o oprești, editezi aceeași linie:

```ts
calLink: 'alt-nume/60min',   // altă adresă
calLink: '',                 // oprită complet
```

**Cu `calLink` gol nu se randează absolut nimic** — nici markup, nici
JavaScript, iar politica de securitate rămâne cu `frame-src 'none'`. Nu există
buton mort.

### De ce nu folosesc scriptul de embed al Cal.com

Cal.com oferă un script care injectează calendarul în pagină. L-am evitat
deliberat, din trei motive:

1. **Ar aduce ~100 kB de JavaScript străin** pe un site care se laudă cu zero
   JavaScript de framework. Ar fi trebuit încărcat de toți vizitatorii, ca să
   servească pe cei câțiva care chiar programează.
2. **Ar fi slăbit CSP-ul** cu `script-src` către un domeniu terț și, foarte
   probabil, cu `style-src 'unsafe-inline'` — pentru stilurile pe care embed-ul
   le injectează în pagina gazdă. Adică exact lucrul pe care l-am evitat.
3. Nu l-aș fi putut testa: din mediul în care a fost construit site-ul,
   `cal.com` era inaccesibil.

În loc de asta, pagina de programare Cal.com e încărcată direct într-un `iframe`,
la cerere, când apeși butonul. Costul pentru restul vizitatorilor e zero, iar CSP
are nevoie doar de `frame-src` — fără script terț și fără `unsafe-inline`.

### Ce rămâne de verificat de tine

Nu am putut testa cu un calendar real. **La prima activare, verifică două
lucruri:** că respectivul calendar chiar se afișează în modal (dacă Cal.com
refuză încadrarea în iframe, rămâne alb), și că rezervarea merge până la capăt.

Dacă modalul rămâne gol, ai deja plasa de siguranță: în antetul lui e un link
„Deschide în filă nouă", iar butonul principal e oricum un link real către
pagina ta Cal.com — deci fără JavaScript, sau dacă ceva pică, programarea
funcționează în continuare, doar într-o filă nouă.

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

### E site-ul live la zi? `/version.txt`

```
https://presentationwebsite.alexdelcea1996.workers.dev/version.txt
```

Scrie din ce commit e construit ce vezi în browser. Compari cu `git log -1` și
știi în două secunde dacă publicarea a ajuns sau nu. Fișierul se scrie la fiecare
build de `scripts/build-version.mjs`, din variabila pe care o pune platforma
(`WORKERS_CI_COMMIT_SHA` pe Workers, `CF_PAGES_COMMIT_SHA` pe Pages) sau din git,
local.

Există fiindcă lipsea: o pagină a fost comitată de două ori, ambele build-uri au
ieșit verzi, iar adresa continua să servească altceva — și nimic de pe site nu
spunea asta.

### `wrangler.jsonc` — fără el, site-ul nu se publică

Un proiect Workers legat la Git rulează, după build, pasul de deploy
(`npx wrangler deploy`). Ăla citește `wrangler.jsonc` din rădăcina repo-ului. Fără
fișier, **build-ul reușește și publicarea eșuează** — iar site-ul rămâne înghețat
pe ultima versiune publicată, la nesfârșit, fără ca vreo pagină să arate stricat.
Așa a stat o vreme aici: codul se aduna în repo, adresa live arăta altceva.

Ce e important în el:

| Câmp | De ce contează |
|---|---|
| `name` | **Trebuie să rămână `presentationwebsite`** — e workerul care se actualizează, adică prima jumătate din `presentationwebsite.alexdelcea1996.workers.dev`. Altă valoare creează un worker nou, la altă adresă, și cel vechi rămâne cum era. |
| `assets.directory` | `./dist`. De acolo se ia și `_headers`, deci CSP-ul și regulile de cache vin odată cu paginile. |
| `assets.not_found_handling` | `404-page` — adresele inexistente primesc pagina 404 desenată, cu status 404 real. |

Dacă vreodată site-ul pare că a rămas în urmă față de repo, ăsta e primul loc de
verificat: Cloudflare → proiect → **Deployments**, și compari commit-ul de sus cu
`git log -1`.

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
| `PUBLIC_PAGESPEED_KEY` | Ca banda de audit să facă auditul pe loc, nu doar să trimită la formular |
| `PUBLIC_CF_BEACON_TOKEN` | Ca să vezi statistici de trafic (vezi „Statistici de trafic" mai jos) |
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

## Banda cu măsurători (sub hero)

Hero-ul promite „95+ scor Lighthouse". Banda de sub el dovedește, măsurând chiar
pagina pe care stă, în browserul vizitatorului. Nimic nu e scris de mână la build:

- **Conținut afișat în** — Largest Contentful Paint, exact metrica pe care o
  folosește Google
- **Cât cântărește** — suma `decodedBodySize` pe toate resursele plus documentul
- **Din care JavaScript** — scripturile externe plus textul celor inline (JSON-LD
  nu intră, e date, nu cod)

Trei detalii care contează dacă umbli la ea:

1. Folosește `decodedBodySize`, **nu `transferSize`**. Cu `transferSize`, un
   vizitator care revine ar vedea „2 kB", fiindcă totul vine din cache — adevărat,
   dar arată a defect.
2. Măsoară **când pagina s-a liniștit** (`requestIdleCallback`), nu la `load`.
   Favicon-ul aterizează exact în jurul lui `load`, iar o cifră care variază cu un
   kilobyte de la o încărcare la alta nu merită arătată.
3. Fără JavaScript banda **nu se afișează deloc** — nu există măsurători, deci nu
   are ce arăta. Clasa `.js-only` se ocupă de asta.

Ca s-o scoți, ștergi `<LiveMetrics />` din `src/components/Home.astro`. Textele sunt
în `liveMetrics`, în `src/i18n/ro.ts` și `en.ts`.

**De reținut:** pe o conexiune proastă va afișa un timp mai mare. Asta e ideea —
cifra e reală. Dacă preferi să apară doar sub un prag, se poate.

## Auditul instant (Google PageSpeed)

Banda de audit poate verifica pe loc site-ul unui vizitator: introduce adresa,
iar in ~30 de secunde vede cele patru scoruri Lighthouse si primele trei
probleme, in designul site-ului, urmate de un buton spre formular cu adresa deja
completata.

**E oprit pana pui o cheie.** Fara ea, banda ramane exact ce era: un buton care
duce la formular. Nu randam un camp care esueaza mereu - API-ul Google raspunde
429 aproape imediat fara cheie.

Ca sa-l pornesti:

1. Creeaza o cheie in Google Cloud Console pentru **PageSpeed Insights API**
   (gratuita).
2. **Restrictioneaz-o pe domeniul tau** (HTTP referrer). Apelul se face din
   browserul vizitatorului, deci cheia e vizibila in pagina - asa e proiectat
   API-ul. Cu restrictia pusa, nu o poate folosi altcineva.
3. In Cloudflare, variabila `PUBLIC_PAGESPEED_KEY`. Apoi redeploy.

Cateva lucruri gandite dinainte:

- **CSP-ul se largeste singur.** `connect-src` primeste `googleapis.com` doar
  cand unealta e pe pagina. Fara cheie, politica ramane stransa.
- **Textul benzii se schimba.** Varianta statica promite un audit scris in 48 de
  ore; cea live raspunde in secunde, deci are propria fraza.
- **Suita de teste urmareste starea build-ului.** Acum verifica varianta cu
  buton. In clipa in care pui cheia, aceleasi teste incep sa verifice unealta,
  cu API-ul simulat. Nu ai nimic de schimbat.

## Bugete de greutate

Cât cântărește site-ul nu mai e doar raportat, ci **asertat**: suita `weight`
citește direct `dist/` și pică dacă vreun artefact trece de bugetul lui. Fără
browser și fără cronometru — o picare înseamnă mereu că s-a îngrășat ceva, nu că
mașina era ocupată. Brotli se calculează local cu `node:zlib`, la calitatea 11,
adică fix ce livrează Cloudflare pentru un fișier static.

Măsurătorile de azi și pragurile puse peste ele (azi + ~10-15%):

| Ce | Azi | Buget |
|---|---|---|
| Prima pagină, comprimată | 19,7 kB | 22 kB |
| Prima pagină, HTML brut | 138,5 kB | 155 kB |
| Cea mai grea sub-pagină | 45,4 kB brut | 60 kB |
| Foaia de stil (una singură) | 8,9 kB / 54,6 kB | 10,5 / 62 kB |
| Fiecare bundle de demo | 5,6 și 5,0 kB | 7 kB |
| JS inline pe prima pagină | 14,6 kB | 17 kB |
| Fonturile, toate patru | 56,8 kB | 64 kB |
| Cea mai mare imagine OG | 90,9 kB | 120 kB |

Când depășești un buget **intenționat** — o secțiune nouă, o fotografie, un
demo în plus — îl ridici în `tests/suites/weight.mjs` și actualizezi comentariul
„azi e X" de deasupra. Editarea aia e evidența deciziei; fără ea, creșterea trece
neobservată an de an, care e exact felul în care ajung site-urile la 4 MB.

Suita verifică și forma, nu doar cifrele: o singură foaie de stil, exact două
bundle-uri de JS, exact patru fonturi. Dacă apare al treilea bundle, pică — chiar
dacă e mic.

## Statistici de trafic (Cloudflare Web Analytics)

Site-ul poate raporta câți oameni îl deschid, de unde vin și cât de repede se
încarcă paginile, **fără cookie-uri și fără banner de consimțământ** — Cloudflare
Web Analytics nu pune niciun identificator în browserul vizitatorului.

**E oprit până pui tokenul.** Fără el nu se emite niciun script de statistică —
nu unul dezactivat, ci deloc — iar politica de securitate nici măcar nu permite
conectarea la Cloudflare pentru asta.

Ca să-l pornești:

1. În Cloudflare: **Analytics & Logs → Web Analytics → Add a site**, cu adresa
   site-ului. Îți dă un *site token* (un șir hexazecimal).
2. Pune-l în variabila `PUBLIC_CF_BEACON_TOKEN` la Production și redeploy.
3. Verifică: în sursa paginii trebuie să apară, ultimul lucru din `<body>`, un
   script de la `static.cloudflareinsights.com`.

Ce se întâmplă singur când tokenul e pus:

- **CSP-ul se lărgește exact cât trebuie**: `script-src` primește
  `static.cloudflareinsights.com` (de unde se încarcă) și `connect-src` primește
  `cloudflareinsights.com` (unde raportează). Două origini, nu una — beaconul se
  servește dintr-un loc și trimite în altul. Detecția se face din HTML-ul
  construit, la fel ca la auditul PageSpeed.
- **Suita `analytics` schimbă ramura.** Acum verifică absența: niciun script, nicio
  cerere, CSP nelărgit, pe patru pagini. Cu token, verifică prezența: exact un
  beacon per pagină, `defer`, token nevid, se încarcă fără să încalce politica,
  ultimul în `body`. Ambele ramuri au fost rulate; ramura „pornit" a fost validată
  scoțând intenționat lărgirea de CSP, iar testul a prins blocarea la nivel de
  browser (`script-src-elem`).

**Tokenul e public prin proiectare** — identifică site-ul măsurat, nu contul, și
e menit să stea în pagină.

**Un lucru de făcut manual:** secțiunea „Statistici de trafic" din politica de
confidențialitate e scrisă ca să fie adevărată în ambele stări și îi spune
cititorului cum să verifice singur. Dacă tokenul rămâne pus definitiv, merită
rescrisă la afirmativ („site-ul rulează Cloudflare Web Analytics"), în RO și EN.

## Cadranele de scor din studiul de caz

Metricile cu un câmp `score` (0-100) se desenează ca inele in stil Lighthouse, in
loc de text. Arcul se umple cand ajunge pe ecran, **fara JavaScript**: observatorul
de reveal pune `.is-visible`, iar CSS-ul face tranzitia. Fara scripting, arcul e
desenat plin din start.

Un lucru care merita stiut daca atingi componenta: **un atribut `style` nu
functioneaza pe acest site.** CSP-ul are `style-src` fara `unsafe-inline`, deci
browserul arunca atributele `style` din markup in intregime - tacut, pagina merge
mai departe ca si cum nu ai fi scris nimic. Asa au aparut cadranele goale prima
data. Valoarea vine acum printr-un bloc `<style>` generat de pagina, care primeste
hash in CSP. Exista si un test care verifica asta pe tot site-ul.

(Scrierile din JavaScript prin `element.style.x = ...` sunt in regula - CSP nu le
acopera. Doar atributele din markup sunt refuzate.)

## Demo-urile jucabile (`/demo/`, `/demo/magazin/`)

Site-ul vinde aplicații web, dar până acum demonstra doar un site. Pagina asta
e afirmația făcută verificabilă: **o aplicație de programări care chiar
funcționează** — adaugi, marchezi „a venit", anulezi, reactivezi, ștergi, treci
dintr-o zi în alta, filtrezi după stare, iar încasările se recalculează.

Al doilea demo, la **`/demo/magazin/`** și `/en/demo/store/`, e un **magazin
online**: catalog cu variante și stoc, coș, checkout pe un singur ecran și
confirmare de comandă. Nu e ales la întâmplare ce demonstrează — pagina de
serviciu spune că cele mai multe coșuri se pierd fiindcă transportul apare ca
surpriză la final, așa că demo-ul afișează costul livrării **din primul produs**,
împreună cu cât mai e până la livrarea gratuită. Tot de acolo vin și celelalte:
un produs epuizat nu poate fi comandat, iar ecranul de final enumeră ce se
întâmplă singur mai departe (factură, AWB, stoc).

**Cum ajungi la ele:** „Demo" în meniul de sus și în footer duce la cel de
programări, iar cele două demo-uri se leagă între ele printr-un rând de file sub
titlu. În plus, un buton „Vezi un demo funcțional" apare pe cardul și pe pagina
fiecărui serviciu care are un demo — „Aplicație web custom" și „Magazin online".
**Nu** apare la site de prezentare sau optimizare: acolo n-ar avea ce arăta.
Legătura serviciu → demo se face într-un singur loc, `demoForService()` din
`src/data/demo.ts`.

Butonul din card e singurul link dintr-un card al cărui titlu e *stretched*
(`after:inset-0`, adică toată suprafața cardului duce la pagina de serviciu).
De-aia are `relative z-10`: fără el, clicul e înghițit de suprafață și
vizitatorul ajunge pe pagina de serviciu, nu pe demo — o defecțiune care nu se
vede. Suita chiar dă click pe el și verifică unde ajunge.

**Datele sunt inventate și nu pleacă nicăieri.** Se salvează în `localStorage`,
sub cheia `demo-bookings-v1`, în browserul vizitatorului. Nu există server, nu
există cont, nu văd nimic. Scrie asta și în pagină, sub aplicație.

**Stau pe paginile lor, nu pe prima pagină.** Sunt singurele bucăți de
JavaScript din site care nu sunt inline: 5,1 kB pentru programări și 5,7 kB
pentru magazin, servite din `/_astro/` cu cache permanent. Puse în hero, ar fi
urcat bugetul primei pagini pentru ceva ce majoritatea vizitatorilor nu deschid.
Așa, prima pagină **nu încarcă niciun script extern** — suitele `demo` și
`store` verifică asta la fiecare rulare.

### Ce se schimbă și unde

Programările stau în `src/i18n/ro.ts` și `en.ts`, în blocul `demo`:

- `services` — lista de servicii din dropdown (`['Tuns', 'Vopsit', …]`);
- `seed` — programările din care pleacă demo-ul. `day` e **decalajul în zile
  față de azi**, nu o dată fixă: `0` = azi, `1` = mâine. Indicele `service`
  trimite în lista de mai sus;
- `currency` — se lipește după fiecare sumă (`lei` / `RON`).

Dacă schimbi `seed`, actualizează și cifrele din `tests/suites/demo.mjs`
(`TODAY_LIVE`, `TODAY_TAKINGS`) — suita verifică exact sumele, tocmai ca o
greșeală de calcul să nu treacă neobservată.

### Două lucruri care nu se văd

**Tabla se mută odată cu ziua.** Cine se joacă cu demo-ul azi și revine peste o
săptămână ar găsi altfel o zi goală și ar crede că s-a stricat. Starea salvată
ține minte ziua la care a fost ancorată, iar la încărcare toate programările
sunt împinse înainte cu diferența. Programările tale rămân unde le-ai lăsat,
raportat la „azi".

**Un rând anulat nu se stinge cu `opacity`.** Prima variantă îl estompa la 0,55
— arăta bine și pica accesibilitatea: pe tema luminoasă numele clientului
ajungea la 3,9:1, adică exact rândul pe care ai nevoie să-l citești devenea cel
mai greu de citit. Acum e tăiat cu linie și coborât cu o treaptă de culoare,
fără transparență.

Magazinul stă în blocul `storeDemo`, cu `products` (nume, descriere și variante
cu preț și stoc). Pragul de livrare gratuită, costul livrării și taxa de ramburs
sunt constante în capul scriptului din `StoreDemo.astro`. Dacă le schimbi,
actualizează și cifrele din `tests/suites/store.mjs` — suita verifică fiecare
total, fiindcă un magazin demo care adună greșit e mai rău decât niciun magazin.

Ambele blocuri respectă aceeași interfață `DemoShell` din `types.ts`, deci un
demo nou nu poate fi livrat fără explicație, disclaimer și variantă fără
JavaScript.

Iconurile din butoanele generate de script vin din `src/data/icons.ts`, aceeași
sursă pe care o folosește `Icon.astro` — altfel demo-ul ar fi rămas cu un desen
vechi la prima redesenare a setului.

## Date structurate (JSON-LD)

Fiecare pagină emite entitatea de afacere (`ProfessionalService`). Trei lucruri de
știut dacă o atingi:

**Un singur `@id`, o singură adresă.** Înainte, entitatea era emisă cu
`url: canonical.href` și fără `@id` — adică douăzeci și ceva de afaceri distincte
care se nimereau să aibă același nume, câte una pe pagină. Acum `@id` e
`…/#business` peste tot, iar `url` e rădăcina site-ului. Nu referențiez entitatea
doar prin `@id` de pe subpagini: Google nu dereferențiază `@id` între documente,
deci s-ar pierde pe 24 de pagini fără să pice niciun test.

**Prețurile vin din `configurator.ts`, nu din text.** `OfferCatalog` cu patru
`Offer`, fiecare cu `minPrice` — nu `price`. Tot ce afișează site-ul e „de la X",
iar un `price` fix ar afirma o sumă care nu se oferă. Catalogul se emite **doar pe
prima pagină**, acolo unde prețurile chiar se văd; repetat pe fiecare articol de
blog ar fi zgomot pe 24 de pagini.

**Breadcrumb doar unde există un „deasupra".** Se dă prin prop-ul `breadcrumb` din
`Base.astro`, fără capătul de sus (Acasă se adaugă singur) și fără verigi
inventate: nu există pagină index `/servicii/`, deci un serviciu are două trepte,
nu trei. Prima pagină n-are breadcrumb spre ea însăși.

Nu validez cu Rich Results Test: `OfferCatalog` nu are tip de rezultat îmbogățit,
deci testul ar raporta „nimic găsit" la nesfârșit. Structura se verifică în suita
`completeness`, care compară prețurile din schemă cu cele din carduri.

## Imaginile de partajare (Open Graph)

Fiecare pagină are **propria imagine**, cu titlul ei. Se desenează în timpul
build-ului, în `dist/og/`, de `scripts/generate-og-images.mjs`. Nu ai nimic de
rulat manual și nu se poate învechi.

Mecanismul e simplu: `Base.astro` declară unde stă imaginea paginii, scriptul
citește adresa aia înapoi din HTML-ul construit și scrie fișierul exact acolo.
Calea e definită într-un singur loc, deci cele două nu pot ajunge să nu mai
corespundă. Marca și adresa de e-mail sunt citite din datele structurate ale
paginii, deci vin tot din `src/data/site.ts`.

Textul e desenat de `satori`, care are nevoie de TTF, nu de WOFF2. De aia
`npm run fonts` produce și trei fișiere în `scripts/og-fonts/` — subsetate la
aceleași caractere, 105 kB în total, folosite doar la build și niciodată trimise
în browser.

Dacă scriptul crapă, build-ul crapă. E intenționat: mai bine rămâne online
versiunea precedentă decât să publicăm pagini a căror imagine de partajare dă 404.

## Iconuri, manifest și pagina 404

**Iconurile** se generează din `public/favicon.svg` cu `npm run icons` și se
commit-uiesc, la fel ca fonturile — build-ul rămâne determinist. Rezultă
`apple-touch-icon.png`, `icon-192`, `icon-512`, `icon-maskable-512`,
`favicon-32` și `site.webmanifest`, deci site-ul se poate instala pe telefon.

Iconul maskable e fișier separat din motiv practic: Android decupează iconul
după forma lansatorului și garantează doar 80% din mijloc. Iconul normal ar
rămâne fără colțuri; ăsta e desenat mai mic, pe fundal plin, ca să aibă ce
decupa. Dacă schimbi `favicon.svg`, rulezi `npm run icons` din nou.

**Pagina 404** e `src/pages/404.astro`. Cloudflare o servește pentru orice
adresă greșită, în orice limbă, deci le conține pe amândouă: română principal,
engleză pe un rând. E marcată `noindex` și **nu** emite `canonical` sau
`hreflang` — un 404 răspunde la orice adresă greșită, deci ar afirma lucruri
despre URL-uri care nu există.

## De ce hero-ul nu are `data-reveal`

Restul site-ului își face conținutul vizibil la scroll: `.js [data-reveal]` îl pornește
la `opacity: 0`, iar un observator îl descoperă și îi pune `.is-visible`. Hero-ul **nu**
participă, intenționat.

Motivul e ordinea: clasa `js` se pune pre-paint, dintr-un script blocant din `<head>`, dar
observatorul e un modul deferat, **ultimul nod din body**. Aplicat pe hero, asta însemna că
cel mai mare text din pagină era desenat invizibil și aștepta tot documentul, apoi se
estompa 0,6 s. Conținutul de deasupra pliului n-are ce să dezvăluie la scroll — se vede
deja.

Măsurat: LCP-ul a coborât până la FCP, scorul a rămas 97 (FCP-ul era bariera). Am păstrat
schimbarea fiindcă e corectă independent de scor — textul cel mai important de pe site nu
mai depinde de rularea unui script ca să existe pe ecran.

Suita `transitions` verifică **absența atributelor**, nu doar că textul ajunge vizibil:
altfel verificarea de mai jos ar trece degeaba în clipa în care cineva le pune la loc.

## Tranziții între pagini

Navigarea dintre pagini face un fade scurt în loc de un reload alb. E făcut de
browser, nativ, din trei reguli CSS în `src/styles/global.css` — **zero
JavaScript**:

```css
@view-transition { navigation: auto; }
```

Deliberat **nu** folosim `<ClientRouter />` din Astro: ar aduce un router în
pagină ca să cumpere exact același efect pe care browserul îl face gratis.

- **Header-ul are nume propriu** (`view-transition-name: site-header`), deci nu
  intră în fade — rămâne pe loc cât se schimbă conținutul.
- **Sub `prefers-reduced-motion` nu se întâmplă nimic** — toată regula stă într-un
  `@media (prefers-reduced-motion: no-preference)`.
- **Browserele fără suport** (Firefox, deocamdată) navighează normal. Nu e nimic
  de reparat pentru ele.

Un lucru care putea trece neobservat: Tailwind v4 minifică prin Lightning CSS,
care ar fi putut arunca un at-rule pe care nu-l cunoaște. Îl păstrează (testat pe
1.32), iar suita `transitions` verifică la fiecare rulare că regula chiar ajunge
în CSS-ul livrat — altfel efectul ar dispărea tăcut la un upgrade.

## Mișcarea din hero

Cele două halouri de gradient din hero se deplasează ușor în direcții opuse după
cursor, iar un al treilea, difuz, îl urmărește direct. Efectul e construit ca să
nu coste nimic:

- **rulează doar pe pointer fin** — pe telefon nu există cursor, iar ascultătorii
  ar consuma baterie degeaba;
- **nu pornește deloc** dacă sistemul cere `prefers-reduced-motion: reduce`, iar
  dacă setarea e activată cât timp pagina e deschisă, efectul se oprește și se
  resetează;
- **scrie exclusiv `transform`**, deci fiecare cadru rămâne pe compositor: zero
  layout, zero repaint;
- **bucla se oprește** când cursorul iese din hero și mișcarea s-a așezat — o
  filă lăsată deschisă nu consumă nimic.

Intensitatea în tema light e redusă la 40%, altfel ar arăta ca o pată pe alb.

## Cache și security.txt

`scripts/build-headers.mjs` scrie și regulile de cache, nu doar CSP-ul:

| Cale | Regulă | De ce |
|---|---|---|
| `/_astro/*` | 1 an, `immutable` | numele conțin hash de conținut |
| `/og/*` | 1 oră | se regenerează la fiecare build, dar cu **aceleași nume** |
| iconuri, `site.webmanifest` | 1 zi | se schimbă rar, nu au hash |
| `/version.txt` | `no-store` | există fix ca să verifici ce e live; o copie din cache ar răspunde greșit exact la întrebarea pentru care a fost făcut |

**O capcană pe care a prins-o testul, nu ochiul:** regulile de iconuri erau scrise
ca `/*.png`, care în `_headers` se potrivește și cu `/og/home.png` — iar la reguli
suprapuse **câștigă ultima**. Imaginile de partajare moșteneau tăcut cache-ul de o
zi. Acum regulile se generează din fișierele care chiar există în `dist/`, una pe
fișier, deci nu se mai pot suprapune.

`Strict-Transport-Security` e pus fără `preload` intenționat: `preload` înseamnă
înscrierea domeniului într-o listă compilată în browsere, iar domeniul final încă
nu e ales.

`public/.well-known/security.txt` — contact pentru raportarea problemelor de
securitate. **Are dată de expirare** (cerută de RFC 9116) și testul verifică să nu
fie în trecut; un fișier expirat e mai rău decât niciunul. Reîmprospăteaz-o o dată
pe an.

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
