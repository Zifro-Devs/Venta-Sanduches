/**
 * Script para verificar que la configuración de Supabase está correcta
 * 
 * Uso: npx tsx scripts/verificar-configuracion.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function verificar() {
  console.log('🔍 Verificando configuración de Supabase...\n')

  // 1. Verificar variables de entorno
  console.log('1️⃣ Variables de entorno:')
  if (!supabaseUrl) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL no está configurada')
    return false
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)

  if (!supabaseAnonKey) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
    return false
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`)

  // 2. Crear cliente
  console.log('\n2️⃣ Conexión a Supabase:')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('   ✅ Cliente de Supabase creado')

  // 3. Verificar tabla de configuración
  console.log('\n3️⃣ Tabla de configuración:')
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.log(`   ❌ Error al leer configuración: ${error.message}`)
      console.log('   💡 Ejecuta el script SQL (supabase-schema.sql) en Supabase')
      return false
    }

    if (!data) {
      console.log('   ⚠️  No hay configuración. Ejecuta el script SQL para crear los datos por defecto')
      return false
    }

    console.log('   ✅ Configuración encontrada')
    console.log(`   📋 Vendedores: ${data.vendedores.join(', ')}`)
    console.log(`   💰 Precio distribución: $${data.precio_distribucion}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
    return false
  }

  // 4. Verificar tabla de ventas
  console.log('\n4️⃣ Tabla de ventas:')
  try {
    const { data, error, count } = await supabase
      .from('ventas')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`   ❌ Error al leer ventas: ${error.message}`)
      console.log('   💡 Ejecuta el script SQL (supabase-schema.sql) en Supabase')
      return false
    }

    console.log('   ✅ Tabla de ventas accesible')
    console.log(`   📊 Total de ventas: ${count || 0}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
    return false
  }

  // 5. Probar inserción (y eliminarla inmediatamente)
  console.log('\n5️⃣ Prueba de escritura:')
  try {
    const ventaPrueba = {
      fecha: new Date().toISOString(),
      vendedor: 'TEST',
      cantidad: 1,
      costo_distribucion: 6000,
      ingreso_vendedor: 7000,
      comision_miguel: 1000,
      comision_jeronimo: 500,
      domicilio_total: 0,
      domicilio_vendedor: 0,
      domicilio_socios: 0,
      ganancia_operador: -500,
    }

    const { data, error } = await supabase
      .from('ventas')
      .insert([ventaPrueba])
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Error al insertar: ${error.message}`)
      return false
    }

    console.log('   ✅ Inserción exitosa')

    // Eliminar la venta de prueba
    await supabase.from('ventas').delete().eq('id', data.id)
    console.log('   ✅ Eliminación exitosa')
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
    return false
  }

  return true
}

async function main() {
  const exito = await verificar()

  if (exito) {
    console.log('\n✅ ¡Todo está configurado correctamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Ejecuta: npm run dev')
    console.log('   2. Abre: http://localhost:3000')
    console.log('   3. Registra una venta de prueba')
    console.log('   4. Verifica en Supabase Dashboard que se guardó')
  } else {
    console.log('\n❌ Hay problemas con la configuración')
    console.log('\n📝 Pasos para solucionar:')
    console.log('   1. Verifica que las variables en .env.local sean correctas')
    console.log('   2. Ejecuta el script SQL (supabase-schema.sql) en Supabase')
    console.log('   3. Verifica las políticas RLS en Supabase')
    console.log('   4. Consulta MIGRACION-SUPABASE.md para más detalles')
    process.exit(1)
  }
}

main()
