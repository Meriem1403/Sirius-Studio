#!/usr/bin/env bash
# Vérifie login, lecture workspace et persistance facturation (PUT quotes).
set -euo pipefail

BASE="${1:-http://localhost:8080}"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"ok":true'

echo "→ Login admin"
TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@sirius.studio","password":"Admin2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

STATE=$(curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN")
QUOTE_ID=$(echo "$STATE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
qs = d.get('quotes') or []
if not qs:
    raise SystemExit('no quotes in workspace')
print(qs[0]['id'])
")

echo "→ PUT quotes (patch first line label)"
python3 <<PY | curl -sf -X PUT "$BASE/workspace/quotes" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d @- | python3 -c "import sys,json; d=json.load(sys.stdin); q=[x for x in d['quotes'] if x['id']=='$QUOTE_ID'][0]; assert 'smoke-test' in q['lines'][0]['label']; print('quote saved', q['number'])"
import json, os
state = json.loads('''$STATE''')
quotes = state['quotes']
for q in quotes:
    if q['id'] == '$QUOTE_ID':
        q['lines'][0]['label'] = q['lines'][0]['label'] + ' [smoke-test]'
        break
print(json.dumps(quotes))
PY

echo "→ Re-fetch state"
curl -sf "$BASE/workspace/state" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); q=[x for x in d['quotes'] if x['id']=='$QUOTE_ID'][0]; assert 'smoke-test' in q['lines'][0]['label']; print('persist OK')"

echo "OK — workspace mutations passed"
