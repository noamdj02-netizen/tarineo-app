#!/usr/bin/env bash
# Lab local uniquement — ne pas utiliser avec --linked / prod (qnsalgbohdqetbporlcd).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== reset sans migration RLS =="
supabase db reset --version 20261006140000 --no-seed --yes || {
  echo "WARN: reset a affiché une erreur (souvent 502 au restart). Vérifiez: supabase status"
}

echo "== advisors BEFORE =="
supabase db advisors --type security --local

echo "== migration RLS =="
supabase migration up --local --yes

echo "== advisors AFTER =="
supabase db advisors --type security --local

echo "== versions =="
supabase db query --local "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 2;"
