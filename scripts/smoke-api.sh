#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:8080/api}"

echo "→ Health $BASE/health"
curl -sf "$BASE/health" | grep -q '"ok":true'

echo "→ Login admin"
TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@sirius.studio","password":"Admin2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "→ Workspace state"
curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d.get('projects',[]))>0, 'no projects'; print('projects', len(d['projects']), 'quotes', len(d.get('quotes',[])))"

echo "→ Messages projects"
curl -sf "$BASE/messages/projects" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d.get('projects',[]))>0, 'no sql projects'; print('sql projects', len(d['projects']))"

echo "OK — smoke test passed"
