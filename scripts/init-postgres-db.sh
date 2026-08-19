#!/bin/bash
set -e

# Create assistant_db database if it does not already exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE assistant_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assistant_db')\gexec
EOSQL
