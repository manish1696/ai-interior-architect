#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")" && pwd)"
cd "$project_dir"

if [ ! -d backend/.venv ]; then
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

if [ ! -f .env.local ]; then
  printf 'NEXT_PUBLIC_API_URL=http://localhost:8000\n' > .env.local
fi

(cd backend && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000) &
backend_pid=$!
trap 'kill "$backend_pid" 2>/dev/null || true' EXIT

npm run dev
