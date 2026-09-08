# delco.nu – statisk sajt

Ombyggnad av delco.nu utifrån Clanora-mallen (`../clanora/`). Sajten är byggd som statiska HTML-sidor och genereras
från källfiler i `_src/` via `build.py`, så att header/footer hålls identiska på alla sidor.

## Så bygger du om sajten

Källinnehållet ligger i `_src/`:

- `_src/partials/header.html` – gemensam header/nav (alla sidor)
- `_src/partials/footer.html` – gemensam footer (alla sidor)
- `_src/pages/<sida>.html` – sidans huvudinnehåll (utan header/footer/head)
- `_src/pages/<sida>.meta.json` – titel, meta description, canonical-URL, JSON-LD schema, sitemap-prioritet

Ändra i `_src/`, kör sedan:

```
python3 build.py
```

Detta skriver om samtliga `index.html`-filer på rätt sökväg samt `sitemap.xml` och `robots.txt`.

**OBS:** Sajten använder root-relativa sökvägar (`/assets/...`, `/tjanster/...`). För att förhandsgranska lokalt,
starta en enkel webbserver i `delco.nu/`-mappen, t.ex.:

```
python3 -m http.server 8000
```

och öppna `http://localhost:8000/`. Att öppna `index.html` direkt som fil (`file://`) fungerar inte korrekt eftersom
CSS/JS och interna länkar då inte hittas.

## Sidkarta – vilken mallfil varje sida är byggd från

| Ny sida (delco.nu)                        | Bas-mall (clanora/)                          | Källfil i `_src/pages/`        |
|--------------------------------------------|-----------------------------------------------|---------------------------------|
| `/`                                        | `index.html`                                   | `home.html`                    |
| `/tjanster/`                                | `services.html`                                | `tjanster-hub.html`            |
| `/tjanster/hemstadning/`                    | `services-single.html`                         | `tjanster-hemstadning.html`    |
| `/tjanster/kontorsstadning/`                | `services-single.html`                         | `tjanster-kontorsstadning.html`|
| `/tjanster/trappstadning/`                  | `services-single.html`                         | `tjanster-trappstadning.html`  |
| `/tjanster/flytt-och-storstadning/`         | `services-single.html`                         | `tjanster-flytt.html`          |
| `/omraden/`                                 | `locations.html` (innehåll helt ersatt)        | `omraden-hub.html`             |
| `/omraden/malmo/`                           | `services-single.html` + `locations.html`      | `omraden-malmo.html`           |
| `/omraden/lund/`                            | `services-single.html` + `locations.html`      | `omraden-lund.html`            |
| `/omraden/landskrona/`                      | `services-single.html` + `locations.html`      | `omraden-landskrona.html`      |
| `/omraden/eslov/`                           | `services-single.html` + `locations.html`      | `omraden-eslov.html`           |
| `/omraden/kavlinge/`                        | `services-single.html` + `locations.html`      | `omraden-kavlinge.html`        |
| `/omraden/helsingborg/`                     | `services-single.html` + `locations.html`      | `omraden-helsingborg.html`     |
| `/omraden/staffanstorp/`                    | `services-single.html` + `locations.html`      | `omraden-staffanstorp.html`    |
| `/hur-det-fungerar/`                        | `how-it-works.html`                            | `hur-det-fungerar.html`        |
| `/om-oss/`                                  | `about-us.html`                                | `om-oss.html`                  |
| `/faq/`                                     | `faqs.html`                                    | `faq.html`                     |
| `/kontakt/`                                 | `contact-us.html`                              | `kontakt.html`                 |
| `/offert/`                                  | `request-estimate.html`                        | `offert.html`                  |

`pricing.html` (mallens prissida) användes **inte** – prissidan skippades enligt uppdragsgivarens instruktion, eftersom
ingen prissättning fanns att utgå från.

Header och footer på alla 19 sidor bygger på headern/footern i `index.html` respektive `services-single.html` i
mallen (identiska på alla mallsidor), omskrivna till Delco AB:s navigation, kontaktuppgifter och länkstruktur.

## Ombrandning

- Primärfärg `#2983fd` → `#c8302f` (Delco-röd), sekundärfärg `#063464` → `#1a1a1a` (svart/mörkgrå), accentfärg
  `#fee023` → `#c8302f` (konsoliderad till samma röd för en renodlad röd/svart/vit-profil). Ändringarna är gjorda
  direkt i `assets/css/style.css` (kompilerad CSS, ingen SCSS-byggkedja krävdes). Källmallens SCSS i `../clanora/`
  är orörd.
- Alla texter, formulär, nav och footer är översatta/omskrivna till svenska och Delco AB:s innehåll.
- `assets/` är kopierad rakt av från `clanora/assets/` (ikoner, typsnitt, JS-bibliotek oförändrade), med endast
  färgjusteringen ovan i `style.css`.

## Logotyp och bildmaterial

Den riktiga Delco AB-loggan (`Delco-logga-1-scaled-e1770013877910.webp`, hittades i `assets/images/` – tydligen
tillagd direkt i mallmappen snarare än i `logo/`-undermappen) används nu i header och footer på alla 19 sidor, som
`assets/images/logo/delco-logo.webp`. De tre riktiga "miljöbilderna" (`Delco-miljobilder-sociala-medier-*.webp`) med
Delco-personal på jobbet har också hittats och används på startsidan, `/om-oss/`, `/tjanster/hemstadning/` och
`/tjanster/kontorsstadning/` istället för mallens generiska stockbilder.

Alla kvarvarande UI-ikoner som innehöll mallens gamla blå/gula märkesfärger (telefonikonen i kontaktsektionen,
faviconen) har färgkorrigerats till rött/svart. `assets/css/style.css` genomsöktes även efter kvarvarande
hårdkodade blånyanser utöver de tre SCSS-variablerna (gradients, header-topbar, footer, formulärplaceholders,
listikoner m.m.) – samtliga är nu bytta till röd/svart/vit-paletten.

## ⚠️ Kvarstående att åtgärda innan lansering

1. **Favicon.** `assets/images/favicon/favicon.png` är fortfarande mallens ikonform (en stiliserad "C"), bara
   färgkorrigerad till rött – inte den riktiga Delco-loggan. Generera en kvadratisk favicon (helst 512×512, PNG)
   utifrån hustak-ikonen i den riktiga loggan när en sådan finns, för bästa resultat i webbläsarflikar.
2. **Grundandeår.** Använder medvetet "15 års erfarenhet" istället för ett specifikt årtal (2007/2011), i väntan på
   bekräftelse. Uppdatera i `_src/pages/om-oss.html` och `_src/pages/home.html` när årtalet är bekräftat.
3. **Kontaktformulär.** Formulären postar till `/assets/php/contact.php` (mallens PHP-mailer, oförändrad). Kontrollera
   att mottagaradress och SMTP-inställningar i den filen pekar på `info@delcoab.se` innan sidorna går i drift.
4. **Prissida.** `/priser/` byggdes inte – ingen prissättning fanns att utgå från. Ortsidorna visar istället en
   trygghets-/abonnemangsbox utan prisuppgifter, med CTA till `/offert/`.

## SEO-implementation

- Unik `<title>` (<60 tecken) och meta description (<155 tecken) med CTA/nyckelord på alla 19 sidor.
- `HousekeepingService`/`LocalBusiness`-schema (adress, telefon, öppettider, betyg 4,8/21 recensioner) på startsidan
  och kontaktsidan. `Service`-schema på de fyra tjänstesidorna. `FAQPage`-schema på FAQ-sidan och samtliga sju
  ortsidor (matchar synligt innehåll). `BreadcrumbList`-schema på hub- och ortsidor.
- Canonical-tagg på alla sidor (`https://delco.nu/...`).
- `sitemap.xml` och `robots.txt` genereras automatiskt av `build.py`.
- Varje ortsida har minst ett unikt stycke om lokala stadsdelar/närområden (t.ex. Malmö: Västra Hamnen, Limhamn,
  Hyllie, Rosengård, Oxie; Lund: Norra Fäladen, Klostergården, Linero) – ingen brödtext är kopierad mellan
  ortsidorna.
- Intern länkning: varje tjänstesida länkar ner till alla sju ortsidor (per tjänst-ankare `#hemstadning` osv.), och
  varje ortsida länkar upp till respektive tjänstesida. Footern länkar dessutom till samtliga tjänste- och
  ortsidor från varje sida på sajten.
