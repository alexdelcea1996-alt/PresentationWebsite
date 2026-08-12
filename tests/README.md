# Teste

297 de verificări care rulează un browser real peste site-ul construit.

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
amestecată — cyan-ul #22d3ee apare ca #198499 — și raportează o problemă de
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
| `a11y` | axe-core (WCAG 2.1 AA) pe 16 pagini, temă întunecată, plus greutatea paginii | 16 |
| `a11y-light` | aceleași reguli pe 5 pagini în tema luminoasă | 10 |
| `csp` | zero violări CSP pe 6 pagini, cu header-ele reale aplicate | 10 |
| `interact` | meniu mobil, comutator de limbă, ancore, ambele căi ale formularului | 15 |
| `channels` | e-mail, telefon și WhatsApp în card, footer și date structurate | 39 |
| `metrics` | banda care măsoară pagina: cifrele afișate = ce raportează browserul | 24 |
| `configurator` | wizardul de ofertă, calculul prețului, precompletarea formularului | 19 |
| `theme` | light/dark, persistență, fără flash la încărcare | 14 |
| `hero` | parallax la cursor, oprit sub `prefers-reduced-motion` și pe pointer grosier | 12 |
| `booking` | modalul Cal.com, încărcare la cerere, temă, Escape, click cu modificatori | 18 |
| `transitions` | tranzițiile între pagini: că regula ajunge în CSS, că rulează, că nu rulează sub reduced-motion | 15 |
| `completeness` | pagina 404, setul de iconuri, manifestul, schema `FAQPage`, `hreflang` în sitemap | 53 |
| `guarantees` | secțiunea de garanții, ambele coloane, și că nu au rămas casete goale | 16 |
| `share-images` | fiecare pagină are propria imagine OG, la dimensiunea declarată, și există | 14 |
| `case-study` | capturile, ramele de device, cadranele de scor și că arcul chiar ajunge la valoare | 19 |
| `audit` | auditul instant, cu API-ul simulat — sau varianta cu buton, dacă nu e cheie | 4 / 30 |

**Suitele urmăresc starea build-ului.** `audit` detectează dacă e configurată o
cheie PageSpeed și verifică varianta care chiar e livrată: 4 verificări fără
cheie, 30 cu ea. Nu trebuie editat nimic când se schimbă starea.

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
