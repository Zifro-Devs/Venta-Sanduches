import { NextResponse } from 'next/server'
import { obtenerResumenSemanal, obtenerResumenMensual, obtenerResumenPorRangoFechas } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') || 'semanal'
  const fechaDesde = searchParams.get('fechaDesde') ?? undefined
  const fechaHasta = searchParams.get('fechaHasta') ?? undefined

  try {
    if (tipo === 'semanal') {
      const result = await obtenerResumenSemanal()
      if (result.success) {
        return NextResponse.json({ success: true, data: result.data })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }
    } else if (tipo === 'mensual') {
      const result =
        fechaDesde && fechaHasta
          ? await obtenerResumenPorRangoFechas(fechaDesde, fechaHasta)
          : await obtenerResumenMensual()
      if (result.success) {
        return NextResponse.json({ success: true, data: result.data })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de resumen no válido' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
