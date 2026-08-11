# Site de prezentare — Alex Delcea

Site bilingv (română / engleză) prin care îmi promovez serviciile de creare de
site-uri și aplicații web. Construit cu [Astro](https://astro.build) și
[Tailwind CSS](https://tailwindcss.com), livrat static pe Cloudflare Pages.

Planul complet al proiectului, cu decizii și roadmap, este în [`PLAN.md`](./PLAN.md).

## Scoruri măsurate

Rulat cu Lighthouse pe build-ul de producție:

| | Performanță | Accesibilitate | Bune practici | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobil | 98 | 100 | 100 | 100 |

Zero încălcări axe-core (WCAG 2.1 AA) pe ambele limbi.

## Comenzi

| Comandă | Ce face |
|---|---|
| `npm install` | Instalează dependențele |
| `npm run dev` | Pornește serverul de dezvoltare pe `localhost:4321` |
| `npm run build` | Generează site-ul în `dist/` |
| `npm run preview` | Servește local build-ul de producție |
| `npm run check` | Verifică tipurile (TypeScript + Astro) |
| `npm run fonts` | Redescarcă fonturile brandului (vezi mai jos) |
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

În `src/i18n/ro.ts`, la `portfolio.items`, adaugă un obiect:

```ts
{
  name: 'Numele proiectului',
  category: 'Site de prezentare',
  problem: 'Ce problemă avea clientul.',
  solution: 'Ce am construit.',
  result: 'Rezultatul concret, cu cifre dacă există.',
  tech: ['Astro', 'Tailwind'],
  url: 'https://exemplu.ro',   // opțional
}
```

Cât timp lista e goală, secțiunea afișează sloturi punctate, marcate vizibil ca
neterminate. **Nu completa cu proiecte inventate** — site-ul e cartea ta de vizită.

### Un testimonial

La fel, în `testimonials.items`. Aceeași regulă, mai strictă: pune aici doar
păreri reale, primite de la clienți reali. O recenzie inventată e o minciună
spusă în numele altcuiva.

### Prețurile

`pricing.plans` în ambele fișiere de limbă. Valorile actuale sunt orientative
și trebuie confirmate înainte de lansare.

## Formularul de contact

Fără configurare, formularul deschide clientul de e-mail al vizitatorului cu
mesajul deja completat. Funcționează, dar pierzi mesajele celor care nu au un
client de e-mail configurat.

Ca să primești mesajele direct în inbox:

1. Creează un cont gratuit pe [web3forms.com](https://web3forms.com) și ia cheia de acces.
2. În Cloudflare Pages: **Settings → Environment variables → Production**,
   nume `PUBLIC_WEB3FORMS_KEY`, valoare cheia. Apoi declanșează un redeploy.
3. Pentru dezvoltare locală, pune-o în `.env`:
   ```
   PUBLIC_WEB3FORMS_KEY=cheia-ta
   ```

Formularul comută automat pe trimitere reală când cheia există.

## Publicare — Cloudflare Pages

Site-ul se publică pe [Cloudflare Pages](https://pages.cloudflare.com): build automat
la fiecare push, CDN global, HTTPS și trafic nelimitat, gratuit. Nu folosește GitHub
Actions (care nu pornește pe acest cont — vezi nota de la final).

### Conectarea, o singură dată

1. Intră pe [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**
   → **Create** → **Pages** → **Connect to Git**.
2. Autorizează GitHub și alege repository-ul `PresentationWebsite`.
3. Completează setările de build:

   | Câmp | Valoare |
   |---|---|
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Production branch | `claude/portfolio-website-planning-v7mz1y` |

4. **Save and Deploy**. Primul build durează 1–2 minute.

Site-ul apare la `https://<numele-proiectului>.pages.dev`. Numele proiectului îl
alegi tu în pasul 1 — de exemplu `alex-delcea` dă `https://alex-delcea.pages.dev`.

De aici încolo, fiecare push pe branch-ul de producție declanșează un build nou
automat. Fiecare pull request primește și un link de previzualizare separat.

### De ce nu trebuie să configurezi adresa site-ului

Cloudflare injectează `CF_PAGES_URL` la build, iar `astro.config.ts` o folosește
pentru adresa canonică, `hreflang` și sitemap. Deci linkurile sunt corecte din prima,
fără să scrii nicăieri domeniul.

### Variabile de mediu

În Cloudflare: **Settings → Environment variables → Production**.

| Variabilă | Când o setezi |
|---|---|
| `PUBLIC_WEB3FORMS_KEY` | Ca formularul să trimită în inbox (vezi secțiunea de mai sus) |
| `SITE_URL` | Doar după ce legi un domeniu propriu |

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

## Fonturi

Space Grotesk și Inter sunt descărcate ca fonturi variabile și **commit-uite în
repo**, în `src/assets/fonts/`. Astfel build-ul nu depinde de rețea și dă
același rezultat oriunde. Fiecare familie are două fișiere separate pe
`unicode-range`: `latin` și `latin-ext` — al doilea conține diacriticele
românești (ă, ș, ț) și se descarcă doar pe paginile care le folosesc.

Rulează `npm run fonts` doar dacă schimbi tipografia sau intervalul de greutăți.
