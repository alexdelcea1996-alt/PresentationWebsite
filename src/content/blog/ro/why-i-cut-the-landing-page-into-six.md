---
urlSlug: de-ce-am-taiat-prima-pagina-in-sase
title: De ce am tăiat prima pagină a site-ului meu în șase, cu cifrele înainte și după
metaTitle: De ce am tăiat prima pagină în șase
description: Prima pagină avea 13 secțiuni și 17 ecrane; acum are 6 și 6. Cifrele înainte și după, ce s-a înjumătățit, ce n-a mișcat, și cum recunoști problema la tine.
publishedAt: 2026-09-05
category: Culise
---

Până săptămâna asta, site-ul pe care îl citești era o singură pagină. Una lungă: 13 secțiuni,
17 ecrane de derulat, iar meniul de sus nu ducea nicăieri — sărea la ancore în interiorul aceleiași
pagini. Am construit-o așa intenționat, și am avut un motiv bun. Apoi am măsurat și motivul nu mai
era suficient.

Articolul ăsta e despre ce am schimbat și de ce, cu cifrele reale. Nu ca să mă laud — o pagină
înjumătățită e o pagină care a fost de două ori prea mare — ci pentru că aceeași greșeală e pe
multe site-uri de firmă, și semnele ei se recunosc ușor odată ce le știi.

## De ce părea o idee bună

Argumentul pentru o singură pagină lungă e real: omul ajunge sus, derulează, și ordinea secțiunilor
e o pâlnie. Întâi cine ești, apoi ce faci, apoi dovada, apoi prețul, apoi formularul. Nimeni nu se
pierde, pentru că nu are unde.

Funcționează pentru cineva care începe de sus. Problema e că aproape nimeni nu începe de sus.

## De ce nu era

Trei lucruri, toate descoperite uitându-mă la cum era folosită pagina, nu la cum credeam eu că e.

**Prețurile erau la nouă secțiuni distanță.** Omul care caută „cât costă un site" și ajunge pe
pagină nu vrea să citească despre procesul meu de lucru înainte. Vrea lista de prețuri. Pe o pagină
lungă, lista era acolo — dar la 11.000 de pixeli de unde a aterizat.

**Un link nu putea trimite o bucată.** Când cineva voia să-i arate unui asociat oferta, trimitea
adresa site-ului. Tot site-ul. Asociatul deschidea o pagină de 17 ecrane și n-avea de unde să știe
că bucata relevantă e undeva pe la mijloc.

**O singură pagină se lupta pentru nouă întrebări.** Google indexează pagini, nu secțiuni. O pagină
care vorbește simultan despre servicii, prețuri, proces, garanții, portofoliu, estimare și contact e
o pagină care nu e *despre* nimic anume — și pentru fiecare dintre întrebările alea, pierde în fața
unei pagini care e doar despre una.

## Ce am făcut

Am mutat secțiunile pe paginile pe care meniul le promitea oricum:

- **Servicii** — ce construiesc, cum decurge un proiect, și de ce un site făcut de om bate șablonul
- **Proiecte** — studiile de caz și două site-uri-exemplu întregi, pe care le poți folosi în pagină
- [**Prețuri**](/preturi/) — pachetele, ce garantez în scris, și întrebările de dinaintea unei oferte
- [**Estimare**](/estimare/) — configuratorul și auditul instant
- **Contact** — formularul, și dedesubt, cine îl citește

Prima pagină a rămas drumul cel mai scurt către oricare dintre ele: cine sunt, dovada măsurată, un
rezumat al serviciilor, un studiu de caz, trei drumuri marcate și un buton. Fiecare bucată de pe
ea e secțiunea reală, scurtată — nu un text nou scris *despre* secțiune.

## Cifrele, înainte și după

Măsurate pe aceeași mașină, în același browser, la aceeași lățime de ecran, pe pagina de dinainte
și pe cea de după. Nimic estimat.

| | Înainte | După |
|---|---|---|
| Secțiuni pe prima pagină | 13 | 6 |
| Lungime, la un ecran de 1280 × 900 | 17,4 ecrane | 5,9 ecrane |
| Cuvinte pe prima pagină | 2.253 | 570 |
| Documentul HTML, comprimat | 24,3 kB | 12,1 kB |
| JavaScript încorporat în pagină | 16,1 kB | 10,1 kB |
| Lighthouse pe mobil, prima pagină | 98–99 | 99–100 |

Cele cinci pagini noi au ieșit fiecare la 100 pe mobil — nu pentru că ar fi făcut ceva special, ci
pentru că fiecare încarcă doar ce are nevoie. Formularul de contact, configuratorul și auditul erau
trei dintre cele mai mari scripturi de pe site, și toate trei se descărcau pe prima pagină pentru un
vizitator care voia doar să vadă prețurile.

## Ce nu s-a schimbat, ca să fiu corect

**Octeții descărcați în total, aproape deloc:** 95 de kilobyți înainte, 91 după. Documentul HTML s-a
înjumătățit, dar fonturile și foaia de stil sunt comune tuturor paginilor și nu s-au clintit. Dacă
te-ai aștepta ca o pagină de două ori mai scurtă să se descarce de două ori mai repede, nu — se
*randează* mai repede și se *citește* mai repede, ceea ce e altceva și, pentru un vizitator, mai
important.

**Scorul Lighthouse era deja aproape de maxim.** Un punct în plus nu e argumentul. Argumentul e că
omul care caută prețuri le găsește în prima secțiune a unei pagini care se numește „Prețuri".

## Ce a trebuit să meargă mai departe, nevăzut

Despărțirea în sine a durat mai puțin decât lucrurile care nu aveau voie să se strice odată cu ea.

**Linkurile vechi.** `site.ro/#preturi` e în articole deja publicate, în e-mailuri trimise și în
bookmark-uri, și niciunul nu poate fi editat. Prima pagină le recunoaște și le duce mai departe la
pagina care găzduiește acum secțiunea, cu tot cu parametrii pe care îi purtau. Un link vechi care
aterizează în capul unei pagini care nu mai conține ce promitea arată ca și cum lucrul ar fi fost
șters.

**Estimarea care devine cerere de ofertă.** Configuratorul obișnuia să completeze formularul de
contact direct — formularul era trei secțiuni mai jos, în același document. Acum e o pagină
distanță, iar estimarea trebuie să traverseze o navigare cu tipul de proiect, bugetul și rezumatul
detaliat, și apoi să fie uitată, ca o vizită de peste o oră să nu găsească formularul completat cu
răspunsurile altcuiva.

**Un singur titlu principal pe pagină.** Secțiunile aveau titluri de rangul doi, fiindcă erau
secțiuni. Când o secțiune devine pagină, titlul ei trebuie să devină rangul unu, și tot ce e sub el
coboară un nivel — altfel un cititor de ecran anunță o pagină fără titlu.

Toate astea sunt acoperite de verificări automate — câte sunt la zi scrie în [colofon](/colofon/),
care se recalculează la fiecare build. O despărțire fără ele ar fi fost o zi de muncă și o lună
de linkuri rupte.

## Cum știi dacă site-ul tău are aceeași problemă

Trei semne, oricare e suficient:

1. **Meniul de sus sare la ancore**, nu la pagini. Dacă adresa din browser nu se schimbă când
   apeși pe „Prețuri", ești pe o singură pagină lungă.
2. **Nu poți trimite cuiva un link către o singură bucată.** Încearcă: trimite-ți ție pe WhatsApp
   linkul către prețurile tale. Dacă nu există un astfel de link, clienții tăi n-au cum să-l trimită
   nici ei.
3. **Google te afișează cu descrierea greșită.** Cauți firma ta și rezultatul vorbește despre
   altceva decât ce ai căutat — pentru că pagina vorbește despre toate deodată și motorul a ales el
   o bucată.

Niciunul nu e un motiv de panică. Sunt un motiv de măsurat, și apoi, dacă cifrele arată ce au
arătat ale mele, de tăiat. Dacă vrei să vezi de unde ai porni, [estimarea](/estimare/) durează
treizeci de secunde și nu cere nicio adresă de e-mail.
