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
| Conținut placeholder | **Sloturi goale la portofoliu, nimic la testimoniale** | Nu publicăm proiecte sau recenzii inventate. Dar casetele goale de testimoniale anunțau lipsa de clienți, deci acolo secțiunea nu se randează deloc |

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

- Lighthouse desktop **100 / 100 / 100 / 100**, mobil **97–100 / 100 / 100 / 100**
  (măsurat cu compresie brotli, ca în producție)
- axe-core: **0 încălcări** WCAG 2.1 AA, pe ambele limbi și în ambele teme
- **1151 de verificări** rulate cu `npm test`, din repo: accesibilitate (26 de pagini
  dark + 9 light), CSP cu header-ele reale aplicate, interacțiuni (15), canale de
  contact (39), banda de măsurători (24), configurator (17), temă (14), hero (12),
  programare (18), tranziții (17), completitudine (116), garanții (16), politica de
  confidențialitate (38), imagini de partajare (14), bugete de greutate (17), studiu de
  caz (19), demo-ul de programări (91), demo-ul de magazin (92), coerența ofertelor (77),
  audit (4 fără cheie / 30 cu ea), analytics (16 fără token / 29 cu el), demo-urile cu
  site întreg (102), glow-ul de cursor + parallax (19)

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
8. **Pune cheia Google PageSpeed** (`PUBLIC_PAGESPEED_KEY`) ca să pornești
   auditul instant din banda de audit. Instrucțiuni în README. Fără ea banda
   rămâne butonul de dinainte, deci nu se strică nimic dacă amâni.
9. **Cumpără domeniul**, leagă-l în Cloudflare și setează `SITE_URL`.

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
2. ~~Analytics la lansare — Plausible sau Umami?~~ — ✅ niciunul: **Cloudflare Web
   Analytics**, fiindcă site-ul e deja găzduit acolo, e gratuit și nu pune cookie-uri.
   Codul e pus și testat; se aprinde din `PUBLIC_CF_BEACON_TOKEN`.
3. Afișăm prețuri concrete sau trecem pe „cere ofertă"?
4. ~~Adăugăm o secțiune FAQ?~~ — ✅ da, șase întrebări deasupra formularului Ajută la SEO și reduce întrebările repetitive.
5. Pragurile din suita `weight` — sunt măsurătoarea de azi + ~10-15%. Se ridică
   deliberat când crește ceva intenționat, nu se șterg.

## 8. Backlog de îmbunătățiri propuse

### A. Esențiale înainte de lansarea oficială (propuse 2026-08-11)

1. Portofoliu cu proiecte reale + suport de capturi (primul studiu de caz: acest site)
2. 🟡 Secțiune „Despre mine" — ✅ publicată sub garanții, RO+EN, numai reformulări
   ale afirmațiilor deja existente (testul cade dacă apare o cifră nouă).
   *Mai lipsește fotografia: `portrait.jpg` în `src/assets/about/` și apare singură.*
3. Activarea livrării reale a formularului (cheie Web3Forms)
4. ✅ WhatsApp și telefon ca și canale de contact — în cardul de contact și în
   footer (deci pe toate paginile). WhatsApp cu mesaj pre-scris, RO/EN;
   telefonul și ca `telephone` în datele structurate
5. ✅ Secțiune FAQ pe prima pagină — șase întrebări, plus schema `FAQPage` emisă separat
6. 🟡 Domeniu propriu — ✅ codul e pregătit: adresa vine dintr-un singur loc
   (`SITE_URL`), iar un test cade dacă apare vreun hostname scris de mână în
   `src/` sau `tests/`. Mutarea e o variabilă de mediu plus o rută în
   `wrangler.jsonc` (pașii, în ordine, în README → „Mutarea pe domeniu propriu").
   *Mai lipsește: domeniul cumpărat, e-mailul pe domeniu, 301 de pe workers.dev.*
7. ~~Pagină de politică de confidențialitate (GDPR)~~ — ✅ făcut, la `/confidentialitate/`
   și `/en/privacy/`, plus repararea afirmației false de sub formular
8. ✅ Pagină 404 + set complet de iconuri (apple-touch-icon, maskable, manifest)
9. 🟡 Cloudflare Web Analytics — ✅ cablat și testat în ambele stări; doarme până
   pui `PUBLIC_CF_BEACON_TOKEN` (fără token nu se emite niciun script).
   *Mai lipsește: tokenul din contul tău Cloudflare.*
10. Micro-optimizări de conversie (bandă CTA finală, „răspund în 24h" la buton, CTA sticky pe mobil)

### B. Implementări noi (propuse 2026-08-11)

1. ✅ Configurator de ofertă interactiv — wizard în 3 pași cu estimare de preț, pre-completează formularul; servește și ca demo de webapp
2. ✅ Programare directă a discuției inițiale — modal cu iframe la cerere, fără scriptul lor de embed; se activează dintr-o linie în `site.ts`
3. ✅ Landing pages dedicate per serviciu — toate 4, RO+EN (8 pagini, sub 1% suprapunere de conținut între ele)
4. ✅ Studii de caz ca pagini dedicate (content collections; primul: acest site, cu cifre reale)
5. ✅ Secțiune-comparator: „șablon DIY vs site făcut la comandă" — tratează obiecția principală
6. ✅ Audit gratuit de site ca lead magnet (flux dedicat în formular)
7. ✅ Blog bilingv pe content collections, cu RSS — 4 articole scrise, RO+EN fiecare
   (viteză, pregătirea proiectului, landing page vs site de prezentare, cât costă un magazin)
8. ✅ Comutator temă light/dark cu persistență, fără flash la încărcare
9. ✅ Pachet performanță & securitate: fonturi subsetate (170 → 57 kB), CSP cu hash-uri SHA-256, header-e de securitate
10. ✅ Semnătură vizuală interactivă: parallax la cursor în hero + **glow care
    urmărește cursorul pe tot site-ul**, doar pe tema întunecată (blend `screen`
    deasupra conținutului); ambele oprite pentru reduced-motion și pointer grosier

### C. Pachetul „impresionăm" (propus 2026-08-11)

Analiză pornită de la trei constatări: site-ul nu are **nicio imagine**, dovezile
lipsesc exact unde se fac afirmațiile, iar momentele de „wow" sunt neexploatate.

1. 🟡 Imagini reale + pipeline de imagini — pipeline-ul e gata (`sharp` declarat,
   `astro:assets`, AVIF + srcset, `image()` în schemă) și capturile reale ale
   acestui site sunt pe card și pe studiul de caz, în rame de device.
   *Mai lipsesc: fotografia lui Alex și proiectele clienților.*
2. ✅ Bandă care se măsoară singură — LCP, greutate și JS, măsurate în browserul
   vizitatorului, sub afirmația din hero
3. ✅ Auditul gratuit devine instrument real — scoruri Lighthouse pe loc, primele
   trei probleme, CTA cu adresa precompletata. *Inactiv pana Alex pune cheia;
   testat complet cu API-ul simulat.*
4. ✅ Tranziții între pagini, CSS nativ, zero JavaScript
5. ✅ Imagine OG per pagină, generată în build (21 de pagini, câte una fiecare)
6. 🟡 Studiul de caz vizual — capturi reale in rame de device si cadrane
   de scor animate, fara JavaScript. *Sliderul inainte/dupa asteapta un proiect
   care chiar are un „inainte”; acest site nu are, iar unul inventat
   n-ar dovedi nimic.*
7. ✅ Secțiune de garanții în locul casetelor goale — două coloane, ce garantez
   și ce nu; fiecare rând e preluat din text deja publicat pe site, nicio
   promisiune nouă
8. ✅ Demo pentru fiecare ofertă care poate fi arătată — **patru**, de două feluri.
   Două aplicații jucabile (programări la `/demo/`, magazin la `/demo/magazin/`,
   stare în `localStorage`) și două site-uri întregi, pentru firme inventate,
   deschise într-o ramă de browser: landing page la `/demo/landing-page/` și site
   de prezentare pe trei pagini la `/demo/site-de-prezentare/`. Exemplele au
   propria paletă și propria foaie de stil, sunt `noindex` și în afara
   sitemap-ului. Optimizarea de site nu are demo — nu are ce arăta în afară de o
   măsurătoare înainte/după. Date inventate, spus explicit în fiecare pagină.
9. ✅ Pachet de completitudine: 404, set de iconuri, `manifest.json`, schema `FAQPage`
   (56 de întrebări), `hreflang` reparat pe cele 14 URL-uri din sitemap care nu-l
   aveau
10. ✅ Suita de teste publicată în repo, cu `npm test` — 1088 de verificări azi

### D. Pachetul „lead-uri prin aspect și funcționalitate" (livrat 2026-08-12)

Reanaliză pornită de la o singură întrebare: unde se pierd cererile de ofertă.
Constatarea gravă a fost un bug de onestitate activ în producție — fără cheia
Web3Forms fiecare trimitere lua ramura `mailto:`, care afișa necondiționat „am
primit mesajul"; pe un desktop fără client de e-mail nu se întâmpla nimic,
vizitatorul credea că a scris, iar lead-ul murea la ultimul pas. Testul de atunci
era verde pe minciună. A fost primul lucru reparat.

1. ✅ **P1 — Onestitate la formular.** Panou de salvare pe ramura mailto
   (WhatsApp cu mesajul compus, copiere în clipboard, telefon), fără niciun
   „am primit mesajul". Promisiunea de 24 h ecou sub buton, aceeași peste tot.
2. ✅ **P2 — CTA persistent pe mobil.** Dock lipit jos sub `sm`, se retrage când
   formularul sau footerul intră în ecran, cu spațiu la finalul paginii ca să nu
   acopere ultimele linkuri.
3. ✅ **P3 — Contextul curge spre formular.** CTA-urile din subpagini poartă
   `?from=`, formularul preselectează tipul și arată de unde vii, iar câmpul
   ascuns `origin` intră în ambele căi de trimitere. Ecranele de confirmare din
   demo-uri cer contactul în momentul de vârf.
4. ✅ **P4 — Pagină de mulțumire** (`/multumesc/`, `/en/thank-you/`), `noindex`,
   cu a doua conversie: programează discuția acum. Redirect doar pe succes real.
5. ✅ **P5 — Formular conversațional.** Trei pași peste aceleași câmpuri, progres,
   validare pe pas; fără JavaScript rămâne formularul clasic, neatins.
6. ✅ **P6 — Configurator partajabil.** Estimarea pleacă pe WhatsApp și se copiază
   ca link cu starea în hash, care reface selecția la deschidere.
7. ✅ **P7 — „Fă-l al tău".** Numele firmei și culoarea vizitatorului intră în
   site-urile-exemplu prin `postMessage`, verificat pe origine; eticheta de
   ficțiune rămâne vizibilă, bara de adresă falsă nu se schimbă. Ramă și pe prima
   pagină, plus panglică de ieșire pe exemplele deschise întregi.
8. ✅ **P8 — Cifrele pe limba patronului.** Calculator al costului unui site lent
   (interval rotunjit, sursă citată, ce nu poate ști) și rând-verdict în banda de
   măsurare: „de ~N ori mai ușoară decât mediana web".
9. ✅ **P9 — Semnătura vizuală.** Paletă proprie iris→jad, derivată în OKLCH și
   re-derivată separat pentru tema luminoasă; marca ștanțată ca mască pe eticheta
   fiecărei secțiuni; fascicul pe cardul planului ales de cei mai mulți; coloana
   procesului se desenează la scroll, fără JavaScript.
10. ✅ **P10 — Transparența ca diferențiator.** Colofon (`/colofon/`) cu commit-ul,
    numărul de verificări **în suită** — niciodată „trecute", fiindcă build-ul
    rulează înaintea testelor — bugetele și ce NU poate ști pagina; listă de
    lansare imprimabilă unde fiecare rând citează suita care îl ține; linie de
    proveniență în footer. Auditul primește comutator telefon/desktop și
    „măsoară și site-ul ăsta", adormite până la cheie.

**Ucise de verificarea adversă, ca să rămână scrise:** bento flagship (premisă
falsă), hero care se măsoară singur (dublează banda existentă), command palette
(audiență greșită), headline numărător (imposibil pe date reale ca „95+" și „2-4").

## 9. Idei pentru v2

- Pagini dedicate de studiu de caz, cu capturi și detalii tehnice
- Blog / articole scurte (util pentru SEO pe termen lung)
- Pagină 404 personalizată
