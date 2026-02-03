/**
 * Script de migración de datos de Google Sheets a Supabase
 * 
 * IMPORTANTE: Este script es OPCIONAL. Solo úsalo si tienes datos existentes
 * en Google Sheets que quieras migrar a Supabase.
 * 
 * Uso:
 * 1. Asegúrate de tener configuradas las variables de entorno de Supabase
 * 2. Mantén temporalmente las variables de Google Sheets en .env.local
 * 3. Ejecuta: npm run migrar
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configuración de Google Sheets
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

interface VentaGoogleSheets {
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

async function obtenerVentasDeGoogleSheets(): Promise<VentaGoogleSheets[]> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL no configurada')
  }

  const response = await fetch(`${APPS_SCRIPT_URL}?action=obtenerVentas`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Error al obtener ventas de Google Sheets')
  }

  return result.data || []
}

async function migrarVentasASupabase(ventas: VentaGoogleSheets[]) {
  console.log(`📦 Migrando ${ventas.length} ventas a Supabase...`)

  const ventasDB = ventas.map(venta => ({
    // No incluimos el ID para que Supabase genere uno nuevo
    fecha: venta.fecha,
    vendedor: venta.vendedor,
    cantidad: venta.cantidad,
    costo_distribucion: venta.costoDistribucion,
    ingreso_vendedor: venta.ingresoVendedor,
    comision_miguel: venta.comisionMiguel,
    comision_jeronimo: venta.comisionJeronimo,
    domicilio_total: venta.domicilioTotal,
    domicilio_vendedor: venta.domicilioVendedor,
    domicilio_socios: venta.domicilioSocios,
    ganancia_operador: venta.gananciaOperador,
  }))

  // Insertar en lotes de 100 para evitar límites
  const batchSize = 100
  let migradas = 0

  for (let i = 0; i < ventasDB.length; i += batchSize) {
    const batch = ventasDB.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('ventas')
      .insert(batch)

    if (error) {
      console.error(`❌ Error al migrar lote ${i / batchSize + 1}:`, error)
      throw error
    }

    migradas += batch.length
    console.log(`✅ Migradas ${migradas}/${ventasDB.length} ventas`)
  }

  return migradas
}

async function migrarConfiguracion() {
  if (!APPS_SCRIPT_URL) {
    console.log('⚠️  No hay configuración de Google Sheets para migrar')
    return
  }

  console.log('📋 Migrando configuración...')

  const response = await fetch(`${APPS_SCRIPT_URL}?action=obtenerConfiguracion`)
  const result = await response.json()

  if (!result.success || !result.data) {
    console.log('⚠️  No se pudo obtener configuración de Google Sheets')
    return
  }

  const config = result.data
  const configDB = {
    precio_distribucion: config.precioDistribucion,
    precio_vendedor_primeros_20: config.precioVendedorPrimeros20,
    precio_vendedor_despues_20: config.precioVendedorDespues20,
    umbral_descuento: config.umbralDescuento,
    comision_miguel_por_unidad: config.comisionMiguelPorUnidad,
    limite_comision_miguel: config.limiteComisionMiguel,
    comision_jeronimo_por_unidad: config.comisionJeronimoPorUnidad,
    domicilio_total: config.domicilioTotal,
    vendedores: config.vendedores,
    nombre_socio1: config.nombreSocio1,
    nombre_socio2: config.nombreSocio2,
    nombre_socio3: config.nombreSocio3,
  }

  // Verificar si ya existe configuración
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
      console.error('❌ Error al actualizar configuración:', error)
      throw error
    }
  } else {
    const { error } = await supabase
      .from('configuracion')
      .insert([configDB])

    if (error) {
      console.error('❌ Error al crear configuración:', error)
      throw error
    }
  }

  console.log('✅ Configuración migrada exitosamente')
}

async function main() {
  console.log('🚀 Iniciando migración de Google Sheets a Supabase\n')

  try {
    // Verificar conexión a Supabase
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }

    console.log('✅ Conexión a Supabase verificada\n')

    // Migrar configuración
    await migrarConfiguracion()
    console.log('')

    // Obtener ventas de Google Sheets
    console.log('📥 Obteniendo ventas de Google Sheets...')
    const ventas = await obtenerVentasDeGoogleSheets()
    
    if (ventas.length === 0) {
      console.log('⚠️  No hay ventas para migrar\n')
    } else {
      console.log(`✅ ${ventas.length} ventas encontradas\n`)
      
      // Migrar ventas
      const migradas = await migrarVentasASupabase(ventas)
      console.log(`\n✅ ${migradas} ventas migradas exitosamente\n`)
    }

    console.log('🎉 ¡Migración completada exitosamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('1. Verifica los datos en Supabase Dashboard')
    console.log('2. Prueba la aplicación con npm run dev')
    console.log('3. Si todo funciona, puedes eliminar las variables de Google Sheets de .env.local')
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    process.exit(1)
  }
}

main()
