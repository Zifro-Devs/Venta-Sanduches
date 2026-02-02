import { NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

export async function GET() {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, error: 'URL de Apps Script no configurada' },
        { status: 500 }
      )
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?action=obtenerConfiguracion`)
    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, error: 'URL de Apps Script no configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'guardarConfiguracion',
        config: body.config
      })
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}