import { NextResponse } from 'next/server'
import { obtenerConfiguracion, guardarConfiguracion } from '@/lib/database'

export async function GET() {
  try {
    const result = await obtenerConfiguracion()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await guardarConfiguracion(body.config)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}