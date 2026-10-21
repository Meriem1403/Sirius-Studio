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

## Phase 3 — Resend (e-mails) — **obligatoire pour une vraie prod**

Sans cette étape, **aucun mail n’arrive dans votre boîte** (tout reste dans les logs Docker `api`).

1. Compte [resend.com](https://resend.com)
2. Vérifier ton **domaine** (SPF/DKIM dans DNS) — ou utiliser le domaine de test Resend en dev uniquement
3. Créer une **API key** → `RESEND_API_KEY` dans `.env.production` sur Hetzner
4. `ADMIN_NOTIFY_EMAIL` = **votre Gmail / boîte pro** (vous recevez : contact site, nouvelles demandes client, messages)
5. `MAIL_FROM` = adresse **sur le domaine vérifié** chez Resend (ex. `Sirius Studio <contact@votredomaine.fr>`)

Vérifier après deploy :

```bash
curl -s https://VOTRE-API/health | grep resend
# doit afficher "email":"resend" et non "simulated"
```

## Phase 3b — Connexion Google / GitHub / Microsoft

1. **Google Cloud Console** → OAuth client **Web**
   - Authorized redirect URI : `https://VOTRE-API/auth/oauth/google/callback`
2. Sur Hetzner `.env.production` :
   - `OAUTH_REDIRECT_BASE=https://VOTRE-API` (même host que l’API, sans slash)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
3. Même principe pour GitHub / Microsoft (redirect `/auth/oauth/github/callback`, etc.)
4. **Apple** : compte Apple Developer + Service ID (configuration serveur `APPLE_*`) — bouton actif quand les variables sont présentes.

Après deploy : les boutons Google/GitHub/Microsoft sur **Inscription** et **Connexion** redirigent vers le fournisseur, puis vers `/auth/callback` sur Netlify avec session ouverte → **formulaire de demande** si aucun projet.

### Qui reçoit quoi

| Événement | Destinataire |
|-----------|----------------|
| Formulaire contact (accueil) | Admin + accusé réception au visiteur |
| Inscription client (+ demande optionnelle) | Bienvenue client + admin si demande |
| Demande depuis l’espace client (`/nouvelle-demande`) | Admin + confirmation client |
| Message client → admin | Admin |
| Réponse admin → client | Client |

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
- [ ] `VITE_API_BASE_URL` défini (sinon mode démo localStorage)
- [ ] `/health` → `"email":"resend"`
- [ ] Inscription `/inscription` avec demande → projet visible client + admin
- [ ] Espace client → **Nouvelle demande** → projet + email admin
- [ ] Formulaire contact → prospect admin + mails admin/client
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
