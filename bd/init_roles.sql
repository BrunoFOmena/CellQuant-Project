-- Opcional: criar role/banco manualmente no psql como postgres
-- Preferira usar: .\setup_windows.ps1

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lcr') THEN
    CREATE ROLE lcr LOGIN PASSWORD 'lcr123';
  END IF;
END
$$;

-- Depois, no psql:
-- CREATE DATABASE contador_lcr OWNER lcr;
-- \c contador_lcr
-- \i schema.sql
-- \i seed.sql
