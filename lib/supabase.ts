import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface VentaDB {
  id: string
  fecha: string
  vendedor_id: string
  cantidad: number
  costo_distribucion: number
  ingreso_vendedor: number
  comision_miguel: number
  comision_jeronimo: number
  domicilio_total: number
  domicilio_vendedor: number
  domicilio_socios: number
  ganancia_operador: number
  created_at?: string
  vendedores?: { nombre: string } | null
}

export interface VendedorDB {
  id: string
  nombre: string
  universidad_id: string
  telefono: string
  created_at?: string
  updated_at?: string
  universidades?: { nombre: string } | null
}

export interface ConfiguracionDB {
  id: string
  precio_distribucion: number
  precio_vendedor_primeros_20: number
  precio_vendedor_despues_20: number
  umbral_descuento: number
  comision_miguel_por_unidad: number
  limite_comision_miguel: number
  comision_jeronimo_por_unidad: number
  domicilio_total: number
  nombre_socio1: string
  nombre_socio2: string
  nombre_socio3: string
  created_at?: string
  updated_at?: string
}
