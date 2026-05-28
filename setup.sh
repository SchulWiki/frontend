#!/usr/bin/env bash
set -euo pipefail

# ─── Colours ───────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }
die()  { echo -e "${RED}✖ $*${NC}" >&2; exit 1; }

echo ""
echo "  SchulWiki Frontend — Setup"
echo "────────────────────────────"

# ─── Node.js check ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  die "Node.js not found. Install Node.js 20+ from https://nodejs.org"
fi

NODE_VERSION=$(node -e "process.exit(+process.versions.node.split('.')[0])")
if [ $? -ne 0 ]; then
  NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
  if [ "$NODE_MAJOR" -lt 20 ]; then
    die "Node.js 20+ required (found $(node -v)). Upgrade at https://nodejs.org"
  fi
fi
ok "Node.js $(node -v)"

# ─── npm check ─────────────────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  die "npm not found. It ships with Node.js — reinstall Node from https://nodejs.org"
fi
ok "npm $(npm -v)"

# ─── Install dependencies ──────────────────────────────────────────────────
echo ""
echo "Installing dependencies…"
npm install
ok "Dependencies installed"

# ─── .env.local ────────────────────────────────────────────────────────────
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  warn ".env.local created from .env.example — set VITE_API_BASE_URL if needed"
else
  ok ".env.local already exists"
fi

# ─── Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "  Start dev server:    npm run dev"
echo "  Run tests:           npm test"
echo "  Type-check:          npm run typecheck"
echo "  Production build:    npm run build"
echo ""
