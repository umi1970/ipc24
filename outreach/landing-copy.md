# Landing-Page Copy — ipc24.de/m/{{lead_slug}}

Alle Texte sind für die personalisierte Lead-Landing-Page auf `ipc24.de/m/<lead-slug>`.  
Platzhalter in `{{doppelten_geschweiften_klammern}}` werden aus dem Lead-Issue befüllt.

---

## Platzhalter-Legende

| Platzhalter | Quelle | Beispiel |
|---|---|---|
| `{{firma}}` | Audit-CSV, `name` | `Malermeister Müller` |
| `{{branche}}` | Audit-CSV, `branche` | `Maler & Lackierer` |
| `{{ort}}` | Audit-CSV, `anschrift` (Stadt) | `Karlsruhe` |
| `{{vorname}}` | Audit-CSV, `inhaber_name_guess` (Vorname) | `Hans` |
| `{{website_url}}` | Audit-CSV, `url` | `maler-mueller-ka.de` |
| `{{screenshot_ist}}` | Audit-Pipeline, Desktop-Screenshot URL | `cdn.ipc24.de/leads/mueller/ist-desktop.jpg` |
| `{{screenshot_ist_mobile}}` | Audit-Pipeline, Mobile-Screenshot URL | `cdn.ipc24.de/leads/mueller/ist-mobile.jpg` |
| `{{mockup_1_desktop}}` | Mockup-Pipeline, Variante 1 Desktop | `cdn.ipc24.de/leads/mueller/v1-desktop.jpg` |
| `{{mockup_1_mobile}}` | Mockup-Pipeline, Variante 1 Mobile | `cdn.ipc24.de/leads/mueller/v1-mobile.jpg` |
| `{{mockup_2_desktop}}` | Mockup-Pipeline, Variante 2 Desktop | `cdn.ipc24.de/leads/mueller/v2-desktop.jpg` |
| `{{mockup_2_mobile}}` | Mockup-Pipeline, Variante 2 Mobile | `cdn.ipc24.de/leads/mueller/v2-mobile.jpg` |
| `{{mockup_3_desktop}}` | Mockup-Pipeline, Variante 3 Desktop | `cdn.ipc24.de/leads/mueller/v3-desktop.jpg` |
| `{{mockup_3_mobile}}` | Mockup-Pipeline, Variante 3 Mobile | `cdn.ipc24.de/leads/mueller/v3-mobile.jpg` |
| `{{finding_1}}` | Audit-PDF, Finding 1 | `Navigation auf Mobilgeräten nicht bedienbar` |
| `{{finding_2}}` | Audit-PDF, Finding 2 | `Keine Referenzbilder sichtbar` |
| `{{finding_3}}` | Audit-PDF, Finding 3 | `Ladezeit > 7 Sekunden auf Mobilgeräten` |
| `{{calendly_url}}` | Statisch | `calendly.com/ipc24/20min` |
| `{{lead_slug}}` | Audit-CSV, generiert aus `name` (kebab-case) | `malermeister-mueller` |

---

## 1. Hero-Sektion

### Headline

```
Vorschlag für {{firma}}: 3 Ideen, wie Ihre Website 2026 wirken könnte.
```

### Subheadline

```
Wir haben Ihre aktuelle Website analysiert und 3 Design-Varianten erstellt –
kostenlos und ohne jede Verpflichtung.
```

### Hero-CTA-Button

```
20 Min unverbindlich besprechen →
```
_Link: `{{calendly_url}}`_

### Hero-Badges (Trust-Elemente unter dem Button)

```
✓ Keine Vorauszahlung   ✓ Fertig in 2–4 Wochen   ✓ Festpreis ohne Überraschungen
```

---

## 2. Ihr Ist-Zustand (Vorher-Abschnitt)

### Abschnitts-Headline

```
Wie Ihre Website heute aussieht
```

### Intro-Text

```
Wir haben {{website_url}} auf Desktop und Mobilgeräten analysiert. Dabei sind uns drei Dinge aufgefallen,
die potenzielle Kunden heute davon abhalten könnten, Sie anzurufen:
```

### Finding-Liste

```
→ {{finding_1}}
→ {{finding_2}}
→ {{finding_3}}
```

### Screenshot-Label (unter Bild)

```
Aktuelle Website: {{website_url}}
```
_Bild: `{{screenshot_ist}}` (Desktop) | `{{screenshot_ist_mobile}}` (Mobile)_

---

## 3. Tab-Navigation (Vergleich)

```
[Ist-Zustand]  [Variante 1: Vertrauen & Handwerk]  [Variante 2: Klar & Premium]  [Variante 3: Bold & Lokal]
```

_Beim ersten Laden ist Tab "Ist-Zustand" aktiv._

---

## 4. Mockup-Sektionen (3 Varianten)

### 4.1 Variante 1 — „Vertrauen & Handwerk"

**Abschnitts-Badge:** `Variante 1 von 3`

**Stil-Headline:**

```
Vertrauen & Handwerk
```

**Pitch-Text:**

```
Warme Materialien, große Inhaber-Portraits, prominente Referenzgalerie.
Diese Variante spricht Kunden an, die den Meister persönlich kennenlernen wollen –
bevor sie anrufen.

Ideal für: {{branche}}-Betriebe, die auf Empfehlung und Stammkunden setzen.
```

**Mockup-Labels:**

- Desktop: `Ihr neuer Auftritt – Desktop-Ansicht`
- Mobile: `Kompakt & klar auf dem Smartphone`

_Bilder: `{{mockup_1_desktop}}` | `{{mockup_1_mobile}}`_

---

### 4.2 Variante 2 — „Klar & Premium"

**Abschnitts-Badge:** `Variante 2 von 3`

**Stil-Headline:**

```
Klar & Premium
```

**Pitch-Text:**

```
Minimalistisches Layout, viel Luft, starke Fotos im Vordergrund.
Diese Variante signalisiert Qualität auf den ersten Blick –
ohne ein Wort lesen zu müssen.

Ideal für: Betriebe, die höherpreisige Aufträge oder Gewerbekunden ansprechen wollen.
```

**Mockup-Labels:**

- Desktop: `Ihr neuer Auftritt – Desktop-Ansicht`
- Mobile: `Kompakt & klar auf dem Smartphone`

_Bilder: `{{mockup_2_desktop}}` | `{{mockup_2_mobile}}`_

---

### 4.3 Variante 3 — „Bold & Lokal"

**Abschnitts-Badge:** `Variante 3 von 3`

**Stil-Headline:**

```
Bold & Lokal
```

**Pitch-Text:**

```
Kräftige Farbe, lokale Ansprache, übergroßer Anruf-Button.
Diese Variante macht sofort klar: Wir sind aus {{ort}}, wir sind erreichbar,
ruf einfach an.

Ideal für: Betriebe, die hauptsächlich Laufkundschaft und Direktanfragen aus der Region gewinnen wollen.
```

**Mockup-Labels:**

- Desktop: `Ihr neuer Auftritt – Desktop-Ansicht`
- Mobile: `Kompakt & klar auf dem Smartphone`

_Bilder: `{{mockup_3_desktop}}` | `{{mockup_3_mobile}}`_

---

## 5. Pakete & Preise

### Abschnitts-Headline

```
Was eine neue Website bei IPC24 kostet
```

### Subheadline

```
Alle Pakete sind Festpreise – keine versteckten Kosten, keine Stundensätze.
```

---

### Paket 1 — Starter · 990 €

**Paket-Name:** `Starter`  
**Preis:** `990 €` (einmalig, inkl. MwSt.)

**Was ist drin:**
```
✓ One-Pager – alles auf einer Seite, mobiloptimiert
✓ Ihre wichtigsten Infos: Leistungen, Kontakt, Anfahrt
✓ 5 Fotos KI-veredelt (schärfer, heller, professioneller)
✓ Schnelle Ladezeit (Lighthouse-Score > 90)
✓ Impressum + DSGVO-konform
✓ Übergabe als fertige, hostingbereite Website
```

**Für wen:**
```
Ideal für Betriebe, die schnell online professionell wirken wollen –
ohne viel Aufwand.
```

---

### Paket 2 — Plus · 1.990 €

**Paket-Name:** `Plus`  
**Preis:** `1.990 €` (einmalig, inkl. MwSt.)  
**Badge:** `Beliebteste Wahl`

**Was ist drin:**
```
✓ Alles aus Starter
✓ 5 Unterseiten (z. B. Über uns, Leistungen, Referenzen, Kontakt)
✓ Kontaktformular mit automatischer E-Mail-Weiterleitung
✓ Lokales SEO-Setup (Google My Business-Verknüpfung, strukturierte Daten)
✓ Bis zu 15 Fotos KI-veredelt
✓ 30 Tage kostenloser Support nach Launch
```

**Für wen:**
```
Ideal für Betriebe, die auch über Google gefunden werden wollen –
und Kunden direkt über die Website anfragen lassen möchten.
```

---

### Paket 3 — Premium · 2.990 €

**Paket-Name:** `Premium`  
**Preis:** `2.990 €` (einmalig, inkl. MwSt.)

**Was ist drin:**
```
✓ Alles aus Plus
✓ Maßgeschneidert: Design und Inhalte auf Ihren Betrieb zugeschnitten
✓ Komplettes Foto-Shooting-Veredelungspaket (alle angelieferten Fotos)
✓ Erweiterte SEO-Analyse + Content-Empfehlungen
✓ 6 Monate Wartung & Updates inklusive
✓ Persönlicher Ansprechpartner bei IPC24 für die gesamte Laufzeit
```

**Für wen:**
```
Ideal für wachsende Betriebe, die eine vollständige digitale Präsenz aufbauen
und langfristig gepflegt wissen wollen.
```

---

### Preis-CTA

```
Welches Paket passt zu Ihnen? Wir klären das in 20 Minuten.
```

**Button:**
```
Kostenloses Gespräch buchen →
```
_Link: `{{calendly_url}}`_

---

## 6. Über IPC24

### Abschnitts-Headline

```
Wer steckt hinter IPC24?
```

### Text (2 Sätze)

```
IPC24 ist ein Karlsruher Web-Studio, das sich auf lokale Handwerksbetriebe spezialisiert hat –
von der ersten Idee bis zur fertigen Website, die Kunden überzeugt.

Unser USP: Wir veredeln Ihre vorhandenen Fotos mit KI –
so wirkt Ihre Website professionell, auch ohne teures Shooting.
```

---

## 7. Haupt-CTA (Bottom)

### Headline

```
Neugierig? 20 Minuten reichen.
```

### Text

```
Kein Verkaufsgespräch, kein Druck. Wir zeigen Ihnen die 3 Varianten,
Sie sagen uns, was gefällt – und wir machen ein konkretes Angebot.
Falls es nichts für Sie ist: kein Problem.
```

### CTA-Button (primär)

```
Jetzt Termin buchen – 20 Min unverbindlich →
```
_Link: `{{calendly_url}}`_

### Trust-Linie unter Button

```
Kein Risiko · Keine Vorauszahlung · Festpreis garantiert
```

---

## 8. Footer

```
© 2026 IPC24 · Web-Studio Karlsruhe

[Impressum](https://ipc24.de/impressum) · [Datenschutz](https://ipc24.de/datenschutz)

Diese Seite wurde persönlich für {{firma}} erstellt.
```

---

## Technische Hinweise für die Implementierung

- **URL-Schema:** `ipc24.de/m/{{lead_slug}}` — `lead_slug` = Firmenname in kebab-case, Umlaute normalisiert (ä→ae, ö→oe, ü→ue, ß→ss).
- **Fallback:** Falls `{{vorname}}` nicht befüllt ist, fällt die Headline auf `Vorschlag für {{firma}}: …` zurück (ohnehin der Standardfall).
- **OG-Tags** für Social-Preview: `og:title = "3 Website-Ideen für {{firma}}"`, `og:image = {{mockup_1_desktop}}`.
- **Noindex:** Alle `ipc24.de/m/*`-Seiten erhalten `<meta name="robots" content="noindex">` — Lead-Seiten sind nicht für Google bestimmt.
- **Tracking:** UTM-Parameter im Calendly-Link: `?utm_source=landing&utm_medium=dm&utm_campaign={{lead_slug}}`.
- **Ablauf:** Landing-Pages laufen 90 Tage nach Erstellung ab (Status → `abgelaufen`); danach 410 Gone.
