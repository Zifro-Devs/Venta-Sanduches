import type { Venta, ResumenSemanal, ResumenMensual, ConfigNegocio } from './types'
import { supabase } from './supabase'
import { getWeekRange } from './calculos'

// Validar que Supabase esté configurado
function validarSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || url === 'https://placeholder.supabase.co' || !key || key === 'placeholder-key') {
    return {
      success: false,
      error: 'Supabase no está configurado. Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
    }
  }
  
  return { success: true }
}

// Convertir de formato DB a formato App
function ventaDBToApp(ventaDB: any): Venta {
  return {
    id: ventaDB.id,
    fecha: ventaDB.fecha,
    vendedor: ventaDB.vendedor,
    cantidad: ventaDB.cantidad,
    costoDistribucion: ventaDB.costo_distribucion,
    ingresoVendedor: ventaDB.ingreso_vendedor,
    comisionMiguel: ventaDB.comision_miguel,
    comisionJeronimo: ventaDB.comision_jeronimo,
    domicilioTotal: ventaDB.domicilio_total,
    domicilioVendedor: ventaDB.domicilio_vendedor,
    domicilioSocios: ventaDB.domicilio_socios,
    gananciaOperador: ventaDB.ganancia_operador,
  }
}

// Convertir de formato App a formato DB
function ventaAppToDB(venta: Omit<Venta, 'id'>) {
  return {
    fecha: venta.fecha,
    vendedor: venta.vendedor,
    cantidad: venta.cantidad,
    costo_distribucion: Math.round(venta.costoDistribucion),
    ingreso_vendedor: Math.round(venta.ingresoVendedor),
    comision_miguel: Math.round(venta.comisionMiguel),
    comision_jeronimo: Math.round(venta.comisionJeronimo),
    domicilio_total: Math.round(venta.domicilioTotal),
    domicilio_vendedor: Math.round(venta.domicilioVendedor),
    domicilio_socios: Math.round(venta.domicilioSocios),
    ganancia_operador: Math.round(venta.gananciaOperador),
  }
}

export async function agregarVenta(venta: Omit<Venta, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  const validacion = validarSupabase()
  if (!validacion.success) {
    return validacion
  }

  try {
    const ventaDB = ventaAppToDB(venta)
    
    const { data, error } = await supabase
      .from('ventas')
      .insert([ventaDB])
      .select()
      .single()

    if (error) {
      console.error('Error al agregar venta:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error al agregar venta:', error)
    return { success: false, error: 'Error al conectar con la base de datos' }
  }
}

export async function obtenerVentas(): Promise<{ success: boolean; data?: Venta[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error al obtener ventas:', error)
      return { success: false, error: error.message }
    }

    const ventas = data.map(ventaDBToApp)
    return { success: true, data: ventas }
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return { success: false, error: 'Error al obtener ventas' }
  }
}

export async function obtenerResumenSemanal(): Promise<{ success: boolean; data?: ResumenSemanal; error?: string }> {
  try {
    const { start, end } = getWeekRange(new Date())
    
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha', start.toISOString())
      .lte('fecha', end.toISOString())

    if (error) {
      console.error('Error al obtener resumen semanal:', error)
      return { success: false, error: error.message }
    }

    const ventas = data.map(ventaDBToApp)
    
    // Calcular resumen
    const totalVentas = ventas.length
    const totalSandwiches = ventas.reduce((sum, v) => sum + v.cantidad, 0)
    const comisionMiguel = ventas.reduce((sum, v) => sum + v.comisionMiguel, 0)
    const comisionJeronimo = ventas.reduce((sum, v) => sum + v.comisionJeronimo, 0)
    const domicilioTotal = ventas.reduce((sum, v) => sum + v.domicilioTotal, 0)
    const domicilioSocios = ventas.reduce((sum, v) => sum + v.domicilioSocios, 0)
    const gananciaOperador = ventas.reduce((sum, v) => sum + v.gananciaOperador, 0)

    // Ventas por vendedor
    const ventasPorVendedor: Record<string, { cantidad: number; total: number }> = {}
    ventas.forEach((v) => {
      if (!ventasPorVendedor[v.vendedor]) {
        ventasPorVendedor[v.vendedor] = { cantidad: 0, total: 0 }
      }
      ventasPorVendedor[v.vendedor].cantidad += v.cantidad
      ventasPorVendedor[v.vendedor].total += v.ingresoVendedor
    })

    const resumen: ResumenSemanal = {
      semana: `Semana ${Math.ceil((start.getDate()) / 7)}`,
      fechaInicio: start.toISOString(),
      fechaFin: end.toISOString(),
      totalVentas,
      totalSandwiches,
      comisionMiguel,
      comisionJeronimo,
      domicilioTotal,
      domicilioSocios,
      gananciaOperador,
      ventasPorVendedor,
    }

    return { success: true, data: resumen }
  } catch (error) {
    console.error('Error al obtener resumen semanal:', error)
    return { success: false, error: 'Error al obtener resumen semanal' }
  }
}

export async function obtenerResumenMensual(): Promise<{ success: boolean; data?: ResumenMensual; error?: string }> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha', startOfMonth.toISOString())
      .lte('fecha', endOfMonth.toISOString())

    if (error) {
      console.error('Error al obtener resumen mensual:', error)
      return { success: false, error: error.message }
    }

    const ventas = data.map(ventaDBToApp)

    const totalFacturado = ventas.reduce((sum, v) => sum + v.ingresoVendedor, 0)
    const totalSandwiches = ventas.reduce((sum, v) => sum + v.cantidad, 0)
    const comisionMiguel = ventas.reduce((sum, v) => sum + v.comisionMiguel, 0)
    const comisionJeronimo = ventas.reduce((sum, v) => sum + v.comisionJeronimo, 0)
    const domicilioTotal = ventas.reduce((sum, v) => sum + v.domicilioTotal, 0)
    const gananciaOperador = ventas.reduce((sum, v) => sum + v.gananciaOperador, 0)

    const resumen: ResumenMensual = {
      mes: now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      totalFacturado,
      totalSandwiches,
      comisionMiguel,
      comisionJeronimo,
      domicilioTotal,
      gananciaOperador,
    }

    return { success: true, data: resumen }
  } catch (error) {
    console.error('Error al obtener resumen mensual:', error)
    return { success: false, error: 'Error al obtener resumen mensual' }
  }
}

export async function eliminarVenta(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar venta:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar venta:', error)
    return { success: false, error: 'Error al eliminar venta' }
  }
}

// Funciones para configuración
export async function obtenerConfiguracion(): Promise<{ success: boolean; data?: ConfigNegocio; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error al obtener configuración:', error)
      return { success: false, error: error.message }
    }

    const config: ConfigNegocio = {
      precioDistribucion: data.precio_distribucion,
      precioVendedorPrimeros20: data.precio_vendedor_primeros_20,
      precioVendedorDespues20: data.precio_vendedor_despues_20,
      umbralDescuento: data.umbral_descuento,
      comisionMiguelPorUnidad: data.comision_miguel_por_unidad,
      limiteComisionMiguel: data.limite_comision_miguel,
      comisionJeronimoPorUnidad: data.comision_jeronimo_por_unidad,
      domicilioTotal: data.domicilio_total,
      vendedores: data.vendedores,
      nombreSocio1: data.nombre_socio1,
      nombreSocio2: data.nombre_socio2,
      nombreSocio3: data.nombre_socio3,
    }

    return { success: true, data: config }
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return { success: false, error: 'Error al obtener configuración' }
  }
}

export async function guardarConfiguracion(config: ConfigNegocio): Promise<{ success: boolean; error?: string }> {
  try {
    const configDB = {
      precio_distribucion: Math.round(config.precioDistribucion),
      precio_vendedor_primeros_20: Math.round(config.precioVendedorPrimeros20),
      precio_vendedor_despues_20: Math.round(config.precioVendedorDespues20),
      umbral_descuento: config.umbralDescuento,
      comision_miguel_por_unidad: Math.round(config.comisionMiguelPorUnidad),
      limite_comision_miguel: config.limiteComisionMiguel,
      comision_jeronimo_por_unidad: Math.round(config.comisionJeronimoPorUnidad),
      domicilio_total: Math.round(config.domicilioTotal),
      vendedores: config.vendedores,
      nombre_socio1: config.nombreSocio1,
      nombre_socio2: config.nombreSocio2,
      nombre_socio3: config.nombreSocio3,
      updated_at: new Date().toISOString(),
    }

    // Obtener el ID de la configuración existente
    const { data: existing } = await supabase
      .from('configuracion')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('configuracion')
        .update(configDB)
        .eq('id', existing.id)

      if (error) {
        console.error('Error al actualizar configuración:', error)
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase
        .from('configuracion')
        .insert([configDB])

      if (error) {
        console.error('Error al crear configuración:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    return { success: false, error: 'Error al guardar configuración' }
  }
}
