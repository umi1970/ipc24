# Stil: „Bold & Lokal"

**Pitch:** Feuer-Orange auf Schwarz, Archivo-Black-Display-Schrift und ein XXL-Telefonbutton als Haupt-CTA – für Handwerksbetriebe, die maximalen Lokalstolz zeigen und Privatkunden über schnelle Erreichbarkeit und Handlungsdruck konvertieren wollen.

## Token-Referenz

| Token           | Wert      | Einsatz                        |
|-----------------|-----------|--------------------------------|
| brand-fire      | #FF4500   | Primär-Akzent, CTAs, Badges    |
| brand-fire-dk   | #CC3700   | Hover-State                    |
| brand-black     | #111111   | Haupt-Hintergrundfarbe         |
| brand-charcoal  | #2A2A2A   | Sekundäre dunkle Flächen       |
| brand-gray      | #F0F0F0   | Sections auf hellem Hintergrund|
| brand-white     | #FFFFFF   | Text auf dunklen Flächen       |
| brand-muted     | #888888   | Sekundärtext                   |

## Typografie
- **Headlines:** Archivo Black (Display), kein font-weight notwendig – ist bereits Black
- **Body/Labels:** Archivo, 400/600
- **Scale:** xs · sm · base · lg · xl · 3xl · 4xl · 5xl · 7xl

## Zielgruppe
Privathaushalte, Mieter, ältere Zielgruppen, die schnelle lokale Lösung suchen. Höchste Conversion-Rate bei Notfall-Situationen (Heizung kaputt, Rohrbruch etc.). Farbe `brand-fire` kann aus Lead-Daten abgeleitet werden (z.B. Stadtfarbe).

## Platzhalter-Schema

```
{{firma}}            Firmenname
{{branche}}          Handwerks-Kategorie (z.B. "Klempner")
{{tel}}              Telefonnummer (dreifach eingesetzt: Topbar, Nav, Hero-CTA)
{{adresse}}          Ort / vollständige Adresse (z.B. "Karlsruhe")
{{hero_image}}       URL für seitliches Teamfoto / Arbeitsszene
{{referenzen[0-5].url}}    URL je Referenzbild
{{referenzen[0-5].titel}}  Bild-Unterschrift
{{firma|slug}}       URL-sicherer Firmenname für E-Mail-Platzhalter
```

## Besonderheit
- Öffnungszeiten-Block ist hardcodiert als Muster – Render-Pipeline muss ggf. `Mo–Fr 07–18` aus Lead-Daten ersetzen (Platzhalter noch ergänzbar).
- Map-Sektion zeigt CSS-Placeholder; das finale Template kann Google Maps Embed via `{{maps_embed_url}}` einfügen.
