# Plan: Site de prezentare — servicii web development

> Documentul de planificare al proiectului. Se actualizează pe măsură ce luăm decizii noi.
> Instrucțiunile practice de operare (cum schimb un preț, cum activez formularul) sunt în [`README.md`](./README.md).

## 1. Obiectiv

Site de prezentare personal care promovează serviciile de **creare de website-uri și
webapp-uri**, cu scopul de a genera cereri de ofertă (lead-uri) de la clienți.

Site-ul în sine este o carte de vizită: trebuie să demonstreze prin propria execuție
(design, viteză, SEO) calitatea serviciilor oferite.

**Public țintă:**
- Firme mici și mijlocii din România care au nevoie de prezență online (RO)
- Clienți internaționali / colaborări remote (EN)

## 2. Decizii luate

| Decizie | Alegere | Motivație |
|---|---|---|
| Framework | **Astro 7 + Tailwind CSS 4** | Site static ultra-rapid (zero JS de framework), SEO excelent; se pot adăuga ulterior insule interactive |
| Limbi | **RO (implicit) + EN** | RO la rădăcină (`/`), EN sub `/en/`, comutator în header, `hreflang` pentru SEO |
| Design | **Dark & premium** | Fundal închis, accente gradient indigo→cyan, tipografie mare |
| Tip layout | **Single-page landing** (per limbă) | Conversie bună pentru servicii; studiile de caz pot deveni pagini separate în v2 |
| Hosting | **Cloudflare (Workers)** | Build automat la fiecare push, CDN global, HTTPS, gratuit. Ales după ce GitHub Actions s-a dovedit blocat la nivel de cont |
| Formular contact | **Web3Forms**, cu fallback pe `mailto:` | Gratuit și nelimitat, fără backend; fallback-ul face formularul funcțional chiar și neconfigurat |
| Fonturi | **Self-hosted, commit-uite în repo** | Build determinist, fără dependență de rețea; `latin-ext` separat pentru diacritice |
| Conținut placeholder | **Sloturi vizibil goale** | Nu publicăm proiecte sau testimoniale inventate — ar fi afirmații false pe un site de business |

## 3. Arhitectura site-ului

O singură pagină lungă per limbă, cu navigare prin ancore. Id-urile de secțiune
sunt identice în ambele limbi, ca schimbarea limbii să păstreze poziția cititorului.

```
/            → versiunea RO
/en/         → versiunea EN
```

Ordinea secțiunilor: Header → Hero → Servicii → Proces → Portofoliu →
Testimoniale → Prețuri → Contact → Footer.

Structura de fișiere și regulile de editare a conținutului sunt documentate în README.

## 4. Design system

- **Fundal:** aproape negru cu tentă albastră (`#0B0F1A`), glow-uri de gradient difuze
- **Accent:** gradient indigo (`#6366F1`) → cyan (`#22D3EE`)
- **Fonturi:** Space Grotesk (titluri) + Inter (text), variabile, self-hosted
- **Componente:** carduri cu borduri subtile, butoane cu glow la hover
- **Animații:** reveal la scroll printr-un singur `IntersectionObserver`; conținutul
  rămâne vizibil fără JavaScript
- **Accesibilitate:** contrast AA, focus vizibil, `prefers-reduced-motion` respectat

## 5. Stare curentă

| Fază | Livrabil | Stare |
|---|---|---|
| **M1 — Fundație** | Astro + Tailwind + i18n RO/EN + pipeline de deploy | ✅ gata |
| **M2 — Identitate** | Design tokens, Header, Hero, Footer, comutator limbă | ✅ gata |
| **M3 — Conținut** | Servicii, Proces, Portofoliu, Testimoniale, Prețuri | ✅ structură gata, conținut real de completat |
| **M4 — Conversie & finisaj** | Formular, SEO, animații, audit | ✅ gata |
| **M5 — Lansare** | Conținut real, domeniu, analytics | 🟡 site-ul e live; conținutul real și domeniul lipsesc |

### Verificat

- Lighthouse desktop **100 / 100 / 100 / 100**, mobil **98 / 100 / 100 / 100**
- axe-core: **0 încălcări** WCAG 2.1 AA, pe ambele limbi
- 15 teste de interacțiune trec: meniu mobil, comutator de limbă cu păstrarea ancorei,
  ambele căi ale formularului (Web3Forms și `mailto:`), validarea câmpurilor obligatorii

## 6. Ce mai e de făcut înainte de lansare

Pași care necesită decizii sau conținut de la Alex:

1. ~~Conectează repo-ul la Cloudflare~~ — ✅ făcut. Site-ul e live la
   https://presentationwebsite.alexdelcea1996.workers.dev
2. **Confirmă datele de contact** din `src/data/site.ts`. Acum e folosit
   `alexdelcea1996@gmail.com`; dacă vrei o adresă dedicată de business, schimb-o.
3. **Confirmă numele brandului** — momentan „Alex Delcea".
4. **Confirmă prețurile** din `pricing.plans`. Valorile actuale (400 € / 900 € /
   2.500 €) sunt exemple, nu o ofertă reală.
5. **Adaugă 2–3 proiecte** în portofoliu, cu problemă, soluție și rezultat.
6. **Adaugă testimoniale** pe măsură ce le primești de la clienți.
7. **Activează formularul** cu o cheie Web3Forms (vezi README).
8. **Cumpără domeniul**, leagă-l în Cloudflare și setează `SITE_URL`.

### Traseul până la Cloudflare

Publicarea a fost planificată inițial pe GitHub Pages. Repo-ul era privat, iar
GitHub Actions nu pornea deloc. După trecerea la public workflow-urile s-au
compilat corect, dar job-urile mureau în ~2 secunde fără să primească un runner,
identic și la reîncercare. Cum pe repo-uri publice runnerele sunt gratuite,
cauza e la nivel de cont (Actions dezactivat sau restricție de billing), nu în
configurație. Am mutat publicarea pe Cloudflare (Workers), care face build-ul pe
infrastructura proprie și nu depinde de Actions. Workflow-urile au fost șterse.

## 7. Decizii rămase deschise

1. Domeniul propriu — nume și extensie (.ro / .dev / .com)
2. Analytics la lansare — dacă da, Plausible sau Umami (ambele fără cookie-uri,
   deci fără banner de consimțământ)
3. Afișăm prețuri concrete sau trecem pe „cere ofertă"?
4. Adăugăm o secțiune FAQ? Ajută la SEO și reduce întrebările repetitive.

## 8. Idei pentru v2

- Pagini dedicate de studiu de caz, cu capturi și detalii tehnice
- Blog / articole scurte (util pentru SEO pe termen lung)
- Subsetarea fonturilor la caracterele folosite efectiv (ar tăia ~100 kB din cele
  170 kB de fonturi; nu e urgent, scorul e deja 98–100)
- Pagină 404 personalizată
