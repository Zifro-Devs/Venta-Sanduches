'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorMes } from '@/components/selector-mes'
import { formatCurrency } from '@/lib/calculos'
import { type ConfigNegocio } from '@/lib/types'
import type { ResumenMensual as ResumenMensualType } from '@/lib/types'
import { CalendarDays, DollarSign, Package, TrendingUp, Truck, AlertCircle } from 'lucide-react'

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

  const fetchResumen = async (mes?: string) => {
    setLoading(true)
    try {
      let url: string
      const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
      
      if (mes && appsScriptUrl) {
        url = `${appsScriptUrl}?action=resumenMensual&mes=${encodeURIComponent(mes)}`
      } else {
        url = '/api/resumenes?tipo=mensual'
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
  }

  useEffect(() => {
    if (mesSeleccionado) {
      fetchResumen(mesSeleccionado)
    } else {
      fetchResumen()
    }
  }, [mesSeleccionado])

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
      {/* Selector de mes */}
      <SelectorMes 
        mesSeleccionado={mesSeleccionado} 
        onMesChange={handleMesChange} 
      />

      {/* Header del mes - más pequeño */}
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

      {/* Comisiones - más espacioso */}
      <div className="rounded-lg border p-3 bg-card">
        <h3 className="text-sm font-bold mb-3">Comisiones del Mes</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-1" />
              {config.nombreSocio2}
            </span>
            <span className="font-bold text-chart-1">{formatCurrency(resumen?.comisionMiguel || 0)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              {config.nombreSocio3}
            </span>
            <span className="font-bold text-chart-2">{formatCurrency(resumen?.comisionJeronimo || 0)}</span>
          </div>

          <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatCurrency((resumen?.comisionMiguel || 0) + (resumen?.comisionJeronimo || 0))}</span>
          </div>
        </div>
      </div>

      {/* Domicilios - súper compacto */}
      <div className="flex items-center gap-2 rounded-lg border p-2 bg-card">
        <Truck className="h-4 w-4 text-accent" />
        <div>
          <p className="text-xs text-muted-foreground">Domicilios</p>
          <p className="text-sm font-bold">{formatCurrency(resumen?.domicilioTotal || 0)}</p>
        </div>
      </div>

      {/* Resumen - más espacioso */}
      <div className="rounded-lg border border-accent p-3 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold">Resumen</h3>
        </div>

        <div className="space-y-1.5 text-sm rounded-lg bg-muted/50 p-3 mb-3">
          <div className="flex justify-between">
            <span>Facturado</span>
            <span className="font-medium">{formatCurrency(resumen?.totalFacturado || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>- Comisiones</span>
            <span className="font-medium text-destructive">
              -{formatCurrency((resumen?.comisionMiguel || 0) + (resumen?.comisionJeronimo || 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>- Domicilios (1/6)</span>
            <span className="font-medium text-destructive">-{formatCurrency((resumen?.domicilioTotal || 0) / 6)}</span>
          </div>
        </div>

        <div className="rounded-lg bg-accent p-3 text-accent-foreground text-center">
          <p className="text-xs opacity-80">Tu Ganancia</p>
          <p className="text-base font-bold">{formatCurrency(resumen?.gananciaOperador || 0)}</p>
        </div>
      </div>
    </div>
  )
}
