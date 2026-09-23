#!/bin/sh
set -eu

ROOT_DIR=/app
ENV_FILE="$ROOT_DIR/env.js"

echo "Generating runtime environment config at $ENV_FILE"

{
  printf 'window.__ENV__ = {\n'
  env | grep '^VITE_' | while IFS='=' read -r key value; do
    escaped_value=$(printf '%s' "$value" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
    printf '  "%s": "%s",\n' "$key" "$escaped_value"
  done
  printf '};\n'
} > "$ENV_FILE"
