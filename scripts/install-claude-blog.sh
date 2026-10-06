#!/usr/bin/env bash
# Installe claude-blog (MIT) pour Cursor + Claude Code sur cette machine.
# Source: https://github.com/AgriciDaniel/claude-blog
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="${ROOT}/vendor/claude-blog"
REF="${CLAUDE_BLOG_REF:-v2.2.0}"
REPO_URL="${CLAUDE_BLOG_URL:-https://github.com/AgriciDaniel/claude-blog.git}"
CURSOR_SKILLS="${ROOT}/.cursor/skills"
TARINEO_SKILL_SRC="${ROOT}/docs/claude-blog/tarineo-blog-SKILL.md"

echo "→ claude-blog pour Tarineo (ref: ${REF})"

if [ ! -d "${VENDOR}/skills/blog" ]; then
  echo "→ Clone dans vendor/claude-blog..."
  mkdir -p "${ROOT}/vendor"
  if [ -d "${VENDOR}/.git" ]; then
    git -C "${VENDOR}" fetch --depth 1 origin "refs/tags/${REF}" 2>/dev/null || git -C "${VENDOR}" fetch --depth 1 origin main
    git -C "${VENDOR}" checkout --detach "${REF}" 2>/dev/null || git -C "${VENDOR}" checkout --detach FETCH_HEAD
  else
    rm -rf "${VENDOR}"
    git clone --depth 1 --branch "${REF}" "${REPO_URL}" "${VENDOR}" 2>/dev/null || {
      git clone --depth 1 "${REPO_URL}" "${VENDOR}"
      git -C "${VENDOR}" checkout --detach "${REF}" 2>/dev/null || true
    }
  fi
fi

echo "→ Install Claude Code (~/.claude/skills, agents, scripts)..."
chmod +x "${VENDOR}/install.sh"
CLAUDE_BLOG_REF="${REF}" bash "${VENDOR}/install.sh"

echo "→ Sync skills blog-* vers .cursor/skills/..."
mkdir -p "${CURSOR_SKILLS}"
for skill_dir in "${VENDOR}"/skills/*/; do
  name="$(basename "${skill_dir}")"
  case "${name}" in
    blog|blog-*)
      dest="${CURSOR_SKILLS}/${name}"
      mkdir -p "${dest}"
      cp "${skill_dir}SKILL.md" "${dest}/SKILL.md"
      for sub in references scripts assets templates data; do
        if [ -d "${skill_dir}${sub}" ]; then
          mkdir -p "${dest}/${sub}"
          cp -R "${skill_dir}${sub}/." "${dest}/${sub}/" 2>/dev/null || true
        fi
      done
      echo "  + ${name}"
      ;;
  esac
done

if [ -f "${TARINEO_SKILL_SRC}" ]; then
  mkdir -p "${CURSOR_SKILLS}/tarineo-blog"
  cp "${TARINEO_SKILL_SRC}" "${CURSOR_SKILLS}/tarineo-blog/SKILL.md"
  echo "  + tarineo-blog (overlay Tarineo)"
fi

echo ""
echo "OK. Redémarre Cursor si besoin."
echo "Dans le chat: demande un article blog ou « utilise tarineo-blog »."
echo "Marque / voix: ${ROOT}/branding/BRAND.md et VOICE.md"
