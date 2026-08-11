# Site de prezentare — Alex Delcea

Site bilingv (română / engleză) prin care îmi promovez serviciile de creare de
site-uri și aplicații web. Construit cu [Astro](https://astro.build) și
[Tailwind CSS](https://tailwindcss.com), livrat static pe GitHub Pages.

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
2. În GitHub: **Settings → Secrets and variables → Actions → New repository secret**,
   nume `PUBLIC_WEB3FORMS_KEY`, valoare cheia.
3. Pentru dezvoltare locală, pune-o în `.env`:
   ```
   PUBLIC_WEB3FORMS_KEY=cheia-ta
   ```

Formularul comută automat pe trimitere reală când cheia există.

## Publicare

Deploy-ul rulează automat prin GitHub Actions la fiecare push
(`.github/workflows/deploy.yml`): verifică tipurile, face build și publică.

**Pas necesar o singură dată:** în GitHub, la **Settings → Pages**, setează
*Source* pe **GitHub Actions**. Fără asta, workflow-ul rulează dar publicarea eșuează.

Site-ul apare la `https://alexdelcea1996-alt.github.io/PresentationWebsite/`.

### De rezolvat înainte ca deploy-ul să funcționeze

La momentul scrierii, repository-ul este **privat** și GitHub Actions nu pornește:
fiecare push produce un run care eșuează instant, cu `startup_failure`, fără niciun
job executat. Ambele fișiere de workflow sunt valide și prezente în repo, iar
build-ul trece local — deci cauza este la nivel de cont sau de repository, nu în cod.

Cele două explicații probabile, ambele legate de faptul că repo-ul e privat:

1. **Minute Actions epuizate sau lipsă metodă de plată.** Repo-urile private consumă
   din cota lunară de minute; când cota e depășită, run-urile eșuează exact așa.
   Se verifică la **Settings → Billing** pe contul GitHub.
2. **GitHub Pages nu e disponibil pe repo-uri private** în planul gratuit — e nevoie
   de GitHub Pro.

**Recomandarea mea: fă repository-ul public** (Settings → General → Danger Zone →
Change visibility). Pentru un site de prezentare e firesc — codul devine el însuși
o piesă de portofoliu — și rezolvă ambele probleme deodată: minute Actions
nelimitate și Pages gratuit. Nu am făcut eu schimbarea pentru că trecerea unui
repository din privat în public e ireversibilă în efecte și e decizia ta.

Alternativ, dacă vrei să rămână privat: activează GitHub Pro, sau publică pe
Cloudflare Pages / Netlify, care oferă hosting gratuit și pentru repo-uri private.

### Domeniu propriu

1. Cumpără domeniul și adaugă-l la **Settings → Pages → Custom domain**.
2. În `.github/workflows/deploy.yml`, schimbă:
   ```yaml
   SITE_URL: https://domeniul-tau.ro
   BASE_PATH: /
   ```
3. Actualizează adresa sitemap-ului din `public/robots.txt`.

## Fonturi

Space Grotesk și Inter sunt descărcate ca fonturi variabile și **commit-uite în
repo**, în `src/assets/fonts/`. Astfel build-ul nu depinde de rețea și dă
același rezultat oriunde. Fiecare familie are două fișiere separate pe
`unicode-range`: `latin` și `latin-ext` — al doilea conține diacriticele
românești (ă, ș, ț) și se descarcă doar pe paginile care le folosesc.

Rulează `npm run fonts` doar dacă schimbi tipografia sau intervalul de greutăți.
