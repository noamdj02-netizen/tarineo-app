#!/usr/bin/env bash
# Test du serveur MCP Navpit.
# Usage : NAVPIT_URL=https://navpit.com NAVPIT_KEY=npk_... bash test-mcp.sh
set -u
URL="${NAVPIT_URL:-https://navpit.com}/api/mcp"
KEY="${NAVPIT_KEY:?Définis NAVPIT_KEY=npk_...}"
H=(-H "content-type: application/json" -H "accept: application/json, text/event-stream" -H "mcp-protocol-version: 2025-06-18")
pass=0; fail=0
check() { if echo "$2" | grep -q "$3"; then echo "✅ $1"; pass=$((pass+1)); else echo "❌ $1"; echo "   → $2" | head -c 400; echo; fail=$((fail+1)); fi; }

r=$(curl -s -o /dev/null -w "%{http_code}" "${H[@]}" -X POST "$URL" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')
check "Sans clé → 401" "$r" "401"

r=$(curl -s "${H[@]}" -H "authorization: Bearer $KEY" -X POST "$URL" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}')
check "Initialize" "$r" '"name":"navpit"'

r=$(curl -s "${H[@]}" -H "authorization: Bearer $KEY" -X POST "$URL" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}')
check "9 tools exposés" "$(echo "$r" | grep -o '"name":"[a-z_]*"' | wc -l | tr -d ' ')" "^9$"

r=$(curl -s "${H[@]}" -H "authorization: Bearer $KEY" -X POST "$URL" -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_focus","arguments":{}}}')
check "get_focus répond" "$r" '"result"'

echo; echo "$pass OK, $fail KO"
