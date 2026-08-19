---
urlSlug: acest-site
title: Site-ul pe care îl citești acum
summary: Un site de prezentare bilingv construit ca să își demonstreze singur calitatea — cu scoruri măsurate, nu promise.
client: Proiect propriu
category: Site de prezentare
year: 2026
url: self
repo: https://github.com/alexdelcea1996-alt/PresentationWebsite
tech:
  - Astro
  - Tailwind CSS
  - TypeScript
  - Cloudflare
problem: >-
  Un dezvoltator web care își caută clienți are o problemă de credibilitate specifică: orice ar
  scrie despre viteză, SEO sau accesibilitate, clientul nu are cum să verifice. Iar dacă propriul
  site se încarcă greu sau arată prost pe telefon, argumentele se anulează singure.
solution: >-
  Am construit site-ul ca pe o demonstrație verificabilă, nu ca pe o broșură. Zero JavaScript de
  framework, fonturi găzduite local și împărțite pe intervale de caractere, conținut separat complet
  de interfață și o structură bilingvă în care o traducere lipsă oprește build-ul în loc să lase un
  gol în pagină.
result: >-
  Scorurile de mai jos sunt măsurate pe build-ul de producție, nu estimate. Codul e public, deci
  oricine poate verifica afirmațiile — inclusiv un client care vrea a doua opinie de la alt
  dezvoltator.
coverDesktop: ../images/this-site-desktop.png
coverMobile: ../images/this-site-mobile.png
coverAlt: Prima pagină a site-ului pe desktop și pe telefon, în tema întunecată.
metrics:
  - label: Lighthouse desktop
    value: 100/100
    score: 100
  - label: Lighthouse mobil
    value: 98/100
    score: 98
  - label: Încălcări de accesibilitate
    value: '0'
  - label: JavaScript de framework
    value: 0 kB
order: 0
---

## Ce am urmărit

Site-ul avea un singur obiectiv de business: să transforme vizitatorul într-o cerere de ofertă.
Tot ce nu servea acestui scop a rămas pe dinafară — inclusiv lucruri care ar fi arătat impresionant
într-o prezentare, dar ar fi încetinit pagina.

## Deciziile care au contat

**Static, nu dinamic.** Paginile sunt generate la build și livrate direct de pe CDN. Nu există server
care poate cădea și nici bază de date de întreținut. Costul de găzduire e zero.

**Fonturile stau în repository.** Fraunces (titluri) și Inter (text) sunt descărcate ca fonturi
variabile și livrate de pe același domeniu, împărțite pe `unicode-range`. Fișierul cu diacritice
românești se descarcă doar pe paginile care chiar le folosesc, iar build-ul nu depinde de niciun
serviciu extern. Fraunces păstrează axa de mărime optică — aceeași literă e desenată altfel la 80px
și la 18px — dar i s-a fixat greutatea la singura folosită pe site, ceea ce taie 33 kB dintr-un
fișier care altfel ar fi purtat variații pe care nimeni nu le cere.

**Conținutul e separat de cod.** Toate textele stau în două fișiere, câte unul per limbă, verificate
față de aceeași structură de tip. O traducere lipsă devine eroare la compilare, nu un spațiu gol
descoperit de un vizitator.

**Accesibilitate din start.** Contrast verificat, navigare completă de la tastatură, animații care se
opresc pentru cine a cerut asta în setările sistemului. Auditul automat trece fără nicio abatere pe
ambele limbi.

## Ce a ieșit

Un site care se încarcă instant, apare corect în Google în ambele limbi și poate fi verificat de
oricine — pentru că sursa e publică. Configuratorul de preț din pagină e, la rândul lui, o dovadă
funcțională că pot construi și aplicații web, nu doar site-uri de prezentare.
