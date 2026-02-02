import type { Venta, ResumenSemanal, ResumenMensual } from './types'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const API_KEY = process.env.GOOGLE_API_KEY

// Para escribir necesitamos OAuth, pero para leer podemos usar API key
// Usaremos un enfoque con Google Apps Script Web App para escritura

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

export async function agregarVenta(venta: Omit<Venta, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'URL de Apps Script no configurada' }
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'agregarVenta',
        data: venta,
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    return { success: false, error: 'Error al conectar con Google Sheets' }
  }
}

export async function obtenerVentas(): Promise<{ success: boolean; data?: Venta[]; error?: string }> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'URL de Apps Script no configurada' }
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=obtenerVentas`, {
      method: 'GET',
    })

    const result = await response.json()
    return result
  } catch (error) {
    return { success: false, error: 'Error al obtener ventas' }
  }
}

export async function obtenerResumenSemanal(): Promise<{ success: boolean; data?: ResumenSemanal; error?: string }> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'URL de Apps Script no configurada' }
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=resumenSemanal`, {
      method: 'GET',
    })

    const result = await response.json()
    return result
  } catch (error) {
    return { success: false, error: 'Error al obtener resumen semanal' }
  }
}

export async function obtenerResumenMensual(): Promise<{ success: boolean; data?: ResumenMensual; error?: string }> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'URL de Apps Script no configurada' }
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=resumenMensual`, {
      method: 'GET',
    })

    const result = await response.json()
    return result
  } catch {
    return { success: false, error: 'Error al obtener resumen mensual' }
  }
}

export async function eliminarVenta(id: string): Promise<{ success: boolean; error?: string }> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'URL de Apps Script no configurada' }
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'eliminarVenta',
        id: id,
      }),
    })

    const result = await response.json()
    return result
  } catch {
    return { success: false, error: 'Error al eliminar venta' }
  }
}
