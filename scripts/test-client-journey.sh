#!/usr/bin/env bash
# Parcours client API local : login → workspace → demande
set -euo pipefail
# Docker 8080 : http://localhost:8080/api  |  API seule : http://localhost:3001
BASE="${1:-http://localhost:3001}"
BASE="${BASE%/}"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"ok":true'

echo "→ Register test client"
EMAIL="test-client-$(date +%s)@sirius.local"
REG=$(curl -sf -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Test Client\",\"email\":\"$EMAIL\",\"password\":\"TestClient2026!\",\"projectRequest\":{\"title\":\"Projet test local\",\"type\":\"Site vitrine\",\"situation\":\"idea\",\"needs\":[\"Site vitrine\"],\"message\":\"Message de test parcours client minimum dix caractères.\"}}")
TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
PROJECT_ID=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('projectId',''))")

echo "→ Inscription + demande maquette (1 projet attendu)"
curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d.get('projects',[]))==1; print('  projet', d['projects'][0]['id'])"
test -n "$PROJECT_ID" && echo "  projectId API OK"

echo "OK — parcours client API"
