# SchulWiki — Frontend

React + TypeScript + Vite frontend for the SchulWiki platform.

## Voraussetzungen

- [Node.js](https://nodejs.org) **20 oder höher**
- Backend läuft lokal auf `http://localhost:8080` (oder angepasste URL in `.env.local`)

## Setup

```bash
# Linux / macOS
chmod +x setup.sh && ./setup.sh

# Windows (PowerShell)
npm install
copy .env.example .env.local   # dann VITE_API_BASE_URL anpassen
```

Das Script installiert alle Abhängigkeiten und legt `.env.local` aus `.env.example` an.

## Starten

```bash
npm run dev        # Entwicklungsserver → http://localhost:5173
npm run build      # Produktions-Build
npm run preview    # Build lokal vorschauen
```

## Tests & Qualität

```bash
npm test               # Tests im Watch-Modus
npx vitest run         # Tests einmalig ausführen
npm run typecheck      # TypeScript-Prüfung
npm run lint           # ESLint
npm run test:coverage  # Testabdeckung
```

## Umgebungsvariablen

| Variable            | Standard                  | Beschreibung              |
|---------------------|---------------------------|---------------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080`   | URL des Backend-Servers   |

Lokale Überschreibungen in `.env.local` (wird nicht eingecheckt).

## Projektstruktur

```
src/
├── components/        # Wiederverwendbare UI-Komponenten (shadcn/ui + Layout)
├── features/
│   ├── auth/          # AuthContext, AuthProvider, useAuth, authApi
│   ├── admin/         # adminApi (Benutzerverwaltung)
│   └── wiki/          # wikiApi, useRole, WikiEntry-Komponenten
├── lib/               # axiosInstance, tokenStore, Fingerprint
├── pages/             # Seitenkomponenten (eine pro Route)
└── router/            # AppRouter, ROUTES-Konstanten
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) läuft bei jedem Push und Pull Request:
TypeScript-Prüfung → Tests (Vitest).
