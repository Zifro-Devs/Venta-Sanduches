import { type ConfigNegocio, CONFIG_DEFAULT, type Venta } from './types'

/**
 * valorDomicilio: si se pasa, se usa como domicilio total (ej. al editar en historial).
 * Si no se pasa, se usa config.domicilioTotal cuando incluyeDomicilio, o 0.
 * Al registrar la venta se guarda con 0 y se edita después.
 */
export function calcularVenta(
  vendedor: string,
  cantidad: number,
  incluyeDomicilio: boolean = true,
  config: ConfigNegocio = CONFIG_DEFAULT,
  valorDomicilio?: number
): Omit<Venta, 'id' | 'fecha' | 'vendedorId'> {
  // Ingreso del administrador por distribución (lo que facturas; pertenece al administrador, no es costo)
  const costoDistribucion = cantidad * config.precioDistribucion

  // Ingreso del vendedor (lo que el vendedor paga)
  let ingresoVendedor = 0
  if (cantidad <= config.umbralDescuento) {
    ingresoVendedor = cantidad * config.precioVendedorPrimeros20
  } else {
    ingresoVendedor =
      config.umbralDescuento * config.precioVendedorPrimeros20 +
      (cantidad - config.umbralDescuento) * config.precioVendedorDespues20
  }

  // Comision de Miguel (solo los primeros 20)
  const unidadesParaMiguel = Math.min(cantidad, config.limiteComisionMiguel)
  const comisionMiguel = unidadesParaMiguel * config.comisionMiguelPorUnidad

  // Comision de Jeronimo (todas las unidades)
  const comisionJeronimo = cantidad * config.comisionJeronimoPorUnidad

  // Domicilio: valor explícito o según incluyeDomicilio (0 al registrar para definir después)
  const domicilioTotal =
    valorDomicilio !== undefined ? valorDomicilio : incluyeDomicilio ? config.domicilioTotal : 0
  const domicilioVendedor = domicilioTotal * 0.5
  const domicilioSocios = domicilioTotal * 0.5 // Se divide entre 3 socios

  // Ganancia del operador: todo lo que sobra del total venta después de comisiones y su parte del domicilio
  // (incluye la distribución neta + el resto ingresoVendedor − costoDistribucion, para que sume: Miguel + Jerónimo + Mildrey = Total venta)
  const gananciaOperador =
    ingresoVendedor - comisionMiguel - comisionJeronimo - domicilioSocios / 3

  return {
    vendedor,
    cantidad,
    costoDistribucion,
    ingresoVendedor,
    comisionMiguel,
    comisionJeronimo,
    domicilioTotal,
    domicilioVendedor,
    domicilioSocios,
    gananciaOperador,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(date)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
