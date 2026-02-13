import { NextResponse } from 'next/server'
import { obtenerUniversidades, crearUniversidad, eliminarUniversidad } from '@/lib/database'

export async function GET() {
  try {
    const result = await obtenerUniversidades()
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al obtener universidades' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nombre = (body?.nombre ?? '').toString().trim()
    if (!nombre) {
      return NextResponse.json({ success: false, error: 'Nombre de universidad requerido' }, { status: 400 })
    }
    const result = await crearUniversidad(nombre)
    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al crear universidad' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de universidad requerido' }, { status: 400 })
    }
    const result = await eliminarUniversidad(id)
    if (result.success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al eliminar universidad' },
      { status: 500 }
    )
  }
}
