-- =============================================================================
-- SCHEMA RELACIONAL - Proyecto nuevo (sin datos previos)
-- Ejecutar en Supabase SQL Editor para crear todas las tablas desde cero.
-- =============================================================================

-- 1. UNIVERSIDADES
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

-- 2. VENDEDORES (relación con universidad)
CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE RESTRICT,
  telefono TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendedores_universidad ON vendedores(universidad_id);
CREATE INDEX IF NOT EXISTS idx_vendedores_nombre ON vendedores(nombre);

-- 3. CONFIGURACIÓN DEL NEGOCIO (sin vendedores; se gestionan en tabla vendedores)
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  precio_distribucion NUMERIC NOT NULL DEFAULT 6000,
  precio_vendedor_primeros_20 NUMERIC NOT NULL DEFAULT 7000,
  precio_vendedor_despues_20 NUMERIC NOT NULL DEFAULT 6500,
  umbral_descuento INTEGER NOT NULL DEFAULT 20,
  comision_miguel_por_unidad NUMERIC NOT NULL DEFAULT 1000,
  limite_comision_miguel INTEGER NOT NULL DEFAULT 20,
  comision_jeronimo_por_unidad NUMERIC NOT NULL DEFAULT 500,
  domicilio_total NUMERIC NOT NULL DEFAULT 5000,
  nombre_socio1 TEXT NOT NULL DEFAULT 'Mildrey',
  nombre_socio2 TEXT NOT NULL DEFAULT 'Miguel',
  nombre_socio3 TEXT NOT NULL DEFAULT 'Jeronimo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VENTAS (relación con vendedor por ID)
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vendedor_id UUID NOT NULL REFERENCES vendedores(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  costo_distribucion NUMERIC NOT NULL,
  ingreso_vendedor NUMERIC NOT NULL,
  comision_miguel NUMERIC NOT NULL,
  comision_jeronimo NUMERIC NOT NULL,
  domicilio_total NUMERIC NOT NULL DEFAULT 0,
  domicilio_vendedor NUMERIC NOT NULL DEFAULT 0,
  domicilio_socios NUMERIC NOT NULL DEFAULT 0,
  ganancia_operador NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor_id ON ventas(vendedor_id);

-- 5. Insertar configuración por defecto
INSERT INTO configuracion (
  precio_distribucion, precio_vendedor_primeros_20, precio_vendedor_despues_20,
  umbral_descuento, comision_miguel_por_unidad, limite_comision_miguel,
  comision_jeronimo_por_unidad, domicilio_total,
  nombre_socio1, nombre_socio2, nombre_socio3
)
SELECT 6000, 7000, 6500, 20, 1000, 20, 500, 5000, 'Mildrey', 'Miguel', 'Jeronimo'
WHERE NOT EXISTS (SELECT 1 FROM configuracion LIMIT 1);

-- 6. Insertar vendedores por defecto (opcional)
INSERT INTO vendedores (nombre, universidad_id, telefono)
SELECT v.nombre, u.id, COALESCE(v.telefono, '')
FROM (VALUES
  ('Carlos', 'U Nacional', ''),
  ('Maria', 'UdeA', ''),
  ('Pedro', 'EAFIT', '')
) AS v(nombre, universidad_nombre, telefono)
JOIN universidades u ON u.nombre = v.universidad_nombre
ON CONFLICT (nombre) DO NOTHING;

-- 7. RLS
ALTER TABLE universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- 8. Políticas
CREATE POLICY "Lectura universidades" ON universidades FOR SELECT USING (true);
CREATE POLICY "Lectura vendedores" ON vendedores FOR SELECT USING (true);
CREATE POLICY "Insertar vendedores" ON vendedores FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar vendedores" ON vendedores FOR UPDATE USING (true);
CREATE POLICY "Eliminar vendedores" ON vendedores FOR DELETE USING (true);

CREATE POLICY "Lectura configuracion" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Actualizar configuracion" ON configuracion FOR UPDATE USING (true);
CREATE POLICY "Insertar configuracion" ON configuracion FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura ventas" ON ventas FOR SELECT USING (true);
CREATE POLICY "Insertar ventas" ON ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminar ventas" ON ventas FOR DELETE USING (true);
