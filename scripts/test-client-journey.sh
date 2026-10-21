#!/usr/bin/env bash
# Parcours client API local : login → workspace → demande
set -euo pipefail
BASE="${1:-http://localhost:3001}"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"ok":true'

echo "→ Register test client"
EMAIL="test-client-$(date +%s)@sirius.local"
REG=$(curl -sf -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Test Client\",\"email\":\"$EMAIL\",\"password\":\"TestClient2026!\"}")
TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "→ Workspace (0 projet attendu)"
COUNT=$(curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('projects',[])))")
test "$COUNT" = "0" && echo "  OK aucun projet"

echo "→ Déposer une demande"
curl -sf -X POST "$BASE/requests" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Projet test local","type":"Site vitrine","message":"Message de test parcours client minimum dix caractères."}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('projectId'); print('  projet', d['projectId'])"

echo "→ Workspace (1 projet)"
curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d.get('projects',[]))==1; print('  OK')"

echo "OK — parcours client API"
