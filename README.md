# Chatly Premium

Modernisiertes, Discord-inspiriertes privates Chat-Projekt.

## Voraussetzungen
- Node.js 18 oder neuer
- npm

## Installation
1. Im Projektordner `npm install` ausführen.
2. `.env.example` in `.env` umbenennen.
3. In `.env` einen eigenen zufälligen `SESSION_SECRET` mit mindestens 32 Zeichen und einen privaten `INVITE_CODE` mit mindestens 8 Zeichen setzen.
4. `npm start` ausführen.
5. Im Browser `http://localhost:3000` öffnen.

## Hinweise
- Registrierung ist nur mit dem selbst gesetzten Einladungscode möglich.
- Nachrichten werden lokal in `chatly.db` gespeichert.
- Online-Mitglieder werden live über Socket.IO angezeigt.
- Für den öffentlichen Betrieb HTTPS aktivieren und `NODE_ENV=production` setzen.
- Sprachkanäle, Direktnachrichten, Rollen, Datei-Uploads und mehrere Server sind in dieser Version noch nicht implementiert.
