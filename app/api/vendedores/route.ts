import { NextResponse } from 'next/server'
import { obtenerVendedores, crearVendedor, eliminarVendedor } from '@/lib/database'
import type { VendedorInfo } from '@/lib/types'

export async function GET() {
  try {
    const result = await obtenerVendedores()
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al obtener vendedores' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, universidad, telefono } = body as VendedorInfo
    if (!nombre?.trim()) {
      return NextResponse.json({ success: false, error: 'Nombre requerido' }, { status: 400 })
    }
    const result = await crearVendedor({
      nombre: nombre.trim(),
      universidad: universidad ?? 'U Nacional',
      telefono: telefono ?? '',
    })
    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al crear vendedor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de vendedor requerido' }, { status: 400 })
    }
    const result = await eliminarVendedor(id)
    if (result.success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al eliminar vendedor' },
      { status: 500 }
    )
  }
}
