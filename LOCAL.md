# Développement local (testé)

## 1. Démarrer l’API + la base

```bash
docker compose up -d db api
```

L’API écoute sur **http://localhost:3001** (port exposé dans `docker-compose.yml`).

## 2. Démarrer le front

```bash
npm run dev
```

Le fichier **`.env.development`** active `VITE_API_BASE_URL=/api` : Vite proxy vers l’API (voir `vite.config.ts`).

Ouvrir **http://localhost:5173**

## 3. Parcours client à vérifier

1. Accueil → section **Contact** : boutons compte (plus de formulaire public).
2. **Inscription** → redirection **Nouvelle demande** (si aucun projet).
3. Envoyer la demande → projet visible dans **Mes projets**.
4. **Messages** : composer sur un projet.
5. Compte démo seed : `marie@demo.sirius` / `Demo2026!` (projets déjà présents → pas d’étape demande).

## 4. Test automatique API

```bash
npm run test:client-journey
```

## Dépannage

| Symptôme | Cause |
|----------|--------|
| Ancien formulaire contact | Redémarrer `npm run dev` après `git pull` |
| Login / inscription échoue | API arrêtée → `docker compose up -d db api` |
| Mode démo localStorage | Supprimer `.env.development` ou mettre `VITE_API_BASE_URL=` vide (non recommandé) |
