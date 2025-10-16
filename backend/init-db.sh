#!/bin/sh
set -e

echo "🚀 Running init-db.sh ..."

# Create 'keycloak' DB if missing
if ! psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='keycloak'" | grep -q 1; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "CREATE DATABASE keycloak"
  echo "✅ Created database: keycloak"
else
  echo "ℹ️  Database 'keycloak' already exists"
fi

# 'vrroom' usually exists by default (POSTGRES_DB falls back to POSTGRES_USER), but grant anyway if it does
if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='vrroom'" | grep -q 1; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE vrroom TO $POSTGRES_USER"
fi

# Ensure grants on keycloak DB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE keycloak TO $POSTGRES_USER"

echo "✅ Databases ensured and privileges granted"
