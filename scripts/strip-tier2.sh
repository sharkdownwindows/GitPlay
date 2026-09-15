#!/usr/bin/env bash
set -euo pipefail
rm -rf src/sync server
sed -i '/TIER2-START/,/TIER2-END/d' src/app/bootstrap.ts
npm run build
