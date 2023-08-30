# @drawing-app/server

## Api

- `GET http://localhost:8080/api/canvas`: Liste aller Zeichenflächen erhalten
- `POST http://localhost:8080/api/canvas`: Neue Zeichenfläche erstellen
- `GET ws://localhost:8080/api/canvas/channel?userId`: Mit Zeichenflächen über Websocket-Verbindung interagieren
- `GET http://localhost:8080/*`: Client WebApp

## Abhängigkeiten

- [@drawing-app/shared](../shared/README.md)
- [@drawing-app/client](../client/README.md)
- [Datenbank](./docker/docker-compose.yml)

## Development

- Datenbank starten: `docker compose up`
- Server starten: `npm run dev`
