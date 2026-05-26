# XING / LinkedIn DM-Template — IPC24 Outreach

Beide Varianten halten die **600-Zeichen-Grenze** ein (typische Befüllung ~360–420 Zeichen).  
Kein Einsatz bei `info@`-Adressen oder ohne identifizierbaren Ansprechpartner (UWG § 7 Abs. 2 Nr. 3).

---

## Platzhalter-Legende

| Platzhalter | Quelle | Beispiel |
|---|---|---|
| `{{vorname}}` | Audit-CSV, Spalte `inhaber_name_guess` (Vorname) | `Hans` |
| `{{firma}}` | Audit-CSV, Spalte `name` | `Malermeister Müller` |
| `{{finding}}` | Audit-PDF, Top-Finding (Zeile 1 von 3) | `die Navigation springt auf Mobilgeräten aus dem Bild` |
| `{{landing_url}}` | Lead-Issue, Feld `landing_page_url` (generiert als `ipc24.de/m/<lead-slug>`) | `ipc24.de/m/malermeister-mueller` |
| `{{calendly_url}}` | Statisch: `calendly.com/ipc24/20min` | `calendly.com/ipc24/20min` |

> **Befüllung aus Audit-Pipeline:** Das Audit-Skript (Phase 2) schreibt `top_finding_text` in das Lead-Issue.  
> Der Landing-Page-Builder (Phase 3/5, CTO) schreibt `landing_page_url` in das Issue.  
> Das DM-Template liest beide Felder aus dem Issue, sobald es in Status `mockups_done` übergeht.

---

## Variante 1 — Sie (XING, förmlicher Erstkontakt)

> **Zeichenzahl:** ~395 Zeichen (mit Beispielwerten)

```
Hallo {{vorname}},

bin vorhin auf die Website von {{firma}} gestoßen und habe mir erlaubt, kurz reinzuschauen: {{finding}}.

Ich habe 3 schnelle Design-Ideen dazu visualisiert – kostenlos, unverbindlich: {{landing_url}}

Falls 20 Min für ein kurzes Gespräch passt: {{calendly_url}}
Wenn nicht – kein Problem.

Herzlich,
IPC24
```

**Ausgefülltes Beispiel:**

> Hallo Hans,
>
> bin vorhin auf die Website von Malermeister Müller gestoßen und habe mir erlaubt, kurz reinzuschauen: die Navigation springt auf Mobilgeräten aus dem Bild.
>
> Ich habe 3 schnelle Design-Ideen dazu visualisiert – kostenlos, unverbindlich: ipc24.de/m/malermeister-mueller
>
> Falls 20 Min für ein kurzes Gespräch passt: calendly.com/ipc24/20min
> Wenn nicht – kein Problem.
>
> Herzlich,
> IPC24

---

## Variante 2 — Du (LinkedIn, jüngere / casual Kontakte)

> **Zeichenzahl:** ~365 Zeichen (mit Beispielwerten)

```
Hey {{vorname}},

hab' gerade die Website von {{firma}} gesehen – direkt aufgefallen: {{finding}}.

Hab' spontan 3 Design-Ideen dazu gemacht – kostenlos, unverbindlich: {{landing_url}}

Falls du 20 Min hast: {{calendly_url}}
Falls nicht – voll okay!

LG, IPC24
```

**Ausgefülltes Beispiel:**

> Hey Hans,
>
> hab' gerade die Website von Malermeister Müller gesehen – direkt aufgefallen: die Navigation springt auf Mobilgeräten aus dem Bild.
>
> Hab' spontan 3 Design-Ideen dazu gemacht – kostenlos, unverbindlich: ipc24.de/m/malermeister-mueller
>
> Falls du 20 Min hast: calendly.com/ipc24/20min
> Falls nicht – voll okay!
>
> LG, IPC24

---

## Versand-Regeln (UWG-Konformität)

- Nur an **namentlich identifizierten Inhaber** — nie an `info@`, `kontakt@` oder Sammeladressen.
- Kein Massen-Versand über automatisierte Tools (LinkedIn/XING AGB + UWG § 7).
- Maximale Frequenz: **1 DM pro Lead**, kein Follow-up ohne Reaktion des Empfängers.
- Bei Ablehnung oder keiner Reaktion nach 14 Tagen: Status → `abgelehnt`, keine weiteren Kontaktversuche.
- Keine Erwähnung konkreter Preise im DM (vermeidet Preisdrückerei vor dem Gespräch).

---

## Qualitätscheckliste vor dem Versand

- [ ] `{{vorname}}` korrekt? (kein Nachname, kein Herr/Frau)
- [ ] `{{finding}}` spezifisch und faktisch? (aus Audit-PDF, keine Vermutungen)
- [ ] `{{landing_url}}` erreichbar? (Landing-Page live, Mockups geladen)
- [ ] Gesamtzeichenzahl ≤ 600? (inkl. Leerzeichen und Zeilenumbrüche)
- [ ] Korrekte Variante gewählt? (Sie für XING, Du nur wenn LinkedIn-Profil informal wirkt)
