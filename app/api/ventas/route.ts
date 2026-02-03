import { NextResponse } from 'next/server'
import { agregarVenta, obtenerVentas, eliminarVenta } from '@/lib/database'
import { calcularVenta } from '@/lib/calculos'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendedor, cantidad, incluyeDomicilio } = body

    if (!vendedor || !cantidad || cantidad < 1) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const datosVenta = calcularVenta(vendedor, cantidad, incluyeDomicilio ?? true)
    const venta = {
      ...datosVenta,
      fecha: new Date().toISOString(),
    }

    const result = await agregarVenta(venta)

    if (result.success) {
      return NextResponse.json({ success: true, venta: { ...venta, id: result.id } })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await obtenerVentas()
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de venta requerido' },
        { status: 400 }
      )
    }

    const result = await eliminarVenta(id)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
