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
| Design | **Dark & premium**, cu temă light opțională | Dark e implicit; tema light urmează setarea sistemului și poate fi comutată manual. Tokenii sunt numiți după rol, nu după luminozitate |
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
- **Animații:** reveal la scroll printr-un singur `IntersectionObserver`; parallax
  la cursor în hero, doar `transform`, cu bucla oprită când pagina e inactivă;
  conținutul rămâne vizibil fără JavaScript
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
- axe-core: **0 încălcări** WCAG 2.1 AA, pe ambele limbi și în ambele teme
- **192 de verificări** rulate cu `npm test`, din repo: accesibilitate (16 pagini
  dark + 5 light), CSP cu header-ele reale aplicate, interacțiuni (15), canale de
  contact (39), banda de măsurători (24), configurator (19), temă (14), hero (12),
  programare (18), tranziții (15)

## 6. Ce mai e de făcut înainte de lansare

Pași care necesită decizii sau conținut de la Alex:

1. ~~Conectează repo-ul la Cloudflare~~ — ✅ făcut. Site-ul e live la
   https://presentationwebsite.alexdelcea1996.workers.dev
2. **Confirmă datele de contact** din `src/data/site.ts`. Acum sunt folosite
   `alexdelcea1996@gmail.com` și `+40 767 079 882` (telefon și WhatsApp, același
   număr); dacă vrei o adresă sau un număr dedicate afacerii, se schimbă de acolo.
3. **Confirmă numele brandului** — momentan „Alex Delcea".
4. **Confirmă prețurile** din `pricing.plans`. Valorile actuale (400 € / 900 € /
   2.500 €) sunt exemple, nu o ofertă reală.
5. **Adaugă 2–3 proiecte** în portofoliu, cu problemă, soluție și rezultat.
6. **Adaugă testimoniale** pe măsură ce le primești de la clienți.
7. **Activează formularul** cu o cheie Web3Forms (vezi README).
   Programarea Cal.com e activă și verificată în producție:
   `cal.com/delcea-alexandru-arqdvl/30min` — calendarul se afișează corect în
   modal.
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

## 8. Backlog de îmbunătățiri propuse

### A. Esențiale înainte de lansarea oficială (propuse 2026-08-11)

1. Portofoliu cu proiecte reale + suport de capturi (primul studiu de caz: acest site)
2. Secțiune „Despre mine" cu fotografie
3. Activarea livrării reale a formularului (cheie Web3Forms)
4. ✅ WhatsApp și telefon ca și canale de contact — în cardul de contact și în
   footer (deci pe toate paginile). WhatsApp cu mesaj pre-scris, RO/EN;
   telefonul și ca `telephone` în datele structurate
5. Secțiune FAQ (conversie + long-tail SEO; fără promisiuni de rich snippets)
6. Domeniu propriu + e-mail pe domeniu + 301 de pe workers.dev
7. Pagină de politică de confidențialitate (GDPR)
8. Pagină 404 + set complet de iconuri (apple-touch-icon, manifest)
9. Cloudflare Web Analytics (gratuit, fără cookie-uri)
10. Micro-optimizări de conversie (bandă CTA finală, „răspund în 24h" la buton, CTA sticky pe mobil)

### B. Implementări noi (propuse 2026-08-11)

1. ✅ Configurator de ofertă interactiv — wizard în 3 pași cu estimare de preț, pre-completează formularul; servește și ca demo de webapp
2. ✅ Programare directă a discuției inițiale — modal cu iframe la cerere, fără scriptul lor de embed; se activează dintr-o linie în `site.ts`
3. ✅ Landing pages dedicate per serviciu — toate 4, RO+EN (8 pagini, sub 1% suprapunere de conținut între ele)
4. ✅ Studii de caz ca pagini dedicate (content collections; primul: acest site, cu cifre reale)
5. ✅ Secțiune-comparator: „șablon DIY vs site făcut la comandă" — tratează obiecția principală
6. ✅ Audit gratuit de site ca lead magnet (flux dedicat în formular)
7. ✅ Blog bilingv pe content collections, cu RSS — primele 2 articole scrise
8. ✅ Comutator temă light/dark cu persistență, fără flash la încărcare
9. ✅ Pachet performanță & securitate: fonturi subsetate (170 → 57 kB), CSP cu hash-uri SHA-256, header-e de securitate
10. ✅ Semnătură vizuală interactivă în hero (parallax la cursor + spotlight; oprit pentru reduced-motion și pointer grosier)

### C. Pachetul „impresionăm" (propus 2026-08-11)

Analiză pornită de la trei constatări: site-ul nu are **nicio imagine**, dovezile
lipsesc exact unde se fac afirmațiile, iar momentele de „wow" sunt neexploatate.

1. Imagini reale + pipeline de imagini (`sharp`, `astro:assets`, secțiune „Despre
   mine", proiecte reale în portofoliu) — *așteaptă materiale de la Alex*
2. ✅ Bandă care se măsoară singură — LCP, greutate și JS, măsurate în browserul
   vizitatorului, sub afirmația din hero
3. Auditul gratuit devine instrument real (Google PageSpeed API din browser)
4. ✅ Tranziții între pagini, CSS nativ, zero JavaScript
5. Imagine OG per pagină, generată în build
6. Studiul de caz cu slider înainte/după și gauge-uri animate
7. Secțiune „Garanții" în locul casetelor goale de testimoniale
8. Demo funcțional de aplicație web
9. Pachet de completitudine: 404, set de iconuri, `manifest.json`, schema `FAQPage`
10. ✅ Suita de teste publicată în repo, cu `npm test` — 192 de verificări

## 9. Idei pentru v2

- Pagini dedicate de studiu de caz, cu capturi și detalii tehnice
- Blog / articole scurte (util pentru SEO pe termen lung)
- Pagină 404 personalizată
