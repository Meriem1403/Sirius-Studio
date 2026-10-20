# Mise en production Sirius — plan Netlify + Hetzner

## Architecture

| Composant | Hébergeur |
|-----------|-----------|
| Front React | **Netlify** (déjà) |
| API Hono + Postgres | **Hetzner Cloud VPS** |
| E-mails transactionnels | **Resend** (gratuit au début) |

---

## Phase 1 — Préparer (local)

- [ ] `npm run build` et `cd server && npm run build` OK
- [ ] Docker local : `docker compose up -d --build`
- [ ] `./scripts/smoke-api.sh http://localhost:8080/api`
- [ ] Parcours manuel : login admin/client, projet, message, contact, facturation

---

## Phase 2 — Netlify

1. **Site settings → Environment variables** (build) :
   - `VITE_API_BASE_URL` = `https://api.votredomaine.fr` (URL de l’API, **sans** slash final)

2. **Deploy** → rebuild du site.

3. Domaine custom Netlify (optionnel) : noter l’URL pour `PUBLIC_APP_URL` et `CORS_ORIGIN`.

---

## Phase 3 — Resend (e-mails)

1. Compte [resend.com](https://resend.com)
2. Vérifier ton **domaine** (SPF/DKIM dans DNS)
3. Créer une **API key**
4. `ADMIN_NOTIFY_EMAIL` = ton **Gmail** (tu reçois contact + messages clients)
5. `MAIL_FROM` = adresse sur ton domaine vérifié chez Resend

Sans `RESEND_API_KEY` : l’app marche, les mails sont simulés dans les logs API.

---

## Phase 4 — Hetzner VPS

**Guide détaillé copier-coller : [deploy/HETZNER.md](./deploy/HETZNER.md)**

Résumé :

1. VPS **CX22**, Ubuntu 24.04, clé SSH
2. DNS **A** `api` → IP du VPS
3. Docker + clone repo + `.env.production`
4. `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build`
5. `./scripts/smoke-api.sh https://api.tondomaine.fr` (pas de `/api` dans l’URL)

8. Quand les données démo sont OK : mettre `SEED_ON_START=false` dans `.env.production` et `docker compose -f docker-compose.prod.yml --env-file .env.production up -d`

---

## Phase 5 — Validation prod

- [ ] Site Netlify → connexion admin
- [ ] Projets / facturation / agenda visibles
- [ ] Formulaire contact → prospect admin + mail Gmail (si Resend)
- [ ] Message client → mail admin ; réponse admin → mail client
- [ ] `SEED_ON_START=false` après init

---

## Sauvegardes (recommandé)

```bash
docker exec $(docker ps -qf name=db) pg_dump -U sirius sirius > backup-$(date +%F).sql
```

Planifier une copie hebdomadaire (cron) vers un stockage externe.

---

## Comptes démo (seed)

| Email | Mot de passe |
|-------|----------------|
| admin@sirius.studio | Admin2026! |
| marie@demo.sirius | Demo2026! |
| thomas@demo.sirius | Demo2026! |

**Changer les mots de passe** avant une vraie prod client (ou ne pas seed).
