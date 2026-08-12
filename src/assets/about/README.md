# Poza pentru „Despre mine"

Pune aici un fișier numit exact `portrait.jpg` (sau `.png`, `.webp`, `.avif`) și
apare automat în secțiunea „Despre mine" de pe prima pagină, sus în cardul cu
numele. Nu trebuie schimbat niciun cod: `About.astro` caută fix numele ăsta.

- Format vertical, raport 4:5 (de exemplu 1200×1500 px). Se decupează de sus,
  ca să nu taie fața dacă poza e mai lungă.
- Astro o convertește singur în AVIF și generează variantele de 320 și 640 px.
- Textul alternativ vine din `about.photoAlt` (`src/i18n/ro.ts` și `en.ts`) —
  nu se scrie în componentă.

Fără fișier, cardul arată terminat: nume, rol, cele trei fapte și butonul.
Nu există chenar punctat care să aștepte o poză.
