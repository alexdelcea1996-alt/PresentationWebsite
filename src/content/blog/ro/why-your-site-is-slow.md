---
urlSlug: de-ce-se-incarca-greu-site-ul-tau
title: De ce se încarcă greu site-ul tău și ce poți repara singur azi
description: Cele patru cauze care încetinesc aproape orice site mic, în ordinea impactului. Trei dintre ele se rezolvă fără dezvoltator, într-o după-amiază.
publishedAt: 2026-08-04
category: Ghid
---

„Optimizare de viteză" sună a ceva ce trebuie plătit. De cele mai multe ori nu e. Din zece site-uri
lente pe care le-am analizat, la opt cauza principală era ceva ce proprietarul putea repara singur,
într-o după-amiază, fără să scrie o linie de cod.

Uite cauzele reale, în ordinea în care contează.

## 1. Pozele. Aproape întotdeauna pozele.

E cauza numărul unu și nu e nici pe locul doi aproape. O fotografie făcută cu telefonul are, în mod
obișnuit, 4000 de pixeli lățime și între 3 și 8 megabytes. Încărcată direct pe site, browserul o
descarcă întreagă și apoi o micșorează ca să încapă într-un spațiu de 800 de pixeli. Ai plătit
transferul pentru ceva ce nu se vede.

Zece poze de câte 5 MB înseamnă 50 MB pe o pagină. Pe internet mobil, aia e o pagină care se încarcă
în zeci de secunde.

**Ce faci:** înainte să încarci o poză, redimensioneaz-o la maximum 1600 de pixeli lățime și
convertește-o în WebP. [Squoosh](https://squoosh.app) face ambele în browser, gratuit, fără să
instalezi nimic. O poză de 5 MB ajunge frecvent la 150 KB — de treizeci de ori mai mică — la o
diferență de calitate pe care nu o vede nimeni.

Dacă ai deja zeci de poze mari încărcate, începe cu cele de pe prima pagină. Restul pot aștepta.

## 2. Scripturile pe care le-ai uitat acolo

Fiecare instrument adăugat pe site aduce cu el cod care trebuie descărcat și executat: widget-ul de
chat, harta încorporată, bara de cookie-uri, pixelul de Facebook, două sisteme de analytics pentru că
nu ai fost sigur care e mai bun, un plugin de galerie pe care l-ai încercat o dată.

Fiecare dintre ele pare mic. Împreună, ajung să depășească tot conținutul real al paginii.

**Ce faci:** deschide lista de pluginuri sau de integrări și taie tot ce nu ai folosit în ultimele
trei luni. Regula simplă: dacă nu poți numi o decizie pe care ai luat-o pe baza acelui instrument,
nu îți trebuie. Widget-ul de chat pe care nu îl răspunde nimeni e cel mai frecvent candidat.

## 3. Fonturile luate de pe alt domeniu

Dacă site-ul tău încarcă fonturi direct de la Google, browserul trebuie să se conecteze la un al
doilea server, să aștepte răspunsul, apoi să descarce fișierele — și abia după aceea afișează textul.
Pe o conexiune mobilă lentă, asta înseamnă o secundă în care vizitatorul se uită la o pagină goală
sau vede textul sărind când fontul se încarcă în sfârșit.

**Ce faci:** aici ai nevoie de cineva tehnic, dar e o intervenție mică. Fonturile se pot găzdui pe
propriul domeniu. Site-ul acesta, de exemplu, își livrează fonturile de pe același server și le
împarte astfel încât diacriticele românești să se descarce doar pe paginile care le folosesc.

Ce poți face singur: redu numărul de fonturi. Două familii sunt suficiente pentru orice site. Patru
greutăți diferite pentru fiecare, nu.

## 4. Găzduirea ieftină

Un plan de găzduire de 3 euro pe lună înseamnă, de obicei, un server pe care stau alte câteva sute de
site-uri. Când unul dintre ele are un vârf de trafic, toate celelalte încetinesc. Nu ai cum să afli
asta din panoul tău de administrare.

**Cum verifici:** măsoară timpul până la primul octet (TTFB) în PageSpeed Insights. Dacă e constant
peste 600 de milisecunde, iar pozele sunt deja optimizate, serverul e problema.

**Ce faci:** un site static — genul care nu are nevoie de bază de date la fiecare vizită — poate fi
găzduit gratuit pe infrastructură globală, cu timpi sub 100 de milisecunde. Nu orice site se poate
muta ușor, dar merită întrebat.

## Cum măsori, fără să te pierzi în grafice

Intră pe [PageSpeed Insights](https://pagespeed.web.dev), pune adresa site-ului și uită-te la
**secțiunea de mobil**, nu la cea de desktop. Majoritatea vizitatorilor tăi vin de pe telefon, iar
scorul de desktop e aproape întotdeauna flatant.

Din toate cifrele afișate, urmărește una singură la început: **LCP** — cât durează până apare cel mai
mare element vizibil, de obicei imaginea principală. Sub 2,5 secunde e bine. Peste 4, ai o problemă
care te costă vizitatori.

Ignoră deocamdată restul. Un scor de 100 nu e obiectivul; un site care se simte rapid este.

## Ce nu poți repara singur

Ca să fiu cinstit până la capăt: dacă tema pe care o folosești încarcă un framework întreg pentru un
carusel, sau dacă structura paginii e făcută din zece niveluri de containere imbricate, nicio poză
comprimată nu te salvează. Astea cer intervenție în cod.

Dar merită să încerci întâi cele trei lucruri de mai sus. De multe ori sunt de ajuns, iar dacă nu
sunt, măcar știi că problema e mai adâncă și nu plătești pe cineva să facă ce puteai face singur.

Dacă vrei să știi în care categorie ești, îți spun eu — trimite-mi adresa și primești în 48 de ore o
listă scrisă cu ce am găsit, în ordinea impactului. E gratuit și nu te sun după.
