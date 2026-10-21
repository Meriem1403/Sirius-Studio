# Développement local

## Mode Docker (port **8080**) — votre cas

Tout tourne dans Docker : site + API + PostgreSQL.

```bash
cd chemin/vers/Sirius
git pull
docker compose up -d --build
```

- **Site** : [http://localhost:8080](http://localhost:8080)
- **API** (via nginx) : [http://localhost:8080/api/health](http://localhost:8080/api/health)

Le front est **compilé dans l’image `web`** avec `VITE_API_BASE_URL=/api`. Nginx envoie `/api/*` vers le conteneur `api` (voir `nginx.conf`).

**Important :** après chaque `git pull`, il faut **`--build`** pour reconstruire le front et l’API. Un simple `docker compose up -d` **ne met pas à jour** le JavaScript → vous voyez l’ancienne version.

```bash
npm run dev:docker
# équivalent à : docker compose up -d --build
```

Test automatique du parcours client via le port 8080 :

```bash
npm run test:client-journey:docker
```

Comptes seed (si `SEED_ON_START=true`) :

| Email | Mot de passe |
|-------|----------------|
| admin@sirius.studio | Admin2026! |
| marie@demo.sirius | Demo2026! |

**Nouveau client** (inscription) : pas de projet au départ → redirection **Nouvelle demande** → puis Mes projets / Messages.

**Marie (démo)** : projets déjà en base → pas l’écran « nouvelle demande » au login ; c’est normal.

### Cache navigateur

Si le contact affiche encore l’ancien formulaire après un rebuild : **Cmd+Shift+R** (rechargement forcé) ou fenêtre privée.

---

## Mode Vite seul (port **5173**) — optionnel

Pour le hot-reload sans rebuild Docker :

```bash
docker compose up -d db api    # API sur localhost:3001
npm run dev                    # .env.development → proxy /api
```

Ouvrir **http://localhost:5173**

---

## Dépannage

| Symptôme | Action |
|----------|--------|
| Pas de changement UI sur **8080** | `docker compose up -d --build web` (ou tout le stack) |
| Login / inscription échoue | `docker compose logs api` — BDD prête ? |
| 502 sur `/api` | `docker compose ps` — conteneur `api` up ? |
