#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE vrroom;
    CREATE DATABASE keycloak;
    GRANT ALL PRIVILEGES ON DATABASE vrroom TO vrroom;
    GRANT ALL PRIVILEGES ON DATABASE keycloak TO vrroom;
EOSQL

echo "✅ Databases created: vrroom, keycloak"
