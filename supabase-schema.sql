-- Tabla de universidades (U Nacional, UdeA, EAFIT)
CREATE TABLE IF NOT EXISTS universidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar universidades por defecto
INSERT INTO universidades (nombre) VALUES
  ('U Nacional'),
  ('UdeA'),
  ('EAFIT')
ON CONFLICT (nombre) DO NOTHING;

-- Tabla de configuración del negocio
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
  vendedores TEXT[] NOT NULL DEFAULT ARRAY['Carlos', 'Maria', 'Pedro'],
  vendedores_detalle JSONB NOT NULL DEFAULT '{}',
  nombre_socio1 TEXT NOT NULL DEFAULT 'Mildrey',
  nombre_socio2 TEXT NOT NULL DEFAULT 'Miguel',
  nombre_socio3 TEXT NOT NULL DEFAULT 'Jeronimo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vendedor TEXT NOT NULL,
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor ON ventas(vendedor);

-- Insertar configuración por defecto si no existe
INSERT INTO configuracion (
  precio_distribucion,
  precio_vendedor_primeros_20,
  precio_vendedor_despues_20,
  umbral_descuento,
  comision_miguel_por_unidad,
  limite_comision_miguel,
  comision_jeronimo_por_unidad,
  domicilio_total,
  vendedores,
  nombre_socio1,
  nombre_socio2,
  nombre_socio3
) 
SELECT 6000, 7000, 6500, 20, 1000, 20, 500, 5000, 
       ARRAY['Carlos', 'Maria', 'Pedro'], 'Mildrey', 'Miguel', 'Jeronimo'
WHERE NOT EXISTS (SELECT 1 FROM configuracion LIMIT 1);

-- Agregar columna vendedores_detalle si no existe (migración para proyectos existentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configuracion' AND column_name = 'vendedores_detalle'
  ) THEN
    ALTER TABLE configuracion ADD COLUMN vendedores_detalle JSONB NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (puedes ajustarlas según tus necesidades)
-- IMPORTANTE: Para producción, deberías implementar autenticación
CREATE POLICY "Permitir lectura pública de universidades" ON universidades
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública de configuración" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización pública de configuración" ON configuracion
  FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura pública de ventas" ON ventas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública de ventas" ON ventas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir eliminación pública de ventas" ON ventas
  FOR DELETE USING (true);
