export interface Venta {
  id: string
  fecha: string
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

// Configuracion dinamica del negocio
export interface ConfigNegocio {
  precioDistribucion: number
  precioVendedorPrimeros20: number
  precioVendedorDespues20: number
  umbralDescuento: number
  comisionMiguelPorUnidad: number
  limiteComisionMiguel: number
  comisionJeronimoPorUnidad: number
  domicilioTotal: number
  vendedores: string[]
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
  vendedores: ['Carlos', 'Maria', 'Pedro'],
  nombreSocio1: 'Tu',
  nombreSocio2: 'Miguel',
  nombreSocio3: 'Jeronimo',
}

// Para compatibilidad con el codigo existente
export const VENDEDORES = CONFIG_DEFAULT.vendedores
export type Vendedor = string

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
