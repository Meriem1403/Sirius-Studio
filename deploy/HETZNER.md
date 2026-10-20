# Hetzner — déploiement Sirius (API + BDD)

Front déjà sur **Netlify**. Ce serveur ne sert que l’**API** et **PostgreSQL**.

---

## A. Créer le serveur (console Hetzner)

1. **Cloud** → **Add Server**
2. **Ubuntu 24.04**, type **CX22** (2 vCPU, 4 Go) ou **CAX11**
3. **SSH key** : ajoute ta clé publique (`cat ~/.ssh/id_ed25519.pub`)
4. Créer → noter l’**IP publique**

---

## B. DNS

Chez ton registrar (OVH, Netlify DNS, etc.) :

| Type | Nom | Valeur |
|------|-----|--------|
| A | `api` | **IP du VPS** |

Exemple : `api.tondomaine.fr` → `95.xxx.xxx.xxx`

Attendre 5–30 min la propagation.

---

## C. Connexion SSH

```bash
ssh root@IP_DU_VPS
```

---

## D. Installer Docker (sur le VPS)

```bash
apt-get update && apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

---

## E. Pare-feu

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## F. Cloner le projet

```bash
mkdir -p /opt/sirius && cd /opt/sirius
git clone URL_DE_TON_REPO.git .
```

(Remplace par l’URL GitHub/GitLab. Si repo privé : deploy key ou token.)

---

## G. Fichier `.env.production`

```bash
cp .env.production.example .env.production
nano .env.production
```

Remplis **exactement** (exemple) :

```env
API_DOMAIN=api.tondomaine.fr

POSTGRES_USER=sirius
POSTGRES_PASSWORD=mettre-un-mot-de-passe-long
POSTGRES_DB=sirius

JWT_SECRET=mettre-au-moins-32-caracteres-aleatoires
ADMIN_NOTIFY_EMAIL=ton@gmail.com
RESEND_API_KEY=
MAIL_FROM=Sirius Studio <contact@tondomaine.fr>

PUBLIC_APP_URL=https://ton-site.netlify.app
CORS_ORIGIN=https://ton-site.netlify.app

SEED_ON_START=true
```

**Important :** `PUBLIC_APP_URL` et `CORS_ORIGIN` = **la même URL** que ton site Netlify (domaine custom ou `xxx.netlify.app`).

**Netlify** doit avoir : `VITE_API_BASE_URL=https://api.tondomaine.fr` (sans `/api` à la fin).

---

## H. Lancer

```bash
cd /opt/sirius
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

Tu dois voir : `[seed] Workspace complet chargé` (si 1er deploy) puis `[sirius-api]`.

---

## I. Test depuis ton Mac

```bash
cd chemin/vers/Sirius
./scripts/smoke-api.sh https://api.tondomaine.fr
```

Puis ouvre ton site Netlify → connexion `admin@sirius.studio` / `Admin2026!`

---

## J. Après validation

Sur le VPS :

```bash
nano .env.production   # SEED_ON_START=false
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## Mise à jour (nouveau code)

```bash
cd /opt/sirius
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## Dépannage

| Problème | Piste |
|----------|--------|
| CORS / login impossible | `CORS_ORIGIN` doit matcher **exactement** l’URL Netlify (https, sans slash final) |
| Certificat HTTPS | DNS `api` doit pointer vers le VPS ; attendre ; `docker compose logs caddy` |
| 502 | `docker compose logs api` — BDD pas prête ? |
| Front vide après login | `VITE_API_BASE_URL` sur Netlify + **redeploy** Netlify |
