'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/calculos'
import { type ConfigNegocio } from '@/lib/types'
import type { ResumenMensual as ResumenMensualType } from '@/lib/types'
import { CalendarDays, DollarSign, Filter, Package, TrendingUp, Truck } from 'lucide-react'

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface Props {
  config: ConfigNegocio
}

const EJEMPLO_RESUMEN: ResumenMensualType = {
  mes: 'Febrero 2026',
  totalFacturado: 0,
  totalSandwiches: 0,
  comisionMiguel: 0,
  comisionJeronimo: 0,
  domicilioTotal: 0,
  gananciaOperador: 0,
}

export function ResumenMensual({ config }: Props) {
  const [resumen, setResumen] = useState<ResumenMensualType | null>(null)
  const [loading, setLoading] = useState(true)
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('')

  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date()
    return toDateInputValue(new Date(d.getFullYear(), d.getMonth(), 1))
  })
  const [fechaHasta, setFechaHasta] = useState(() => toDateInputValue(new Date()))

  const [appliedFechaDesde, setAppliedFechaDesde] = useState(() => {
    const d = new Date()
    return toDateInputValue(new Date(d.getFullYear(), d.getMonth(), 1))
  })
  const [appliedFechaHasta, setAppliedFechaHasta] = useState(() => toDateInputValue(new Date()))

  const fetchResumen = useCallback(async (mes?: string) => {
    setLoading(true)
    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
      let url: string

      if (mes && appsScriptUrl) {
        url = `${appsScriptUrl}?action=resumenMensual&mes=${encodeURIComponent(mes)}`
      } else {
        const params = new URLSearchParams({ tipo: 'mensual' })
        if (appliedFechaDesde) params.set('fechaDesde', appliedFechaDesde)
        if (appliedFechaHasta) params.set('fechaHasta', appliedFechaHasta)
        url = `/api/resumenes?${params.toString()}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        setResumen(result.data)
      }
    } catch (error) {
      console.error('Error al obtener resumen:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedFechaDesde, appliedFechaHasta])

  useEffect(() => {
    if (mesSeleccionado) {
      setLoading(true)
      const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
      if (appsScriptUrl) {
        fetch(`${appsScriptUrl}?action=resumenMensual&mes=${encodeURIComponent(mesSeleccionado)}`)
          .then((r) => r.json())
          .then((result) => {
            if (result.success && result.data) setResumen(result.data)
          })
          .catch((e) => console.error('Error al obtener resumen:', e))
          .finally(() => setLoading(false))
      } else {
        fetchResumen()
      }
    } else {
      fetchResumen()
    }
  }, [mesSeleccionado, appliedFechaDesde, appliedFechaHasta, fetchResumen])

  const aplicarFiltros = () => {
    setAppliedFechaDesde(fechaDesde)
    setAppliedFechaHasta(fechaHasta)
  }

  const handleMesChange = (mes: string) => {
    setMesSeleccionado(mes)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-2">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    )
  }

  if (!resumen) {
    setResumen(EJEMPLO_RESUMEN)
  }

  return (
    <div className="space-y-4">


      {/* Filtro por rango de fechas (como en historial) */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Rango de fechas
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="grid gap-3 sm:grid-cols-2 flex-1 min-w-0">
              <div className="space-y-1.5">
                <Label className="text-xs">Desde</Label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hasta</Label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={aplicarFiltros}
              className="shrink-0 gap-2 h-10"
            >
              <Filter className="h-4 w-4" />
              Aplicar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header del mes / rango - más pequeño */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
        <CalendarDays className="h-4 w-4" />
        <span className="text-sm font-semibold">{resumen?.mes || 'Cargando...'}</span>
      </div>

      {/* Metricas - súper compactas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg border p-2 bg-card">
          <DollarSign className="h-4 w-4 text-chart-1" />
          <div>
            <p className="text-xs text-muted-foreground">Facturado</p>
            <p className="text-sm font-bold">{formatCurrency(resumen?.totalFacturado || 0)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border p-2 bg-card">
          <Package className="h-4 w-4 text-chart-2" />
          <div>
            <p className="text-xs text-muted-foreground">Sandwiches</p>
            <p className="text-sm font-bold">{resumen?.totalSandwiches || 0}</p>
          </div>
        </div>
      </div>

      {/* Comisiones del Mes: total domicilios + comisión menos domicilio por socio (Miguel, Jerónimo, Mildrey) */}
      <div className="rounded-lg border p-3 bg-card">
        <h3 className="text-sm font-bold mb-3">Comisiones del Mes</h3>

        <div className="flex items-center justify-between text-sm mb-3 pb-2 border-b">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Total domicilios
          </span>
          <span className="font-bold text-destructive">{formatCurrency(resumen?.domicilioTotal || 0)}</span>
        </div>

        <div className="space-y-2">
          {(() => {
            const domicilioTotal = resumen?.domicilioTotal || 0
            const parteDomicilioPorSocio = domicilioTotal / 6
            const comisionMiguel = resumen?.comisionMiguel || 0
            const comisionJeronimo = resumen?.comisionJeronimo || 0
            const gananciaOperador = resumen?.gananciaOperador || 0
            const comisionMildrey = gananciaOperador + parteDomicilioPorSocio
            const netoMiguel = comisionMiguel - parteDomicilioPorSocio
            const netoJeronimo = comisionJeronimo - parteDomicilioPorSocio
            const netoMildrey = gananciaOperador
            const totalNeto = netoMiguel + netoJeronimo + netoMildrey
            return (
              <>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-chart-1" />
                      {config.nombreSocio2}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-500">{formatCurrency(comisionMiguel)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-5">
                    <span>− Domicilio (1/6)</span>
                    <span className="text-destructive">−{formatCurrency(parteDomicilioPorSocio)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium pl-5">
                    <span>Neto</span>
                    <span className="text-green-600 dark:text-green-500">{formatCurrency(netoMiguel)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-chart-2" />
                      {config.nombreSocio3}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-500">{formatCurrency(comisionJeronimo)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-5">
                    <span>− Domicilio (1/6)</span>
                    <span className="text-destructive">−{formatCurrency(parteDomicilioPorSocio)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium pl-5">
                    <span>Neto</span>
                    <span className="text-green-600 dark:text-green-500">{formatCurrency(netoJeronimo)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      {config.nombreSocio1}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-500">{formatCurrency(comisionMildrey)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-5">
                    <span>− Domicilio (1/6)</span>
                    <span className="text-destructive">−{formatCurrency(parteDomicilioPorSocio)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium pl-5">
                    <span>Neto</span>
                    <span className="text-green-600 dark:text-green-500">{formatCurrency(netoMildrey)}</span>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
