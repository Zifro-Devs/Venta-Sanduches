'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/calculos'
import { type ConfigNegocio, type Venta } from '@/lib/types'
import {
  AlertCircle,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react'

interface Props {
  config: ConfigNegocio
  refreshKey?: number
}

// Datos de ejemplo
const EJEMPLO_VENTAS: Venta[] = [
  {
    id: '1',
    fecha: new Date().toISOString(),
    vendedor: 'Carlos',
    cantidad: 15,
    costoDistribucion: 90000,
    ingresoVendedor: 105000,
    comisionMiguel: 15000,
    comisionJeronimo: 7500,
    domicilioTotal: 5000,
    domicilioVendedor: 2500,
    domicilioSocios: 2500,
    gananciaOperador: 0,
  },
  {
    id: '2',
    fecha: new Date(Date.now() - 3600000).toISOString(),
    vendedor: 'Maria',
    cantidad: 25,
    costoDistribucion: 150000,
    ingresoVendedor: 172500,
    comisionMiguel: 20000,
    comisionJeronimo: 12500,
    domicilioTotal: 5000,
    domicilioVendedor: 2500,
    domicilioSocios: 2500,
    gananciaOperador: 0,
  },
]

export function HistorialVentas({ config, refreshKey }: Props) {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [usandoEjemplo, setUsandoEjemplo] = useState(false)
  const [anulando, setAnulando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)

  const fetchVentas = useCallback(async () => {
    try {
      const response = await fetch('/api/ventas')
      const result = await response.json()

      if (result.success && result.data?.length > 0) {
        setVentas(result.data)
        setUsandoEjemplo(false)
      } else {
        setVentas(EJEMPLO_VENTAS)
        setUsandoEjemplo(true)
      }
    } catch {
      setVentas(EJEMPLO_VENTAS)
      setUsandoEjemplo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas, refreshKey])

  const handleAnular = async (id: string) => {
    if (usandoEjemplo) {
      // Simular anulacion en modo ejemplo
      setAnulando(id)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setVentas((prev) => prev.filter((v) => v.id !== id))
      setAnulando(null)
      setConfirmando(null)
      return
    }

    setAnulando(id)
    try {
      const response = await fetch(`/api/ventas?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setVentas((prev) => prev.filter((v) => v.id !== id))
      }
    } catch (error) {
      console.error('Error al anular venta:', error)
    } finally {
      setAnulando(null)
      setConfirmando(null)
    }
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    const hoy = new Date()
    const esHoy = date.toDateString() === hoy.toDateString()
    
    if (esHoy) {
      return `Hoy, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-2">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Ventas Recientes</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchVentas}
          className="h-9 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {usandoEjemplo && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs">Datos de ejemplo. Conecta Google Sheets para ver ventas reales.</p>
        </div>
      )}

      {ventas.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No hay ventas registradas hoy</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ventas.map((venta) => (
            <Card key={venta.id} className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Info principal */}
                  <div className="flex-1 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{venta.vendedor}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatFecha(venta.fecha)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{venta.cantidad}</span>
                      </div>
                      {venta.domicilioTotal > 0 && (
                        <div className="flex items-center gap-1 text-accent">
                          <Truck className="h-3.5 w-3.5" />
                          <span className="text-xs">Domicilio</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-chart-1/10 px-2 py-0.5 text-chart-1 font-medium">
                        {config.nombreSocio2}: {formatCurrency(venta.comisionMiguel)}
                      </span>
                      <span className="rounded bg-chart-2/10 px-2 py-0.5 text-chart-2 font-medium">
                        {config.nombreSocio3}: {formatCurrency(venta.comisionJeronimo)}
                      </span>
                    </div>
                  </div>

                  {/* Boton anular */}
                  {confirmando === venta.id ? (
                    <div className="flex flex-col border-l-2 border-destructive/20 bg-destructive/5">
                      <button
                        type="button"
                        onClick={() => handleAnular(venta.id)}
                        disabled={anulando === venta.id}
                        className="flex-1 flex items-center justify-center px-4 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        {anulando === venta.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        className="flex-1 flex items-center justify-center px-4 border-t border-destructive/20 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmando(venta.id)}
                      className="flex items-center justify-center px-4 border-l-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
