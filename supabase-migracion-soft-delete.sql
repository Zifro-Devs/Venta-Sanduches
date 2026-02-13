-- =============================================================================
-- MIGRACIÓN: Soft delete para universidades y vendedores
-- Ejecutar en Supabase SQL Editor si las tablas ya existen sin deleted_at.
-- Las ventas siguen con delete físico (sin soft delete).
-- =============================================================================

-- 1. Agregar columna deleted_at a universidades
ALTER TABLE universidades ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Agregar columna deleted_at a vendedores
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Política UPDATE en universidades (para marcar deleted_at)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'universidades' AND policyname = 'Actualizar universidades'
  ) THEN
    CREATE POLICY "Actualizar universidades" ON universidades FOR UPDATE USING (true);
  END IF;
END $$;
