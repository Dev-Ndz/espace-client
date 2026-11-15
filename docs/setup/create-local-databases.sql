-- Creates the local PostgreSQL role and databases for development and tests.
-- Run once, as the `postgres` superuser, on the PostgreSQL 18 server (port 5433 on the owner's machine):
--   psql -h localhost -p 5433 -U postgres -f docs/setup/create-local-databases.sql
-- With pgAdmin instead: turn on "Auto commit?" in the Query Tool and run the statements one at a time,
-- otherwise CREATE DATABASE fails ("cannot run inside a transaction block").
-- The password is a development value only: never reuse it anywhere else.
-- Both databases use the ICU French collation, so text sorts the same way on Windows and on Linux (production).

-- CREATEDB: `prisma migrate dev` creates a temporary shadow database.
CREATE ROLE espace_client LOGIN PASSWORD 'espace_client' CREATEDB;

CREATE DATABASE espace_client
  OWNER espace_client
  TEMPLATE template0
  LOCALE_PROVIDER icu
  ICU_LOCALE 'fr-FR';

CREATE DATABASE espace_client_test
  OWNER espace_client
  TEMPLATE template0
  LOCALE_PROVIDER icu
  ICU_LOCALE 'fr-FR';
