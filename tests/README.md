# Teste

1151 de verificări care rulează peste site-ul construit, majoritatea cu un browser real.

```bash
npm run build   # testele verifică ce e în dist/, nu codul sursă
npm test        # toate suitele
npm test hero   # doar una
```

## De ce așa

**Se testează build-ul, nu sursa.** Multe dintre lucrurile care se pot strica —
hash-urile CSP, `_headers`, alternativele `hreflang`, imaginile OG — există doar
după build. Un test peste codul sursă le-ar rata pe toate.

**Serverul de test comprimă ca Cloudflare.** Fără brotli, o măsurătoare
Lighthouse locală trimite 115 kB de HTML pe o legătură mobilă simulată, când
producția trimite 18,6 kB — adică măsoară un site care nu există, și îl arată mai
prost decât e.

**Serverul de test aplică `dist/_headers`.** Site-ul rulează cu un CSP fără
`unsafe-inline`: fiecare script inline are un hash SHA-256, regenerat la fiecare
build. Servit static, fără header-e, un script pe care producția îl refuză ar merge
perfect în teste — iar primul semn ar fi o secțiune goală pe site-ul live.

**Animațiile se termină înainte de măsurare.** Elementele cu `[data-reveal]`
apar printr-un fade de 0,6 s. axe rulat la mijlocul lui citește o culoare
amestecată — jadul #56deb2 apare stins și rece — și raportează o problemă de
contrast care nu există pe pagina așezată. Mai rău, depinde de sincronizarea
încărcării, deci suita trece până când altceva se mișcă cu câteva milisecunde.
De aia există `settleAnimations()` în harness, apelat înaintea fiecărei rulări axe.

**axe-core intră prin `addInitScript`, niciodată prin `addScriptTag`.** Un tag
`<script>` e refuzat chiar de CSP-ul site-ului, iar o injectare eșuată arată exact
ca o pagină fără probleme de accesibilitate. Greșeala asta a fost făcută o dată
aici și a raportat „0 încălcări" pe pagini care nici măcar nu fuseseră analizate.

**`playwright-core`, nu `playwright`.** Pachetul complet descarcă ~150 MB de
browsere la `npm install` — inclusiv pe build-ul Cloudflare, unde n-au ce căuta.
`playwright-core` are 14 MB și niciun script de instalare; browserul se caută pe
mașină (vezi mai jos).

**Un proces per suită.** O suită care crapă nu le omoară pe celelalte, iar
runner-ul face diferența între „a picat o verificare" și „a murit înainte să
scrie ceva" — al doilea caz e cel periculos, fiindcă seamănă cu o trecere curată.

## Browserul

Se caută în ordinea: `CHROMIUM_PATH` → `PLAYWRIGHT_BROWSERS_PATH` → locurile
obișnuite din sistem (`/usr/bin/chromium`, Google Chrome pe macOS etc.).

Dacă nu găsește niciunul, îți spune. Ca să forțezi unul anume:

```bash
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test
```

## Suitele

| Suită | Ce verifică | Verificări |
|---|---|---|
| `a11y` | axe-core (WCAG 2.1 AA) pe 30 de pagini, temă întunecată, plus greutatea paginii și inelul de focus de pe cardurile configuratorului — pe care axe nu-l poate vedea, fiindcă input-ul e decupat de `sr-only` împreună cu inelul lui | 58 |
| `a11y-light` | aceleași reguli pe 11 pagini în tema luminoasă | 28 |
| `csp` | zero violări CSP pe 6 pagini, cu header-ele reale aplicate | 11 |
| `interact` | meniu mobil, comutator de limbă, ancore, formularul în pași, ambele căi de trimitere, și starea de scroll fără să citească poziția de scroll (niciun listener de `scroll` pe pagină, santinelele la locul lor) | 53 |
| `channels` | e-mail, telefon și WhatsApp în card, footer și date structurate | 39 |
| `metrics` | banda care măsoară pagina: cifrele afișate = ce raportează browserul, plus rândul-verdict și sursa lui | 29 |
| `configurator` | wizardul de ofertă, calculul prețului, precompletarea formularului, estimarea partajabilă | 25 |
| `theme` | light/dark, persistență, fără flash la încărcare | 14 |
| `hero` | glow-ul care urmărește cursorul (pe patru pagini, ambele teme) și parallaxul din hero; ambele oprite sub `prefers-reduced-motion` și pe pointer grosier | 20 |
| `booking` | modalul Cal.com, încărcare la cerere, temă, Escape, click cu modificatori | 18 |
| `transitions` | tranzițiile între pagini: că regula ajunge în CSS, că rulează, că nu rulează sub reduced-motion; plus că hero-ul nu pornește ascuns | 17 |
| `completeness` | pagina 404, setul de iconuri, manifestul, schema `FAQPage`, `hreflang` în sitemap, `/version.txt`, HSTS, regulile de cache, `security.txt` (inclusiv expirarea recalculată la fiecare build), niciun hostname scris de mână în `src/` sau `tests/`, entitatea de afacere, `OfferCatalog`, breadcrumbs, FAQ-ul de pe prima pagină, secțiunea „Despre mine" | 147 |
| `guarantees` | secțiunea de garanții, ambele coloane, și că nu au rămas casete goale | 16 |
| `legal` | politica de confidențialitate: există, numește procesatorii pe nume, e legată din formular și footer, și declară ce cere Regulamentul — temeiul legal, transferul în afara SEE, ce se scrie în browser | 52 |
| `share-images` | fiecare dintre cele 41 de pagini are propria imagine OG, la dimensiunea declarată, în culorile din foaia de stil | 17 |
| `case-study` | capturile, ramele de device, cadranele de scor și că arcul chiar ajunge la valoare | 19 |
| `demo` | aplicația de programări: chiar se joacă — adaugă, anulează, filtrează, navighează zile, supraviețuiește unui reload; plus butoanele care duc la ea | 91 |
| `store` | magazinul: variante, stoc epuizat, coș, livrare calculată din primul produs, checkout, comandă, reload | 94 |
| `examples` | cele două demo-uri cu site întreg: rama, personalizarea prin `postMessage`, meniul care chiar navighează în interiorul iframe-ului, formularele, `noindex` și headerele de încadrare | 166 |
| `offers` | că aceeași ofertă are același preț în carduri, pe pagina de serviciu, în configurator, în formular și în articolele de blog; plus că linkurile din articole chiar răspund | 77 |
| `audit` | auditul instant, cu API-ul simulat — sau varianta cu buton, dacă nu e cheie; plus calculatorul costului unui site lent | 18 / 44 |
| `analytics` | statisticile de trafic: beacon prezent sau absent, CSP pe măsură, politica de confidențialitate pe măsură | 16 / 29 |
| `signature` | semnătura vizuală: paleta e a ei și trece AA în ambele teme, marca e o mască, fasciculul chiar se rotește când e pe ecran și chiar se oprește când nu e, coloana procesului se desenează la scroll — și supraviețuiește minificării | 42 |
| `colophon` | colofonul și lista de lansare: cifra de pe pagină e cea din depozit, bugetele citate sunt cele asertate, fiecare suită citată există, pagina nu-și declară niciodată propriile teste trecute, iar lista se tipărește | 55 |
| `weight` | bugete de octeți pe `dist/`: HTML, CSS, JS, fonturi, imagini OG — brotli calculat local | 29 |

**Suitele urmăresc starea build-ului.** `audit` detectează dacă e configurată o
cheie PageSpeed și verifică varianta care chiar e livrată: 18 verificări fără
cheie, 44 cu ea. `analytics` face la fel cu tokenul Cloudflare: 16 verificări fără
el (niciun script, nicio cerere, CSP nelărgit), 29 cu el. Nu trebuie editat nimic
când se schimbă starea.

**`weight` nu deschide browserul.** Citește direct `dist/` și comprimă cu
`node:zlib`, deci o picare înseamnă mereu că s-au schimbat artefactele, niciodată
că mașina era ocupată. Fiecare prag are scris lângă el cât e măsurătoarea de azi;
când depășești unul intenționat, îl ridici și actualizezi comentariul — editarea
aia e evidența deciziei.

## Ce nu e aici

**Lighthouse.** Are nevoie de Chrome complet, durează minute și e mai degrabă o
măsurătoare decât un test. Rămâne unealtă locală.

**CI.** GitHub Actions e blocat la nivel de cont pe acest repo (vezi `PLAN.md`),
deci n-are rost un workflow care nu pornește și cu atât mai puțin un badge care ar
minți. Testele se rulează local, înainte de push.

## Când adaugi o suită

Pune fișierul în `suites/`, importă din `../harness.mjs` și adaugă numele în lista
`SUITES` din `run.mjs`. Scrie fiecare rezultat ca `PASS  ...` sau `FAIL  ...` la
începutul liniei — runner-ul le numără de acolo — și setează `process.exitCode = 1`
dacă a picat ceva, ca suita să poată fi rulată și singură.
