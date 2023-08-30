# Blatt 3

## !!! WICHTIGER HINWEIS !!!

**Augrund fehlender GitLab-Berechtigung wurde meine Abgabe zu Blatt_1 noch nicht von Ihnen bewertet. Entsprechend habe ich auf das Blatt_1 aktuell 0 Punkte. Falls Sie Blatt_1 bereits bewerten konnten, können Sie diesen Hinweis ignorieren. Vielen Dank für Ihr Verständnis.**

## Architektur/Übersicht

Eine gute Übersicht, für ein schnelles Verständnis der aktuellen Umsetzung zeigen die UML-Diagramme; (PlantUML: https://www.plantuml.com):

- [Drawing App – A rough overview of the most important relationships](../wiki/current-architecture.wsd)
- [Canvas Server Interaction](../wiki/canvas-sequence.wsd)
- [App Distribution](../wiki/distribution.wsd)
- [Use Cases](../wiki/use-case.wsd)

## Projekt starten

**Zum Starten des Projektes wird `NodeJS 16.16.0+`, `Docker 23.0.0+`, `GNU Linux` (z.B. Ubuntu), die Utility `dos2unix` und zwei Web-Browser (FireFox 114.0.2+, Chromium 115.0.5790.110+) benötigt:**

1. **Skript-Berechtigung einstellen: `sudo chmod 777 ./scripts/*`**
2. **Skript-Format konvertieren: `dos2unix ./scripts/*`** (ggf. zuvor `sudo apt install dos2unix` ausführen)
3. **App starten via: `npm run start`**
4. **App in Web-Browser (Private Mode) öffnen: `http://127.0.0.1:8080`**
5. **Zum Testen 1x Chromium und 1x Firefox öffnen, um ein Multi-User-Szenario zu simuliert**

### Warum zwei Web-Browser?

Die Web-App nutzt den LocalStorage um den User zu speichern. Um zu verhindern, dass der LocalStorage zwischen den Fenstern geteilt wird, ist es am einfachsten zwei unterschiedliche Web-Brower zu nutzen. Das Ziel ist, dass wir zwei unterschiedliche User haben.

## Getroffene Entscheidungen

- [Technische Entscheidungen](./entscheidungen.md)

## UI Design

- [Interface Design](../wiki/ui-design.png)
