-- =============================================================================
-- MIGRACIÓN: Modelo relacional (vendedores como tabla, ventas con FK)
-- Ejecutar en Supabase SQL Editor después de tener datos existentes o en DB nueva.
-- =============================================================================

-- 1. UNIVERSIDADES (si no existen)
CREATE TABLE IF NOT EXISTS universidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO universidades (nombre) VALUES
  ('U Nacional'),
  ('UdeA'),
  ('EAFIT')
ON CONFLICT (nombre) DO NOTHING;

-- 2. TABLA VENDEDORES
CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE RESTRICT,
  telefono TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nombre)
);

CREATE INDEX IF NOT EXISTS idx_vendedores_universidad ON vendedores(universidad_id);
CREATE INDEX IF NOT EXISTS idx_vendedores_nombre ON vendedores(nombre);

-- 3. Agregar vendedor_id a ventas (nullable primero para migrar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas' AND column_name = 'vendedor_id'
  ) THEN
    ALTER TABLE ventas ADD COLUMN vendedor_id UUID REFERENCES vendedores(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 4. Migrar vendedores desde configuracion a tabla vendedores (solo si hay datos en config)
DO $$
DECLARE
  rec RECORD;
  univ_id UUID;
  nombres TEXT[];
  detalle JSONB;
  nom TEXT;
BEGIN
  -- Obtener universidad por defecto (U Nacional)
  SELECT id INTO univ_id FROM universidades WHERE nombre = 'U Nacional' LIMIT 1;
  IF univ_id IS NULL THEN
    RETURN;
  END IF;

  -- Si existe configuracion con vendedores, migrar
  SELECT c.vendedores, COALESCE(c.vendedores_detalle, '{}'::jsonb)
    INTO nombres, detalle
    FROM configuracion c
    LIMIT 1;

  IF nombres IS NOT NULL AND array_length(nombres, 1) > 0 THEN
    FOREACH nom IN ARRAY nombres
    LOOP
      INSERT INTO vendedores (nombre, universidad_id, telefono)
      SELECT
        nom,
        univ_id,
        COALESCE(detalle->nom->>'telefono', '')
      WHERE NOT EXISTS (SELECT 1 FROM vendedores WHERE nombre = nom)
      ON CONFLICT (nombre) DO NOTHING;

      -- Actualizar universidad si estaba en detalle
      IF detalle->nom->>'universidad' IS NOT NULL THEN
        SELECT id INTO univ_id FROM universidades WHERE nombre = (detalle->nom->>'universidad') LIMIT 1;
        IF univ_id IS NOT NULL THEN
          UPDATE vendedores SET universidad_id = univ_id, updated_at = NOW() WHERE vendedores.nombre = nom;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Rellenar vendedor_id en ventas según nombre (vendedor)
  UPDATE ventas v
  SET vendedor_id = vend.id
  FROM vendedores vend
  WHERE vend.nombre = v.vendedor
    AND v.vendedor_id IS NULL;
END $$;

-- 5. Para ventas que queden sin vendedor_id (nombre que no existe en vendedores), crear vendedor
INSERT INTO vendedores (nombre, universidad_id, telefono)
SELECT DISTINCT v.vendedor, (SELECT id FROM universidades WHERE nombre = 'U Nacional' LIMIT 1), ''
FROM ventas v
WHERE v.vendedor_id IS NULL AND v.vendedor IS NOT NULL AND trim(v.vendedor) != ''
ON CONFLICT (nombre) DO NOTHING;

UPDATE ventas v
SET vendedor_id = vend.id
FROM vendedores vend
WHERE vend.nombre = v.vendedor AND v.vendedor_id IS NULL;

-- 5b. Si aún hay ventas con vendedor_id NULL, asignar un vendedor por defecto (evita fallo en paso 6)
UPDATE ventas
SET vendedor_id = (SELECT id FROM vendedores ORDER BY nombre LIMIT 1)
WHERE vendedor_id IS NULL;

-- 6. Hacer vendedor_id NOT NULL (opcional: eliminar columna vendedor después)
ALTER TABLE ventas ALTER COLUMN vendedor_id SET NOT NULL;
-- DROP INDEX IF EXISTS idx_ventas_vendedor;
-- ALTER TABLE ventas DROP COLUMN IF EXISTS vendedor;

-- 7. Nuevo índice para ventas por vendedor_id
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor_id ON ventas(vendedor_id);

-- 8. Quitar vendedores y vendedores_detalle de configuracion (opcional)
-- Descomenta si quieres eliminar esas columnas del modelo antiguo:
/*
ALTER TABLE configuracion DROP COLUMN IF EXISTS vendedores_detalle;
ALTER TABLE configuracion DROP COLUMN IF EXISTS vendedores;
*/

-- 9. RLS y políticas para vendedores
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de vendedores" ON vendedores;
CREATE POLICY "Permitir lectura pública de vendedores" ON vendedores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de vendedores" ON vendedores;
CREATE POLICY "Permitir inserción pública de vendedores" ON vendedores
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización pública de vendedores" ON vendedores;
CREATE POLICY "Permitir actualización pública de vendedores" ON vendedores
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de vendedores" ON vendedores;
CREATE POLICY "Permitir eliminación pública de vendedores" ON vendedores
  FOR DELETE USING (true);

-- 10. Si eliminaste la columna vendedor de ventas, asegura que la app use solo vendedor_id.
-- La aplicación leerá el nombre del vendedor haciendo JOIN con vendedores.
-- Si mantuviste la columna vendedor, puedes ir rellenándola con un trigger o dejarla para legacy.
