-- 1. Adicionar super_admin ao enum app_role
ALTER TYPE app_role ADD VALUE 'super_admin' BEFORE 'admin';

-- 2. Criar extensão pg_trgm para similaridade de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;