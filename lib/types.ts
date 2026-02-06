export interface Venta {
  id: string
  fecha: string
  vendedorId: string
  vendedor: string
  cantidad: number
  costoDistribucion: number
  ingresoVendedor: number
  comisionMiguel: number
  comisionJeronimo: number
  domicilioTotal: number
  domicilioVendedor: number
  domicilioSocios: number
  gananciaOperador: number
}

export interface ResumenSemanal {
  semana: string
  fechaInicio: string
  fechaFin: string
  totalVentas: number
  totalSandwiches: number
  comisionMiguel: number
  comisionJeronimo: number
  domicilioTotal: number
  domicilioSocios: number
  gananciaOperador: number
  ventasPorVendedor: Record<string, { cantidad: number; total: number }>
}

export interface ResumenMensual {
  mes: string
  totalFacturado: number
  totalSandwiches: number
  comisionMiguel: number
  comisionJeronimo: number
  domicilioTotal: number
  gananciaOperador: number
}

// Universidades disponibles (tabla universidades en Supabase)
export const UNIVERSIDADES = ['U Nacional', 'UdeA', 'EAFIT'] as const
export type Universidad = (typeof UNIVERSIDADES)[number]

// Vendedor como entidad (tabla vendedores)
export interface Vendedor {
  id: string
  nombre: string
  universidadId: string
  universidad: string
  telefono: string
}

// Para crear/actualizar vendedor (sin id)
export interface VendedorInfo {
  nombre: string
  universidad: Universidad
  telefono: string
}

// Configuracion del negocio (sin lista de vendedores; se obtienen de /api/vendedores)
export interface ConfigNegocio {
  precioDistribucion: number
  precioVendedorPrimeros20: number
  precioVendedorDespues20: number
  umbralDescuento: number
  comisionMiguelPorUnidad: number
  limiteComisionMiguel: number
  comisionJeronimoPorUnidad: number
  domicilioTotal: number
  nombreSocio1: string
  nombreSocio2: string
  nombreSocio3: string
}

// Valores por defecto
export const CONFIG_DEFAULT: ConfigNegocio = {
  precioDistribucion: 6000,
  precioVendedorPrimeros20: 7000,
  precioVendedorDespues20: 6500,
  umbralDescuento: 20,
  comisionMiguelPorUnidad: 1000,
  limiteComisionMiguel: 20,
  comisionJeronimoPorUnidad: 500,
  domicilioTotal: 5000,
  nombreSocio1: 'Mildrey',
  nombreSocio2: 'Miguel',
  nombreSocio3: 'Jeronimo',
}

export const CONFIG = {
  PRECIO_DISTRIBUCION: CONFIG_DEFAULT.precioDistribucion,
  PRECIO_VENDEDOR_PRIMEROS_20: CONFIG_DEFAULT.precioVendedorPrimeros20,
  PRECIO_VENDEDOR_DESPUES_20: CONFIG_DEFAULT.precioVendedorDespues20,
  UMBRAL_DESCUENTO: CONFIG_DEFAULT.umbralDescuento,
  COMISION_MIGUEL_POR_UNIDAD: CONFIG_DEFAULT.comisionMiguelPorUnidad,
  LIMITE_COMISION_MIGUEL: CONFIG_DEFAULT.limiteComisionMiguel,
  COMISION_JERONIMO_POR_UNIDAD: CONFIG_DEFAULT.comisionJeronimoPorUnidad,
  DOMICILIO_TOTAL: CONFIG_DEFAULT.domicilioTotal,
} as const
