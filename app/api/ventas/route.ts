import { NextResponse } from 'next/server'
import { agregarVenta, obtenerVentasConFiltros, eliminarVenta, actualizarDomicilioVenta, obtenerVendedorPorId } from '@/lib/database'
import { calcularVenta } from '@/lib/calculos'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendedorId, cantidad, incluyeDomicilio, config } = body

    if (!vendedorId || !cantidad || cantidad < 1) {
      return NextResponse.json(
        { success: false, error: 'Vendedor y cantidad requeridos' },
        { status: 400 }
      )
    }

    const vendedorResult = await obtenerVendedorPorId(vendedorId)
    if (!vendedorResult.success || !vendedorResult.nombre) {
      return NextResponse.json(
        { success: false, error: 'Vendedor no encontrado' },
        { status: 400 }
      )
    }

    // Al registrar, si incluye domicilio se guarda 0; el valor se edita al día siguiente en el historial.
    const valorDomicilio = incluyeDomicilio ? 0 : undefined
    const datosVenta = calcularVenta(vendedorResult.nombre, cantidad, incluyeDomicilio ?? true, config, valorDomicilio)
    const venta = {
      ...datosVenta,
      vendedorId,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaDesde = searchParams.get('fechaDesde') ?? undefined
    const fechaHasta = searchParams.get('fechaHasta') ?? undefined
    const vendedorId = searchParams.get('vendedorId') ?? undefined

    const result = await obtenerVentasConFiltros({
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      vendedorId: vendedorId || undefined,
    })

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    }
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, domicilioTotal } = body

    if (!id || typeof domicilioTotal !== 'number' || domicilioTotal < 0) {
      return NextResponse.json(
        { success: false, error: 'ID de venta y domicilioTotal (número >= 0) requeridos' },
        { status: 400 }
      )
    }

    const result = await actualizarDomicilioVenta(id, domicilioTotal)

    if (result.success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
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
