# Mise en production — Sirius Studio

**Guide pas à pas (Netlify + Hetzner + Resend) : voir [PRODUCTION.md](./PRODUCTION.md).**

## Architecture

| Composant | Rôle |
|-----------|------|
| **web** (nginx) | Site React + proxy `/api` |
| **api** (Node/Hono) | Auth JWT, contact, messages, prospects, emails |
| **db** (PostgreSQL) | Données persistées |

Sans `VITE_API_BASE_URL`, le front reste en **mode démo** (localStorage).

## Docker (recommandé VPS / local prod)

1. Copiez `.env.example` vers `.env` et renseignez au minimum :
   - `JWT_SECRET`
   - `ADMIN_NOTIFY_EMAIL` (destinataire des demandes contact)
   - `RESEND_API_KEY` (emails réels — [resend.com](https://resend.com))
   - `MAIL_FROM` (domaine vérifié chez Resend)
   - `PUBLIC_APP_URL` (URL publique du site)

2. Lancez :

```bash
docker compose up -d --build
```

3. Site : http://localhost:8080

Comptes seed (si base vide) : `admin@sirius.studio` / `Admin2026!`, `marie@demo.sirius` / `Demo2026!`

## Netlify (front) + API hébergée ailleurs

1. Déployez l’API + PostgreSQL (Railway, Render, Fly.io, VPS Docker).
2. Sur Netlify, variable de build : `VITE_API_BASE_URL=https://api.votredomaine.com`
3. Configurez `CORS_ORIGIN` sur l’API avec l’URL Netlify.
4. Les routes API doivent être préfixées comme le front (`/auth/login`, `/contact`, etc.).

## Emails

Sans `RESEND_API_KEY`, les emails sont **simulés** (logs du conteneur `api`).

Avec Resend :
- Demande contact → email à `ADMIN_NOTIFY_EMAIL`
- Réponse admin dans Messages → email au client

## Netlify + Hetzner (API seule)

1. Hetzner : Docker avec services **`db` + `api`** (sans `web`).
2. HTTPS sur `api.tondomaine.fr` (Caddy).
3. Netlify : `VITE_API_BASE_URL=https://api.tondomaine.fr`
4. API : `CORS_ORIGIN=https://votre-site.netlify.app`, `SEED_ON_START=false` après la première init.

## Mode API (données)

Avec `VITE_API_BASE_URL`, auth, contact, messages, prospects et workspace (projets, facturation, agenda, documents…) passent par PostgreSQL. Tester un parcours complet avant la mise en prod.
