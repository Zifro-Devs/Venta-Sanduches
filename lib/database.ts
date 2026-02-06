import type { Venta, ResumenSemanal, ResumenMensual, ConfigNegocio, Vendedor, VendedorInfo } from './types'
import { supabase } from './supabase'
import { getWeekRange } from './calculos'

function validarSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || url === 'https://placeholder.supabase.co' || !key || key === 'placeholder-key') {
    return { success: false, error: 'Supabase no está configurado. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local' }
  }
  return { success: true }
}

function ventaDBToApp(row: any): Venta {
  const nombreVendedor = row.vendedores?.nombre ?? row.vendedor ?? ''
  return {
    id: row.id,
    fecha: row.fecha,
    vendedorId: row.vendedor_id,
    vendedor: nombreVendedor,
    cantidad: row.cantidad,
    costoDistribucion: row.costo_distribucion,
    ingresoVendedor: row.ingreso_vendedor,
    comisionMiguel: row.comision_miguel,
    comisionJeronimo: row.comision_jeronimo,
    domicilioTotal: row.domicilio_total,
    domicilioVendedor: row.domicilio_vendedor,
    domicilioSocios: row.domicilio_socios,
    gananciaOperador: row.ganancia_operador,
  }
}

function ventaAppToDB(venta: Omit<Venta, 'id'>) {
  return {
    fecha: venta.fecha,
    vendedor_id: venta.vendedorId,
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
  if (!validacion.success) return validacion
  try {
    const ventaDB = ventaAppToDB(venta)
    const { data, error } = await supabase.from('ventas').insert([ventaDB]).select('id').single()
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

export type FiltrosVentas = {
  fechaDesde?: string
  fechaHasta?: string
  vendedorId?: string
}

/** Fechas en formato YYYY-MM-DD se interpretan en UTC (00:00:00 y 23:59:59 ese día). */
export async function obtenerVentasConFiltros(
  filtros: FiltrosVentas = {}
): Promise<{ success: boolean; data?: Venta[]; error?: string }> {
  try {
    let query = supabase
      .from('ventas')
      .select('id, fecha, vendedor_id, cantidad, costo_distribucion, ingreso_vendedor, comision_miguel, comision_jeronimo, domicilio_total, domicilio_vendedor, domicilio_socios, ganancia_operador, created_at, vendedores(nombre)')
      .order('fecha', { ascending: false })
      .limit(500)

    if (filtros.fechaDesde) {
      const desde = `${filtros.fechaDesde}T00:00:00.000Z`
      query = query.gte('fecha', desde)
    }
    if (filtros.fechaHasta) {
      const hasta = `${filtros.fechaHasta}T23:59:59.999Z`
      query = query.lte('fecha', hasta)
    }
    if (filtros.vendedorId) {
      query = query.eq('vendedor_id', filtros.vendedorId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error al obtener ventas:', error)
      return { success: false, error: error.message }
    }
    return { success: true, data: (data ?? []).map(ventaDBToApp) }
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return { success: false, error: 'Error al obtener ventas' }
  }
}

export async function obtenerVentas(): Promise<{ success: boolean; data?: Venta[]; error?: string }> {
  return obtenerVentasConFiltros({})
}

export async function obtenerResumenSemanal(): Promise<{ success: boolean; data?: ResumenSemanal; error?: string }> {
  try {
    const { start, end } = getWeekRange(new Date())
    const { data, error } = await supabase
      .from('ventas')
      .select('*, vendedores(nombre)')
      .gte('fecha', start.toISOString())
      .lte('fecha', end.toISOString())
    if (error) {
      console.error('Error al obtener resumen semanal:', error)
      return { success: false, error: error.message }
    }
    const ventas = (data ?? []).map(ventaDBToApp)
    const totalVentas = ventas.length
    const totalSandwiches = ventas.reduce((sum, v) => sum + v.cantidad, 0)
    const comisionMiguel = ventas.reduce((sum, v) => sum + v.comisionMiguel, 0)
    const comisionJeronimo = ventas.reduce((sum, v) => sum + v.comisionJeronimo, 0)
    const domicilioTotal = ventas.reduce((sum, v) => sum + v.domicilioTotal, 0)
    const domicilioSocios = ventas.reduce((sum, v) => sum + v.domicilioSocios, 0)
    const gananciaOperador = ventas.reduce((sum, v) => sum + v.gananciaOperador, 0)
    const ventasPorVendedor: Record<string, { cantidad: number; total: number }> = {}
    ventas.forEach((v) => {
      const key = v.vendedor || v.vendedorId
      if (!ventasPorVendedor[key]) ventasPorVendedor[key] = { cantidad: 0, total: 0 }
      ventasPorVendedor[key].cantidad += v.cantidad
      ventasPorVendedor[key].total += v.ingresoVendedor
    })
    const resumen: ResumenSemanal = {
      semana: `Semana ${Math.ceil(new Date(start).getDate() / 7)}`,
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
      .select('*, vendedores(nombre)')
      .gte('fecha', startOfMonth.toISOString())
      .lte('fecha', endOfMonth.toISOString())
    if (error) {
      console.error('Error al obtener resumen mensual:', error)
      return { success: false, error: error.message }
    }
    const ventas = (data ?? []).map(ventaDBToApp)
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

/** Resumen agregado para un rango de fechas (YYYY-MM-DD). */
export async function obtenerResumenPorRangoFechas(
  fechaDesde: string,
  fechaHasta: string
): Promise<{ success: boolean; data?: ResumenMensual; error?: string }> {
  try {
    const desde = `${fechaDesde}T00:00:00.000Z`
    const hasta = `${fechaHasta}T23:59:59.999Z`
    const { data, error } = await supabase
      .from('ventas')
      .select('*, vendedores(nombre)')
      .gte('fecha', desde)
      .lte('fecha', hasta)
    if (error) {
      console.error('Error al obtener resumen por rango:', error)
      return { success: false, error: error.message }
    }
    const ventas = (data ?? []).map(ventaDBToApp)
    const totalFacturado = ventas.reduce((sum, v) => sum + v.ingresoVendedor, 0)
    const totalSandwiches = ventas.reduce((sum, v) => sum + v.cantidad, 0)
    const comisionMiguel = ventas.reduce((sum, v) => sum + v.comisionMiguel, 0)
    const comisionJeronimo = ventas.reduce((sum, v) => sum + v.comisionJeronimo, 0)
    const domicilioTotal = ventas.reduce((sum, v) => sum + v.domicilioTotal, 0)
    const gananciaOperador = ventas.reduce((sum, v) => sum + v.gananciaOperador, 0)
    const desdeDate = new Date(fechaDesde)
    const hastaDate = new Date(fechaHasta)
    const mesLabel =
      fechaDesde === fechaHasta
        ? desdeDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
        : `${desdeDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} → ${hastaDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
    const resumen: ResumenMensual = {
      mes: mesLabel,
      totalFacturado,
      totalSandwiches,
      comisionMiguel,
      comisionJeronimo,
      domicilioTotal,
      gananciaOperador,
    }
    return { success: true, data: resumen }
  } catch (error) {
    console.error('Error al obtener resumen por rango:', error)
    return { success: false, error: 'Error al obtener resumen por rango' }
  }
}

export async function eliminarVenta(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('ventas').delete().eq('id', id)
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

/** Recalcula domicilio_vendedor, domicilio_socios y ganancia_operador con el nuevo domicilio_total y actualiza la venta. */
export async function actualizarDomicilioVenta(
  id: string,
  domicilioTotal: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: row, error: fetchError } = await supabase
      .from('ventas')
      .select('ingreso_vendedor, comision_miguel, comision_jeronimo')
      .eq('id', id)
      .single()

    if (fetchError || !row) {
      return { success: false, error: fetchError?.message ?? 'Venta no encontrada' }
    }

    const domicilioVendedor = domicilioTotal * 0.5
    const domicilioSocios = domicilioTotal * 0.5
    const gananciaOperador =
      (row.ingreso_vendedor ?? 0) -
      (row.comision_miguel ?? 0) -
      (row.comision_jeronimo ?? 0) -
      domicilioSocios / 3

    const { error: updateError } = await supabase
      .from('ventas')
      .update({
        domicilio_total: Math.round(domicilioTotal),
        domicilio_vendedor: Math.round(domicilioVendedor),
        domicilio_socios: Math.round(domicilioSocios),
        ganancia_operador: Math.round(gananciaOperador),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error al actualizar domicilio:', updateError)
      return { success: false, error: updateError.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar domicilio:', error)
    return { success: false, error: 'Error al actualizar domicilio' }
  }
}

// ---------- Vendedores ----------
export async function obtenerVendedores(): Promise<{ success: boolean; data?: Vendedor[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('vendedores')
      .select('id, nombre, universidad_id, telefono, universidades(nombre)')
      .order('nombre')
    if (error) {
      console.error('Error al obtener vendedores:', error)
      return { success: false, error: error.message }
    }
    const vendedores: Vendedor[] = (data ?? []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      universidadId: row.universidad_id,
      universidad: row.universidades?.nombre ?? 'U Nacional',
      telefono: row.telefono ?? '',
    }))
    return { success: true, data: vendedores }
  } catch (error) {
    console.error('Error al obtener vendedores:', error)
    return { success: false, error: 'Error al obtener vendedores' }
  }
}

export async function crearVendedor(info: VendedorInfo): Promise<{ success: boolean; id?: string; error?: string }> {
  const validacion = validarSupabase()
  if (!validacion.success) return validacion
  try {
    const { data: univ } = await supabase.from('universidades').select('id').eq('nombre', info.universidad).limit(1).single()
    if (!univ?.id) {
      return { success: false, error: 'Universidad no encontrada' }
    }
    const { data, error } = await supabase
      .from('vendedores')
      .insert([{ nombre: info.nombre.trim(), universidad_id: univ.id, telefono: info.telefono?.trim() ?? '' }])
      .select('id')
      .single()
    if (error) {
      console.error('Error al crear vendedor:', error)
      return { success: false, error: error.message }
    }
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error al crear vendedor:', error)
    return { success: false, error: 'Error al conectar con la base de datos' }
  }
}

export async function eliminarVendedor(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('vendedores').delete().eq('id', id)
    if (error) {
      console.error('Error al eliminar vendedor:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar vendedor:', error)
    return { success: false, error: 'Error al eliminar vendedor' }
  }
}

export async function obtenerVendedorPorId(id: string): Promise<{ success: boolean; nombre?: string; error?: string }> {
  try {
    const { data, error } = await supabase.from('vendedores').select('nombre').eq('id', id).limit(1).single()
    if (error || !data) return { success: false, error: error?.message ?? 'Vendedor no encontrado' }
    return { success: true, nombre: data.nombre }
  } catch (error) {
    console.error('Error al obtener vendedor:', error)
    return { success: false, error: 'Error al obtener vendedor' }
  }
}

// ---------- Configuración (sin vendedores) ----------
export async function obtenerConfiguracion(): Promise<{ success: boolean; data?: ConfigNegocio; error?: string }> {
  try {
    const { data, error } = await supabase.from('configuracion').select('*').limit(1).single()
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
      nombre_socio1: config.nombreSocio1,
      nombre_socio2: config.nombreSocio2,
      nombre_socio3: config.nombreSocio3,
      updated_at: new Date().toISOString(),
    }
    const { data: existing } = await supabase.from('configuracion').select('id').limit(1).single()
    if (existing) {
      const { error } = await supabase.from('configuracion').update(configDB).eq('id', existing.id)
      if (error) {
        console.error('Error al actualizar configuración:', error)
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase.from('configuracion').insert([configDB])
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
