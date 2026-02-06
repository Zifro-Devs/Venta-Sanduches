'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/calculos'
import { type ConfigNegocio } from '@/lib/types'
import type { ResumenSemanal as ResumenSemanalType } from '@/lib/types'
import { Calendar, Package, TrendingUp, Truck, User, AlertCircle } from 'lucide-react'

interface Props {
  config: ConfigNegocio
}

const EJEMPLO_RESUMEN: ResumenSemanalType = {
  semana: '5',
  fechaInicio: '2026-01-27',
  fechaFin: '2026-02-02',
  totalVentas: 450000,
  totalSandwiches: 65,
  comisionMiguel: 20000,
  comisionJeronimo: 32500,
  domicilioTotal: 25000,
  domicilioSocios: 12500,
  gananciaOperador: 85000,
  ventasPorVendedor: {
    Carlos: { cantidad: 25, total: 175000 },
    Maria: { cantidad: 22, total: 154000 },
    Pedro: { cantidad: 18, total: 121000 },
  },
}

export function ResumenSemanal({ config }: Props) {
  const [resumen, setResumen] = useState<ResumenSemanalType | null>(null)
  const [loading, setLoading] = useState(true)
  const [usandoEjemplo, setUsandoEjemplo] = useState(false)

  useEffect(() => {
    async function fetchResumen() {
      try {
        const response = await fetch('/api/resumenes?tipo=semanal')
        const result = await response.json()

        if (result.success && result.data) {
          setResumen(result.data)
        } else {
          setResumen(EJEMPLO_RESUMEN)
          setUsandoEjemplo(true)
        }
      } catch {
        setResumen(EJEMPLO_RESUMEN)
        setUsandoEjemplo(true)
      } finally {
        setLoading(false)
      }
    }

    fetchResumen()
  }, [])

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

  if (!resumen) return null

  return (
    <div className="space-y-4">
      {usandoEjemplo && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-blue-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs">Datos de ejemplo. Configura Supabase para ver datos reales.</p>
        </div>
      )}

      {/* Header */}
      <Card className="border-2 border-primary bg-primary overflow-hidden">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground min-w-0 flex-1">
            <p className="text-xs opacity-80">Semana {resumen.semana}</p>
            <p className="text-base font-bold truncate">
              {new Date(resumen.fechaInicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} -{' '}
              {new Date(resumen.fechaFin).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metricas */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-2 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-1/10">
              <Package className="h-4 w-4 text-chart-1" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Sandwiches</p>
            <p className="text-xl font-bold">{resumen.totalSandwiches}</p>
          </CardContent>
        </Card>

        <Card className="border-2 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/10">
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Ventas</p>
            <p className="text-lg font-bold truncate">{formatCurrency(resumen.totalVentas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Comisiones */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-base font-bold">Comisiones</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-chart-1/10 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{config.nombreSocio2}</p>
                <p className="text-xs text-muted-foreground">Max {config.limiteComisionMiguel}/pedido</p>
              </div>
              <p className="text-base font-bold text-chart-1 ml-2">{formatCurrency(resumen.comisionMiguel)}</p>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-chart-2/10 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{config.nombreSocio3}</p>
                <p className="text-xs text-muted-foreground">Todas las unidades</p>
              </div>
              <p className="text-base font-bold text-chart-2 ml-2">{formatCurrency(resumen.comisionJeronimo)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <p className="font-semibold text-sm">Total</p>
            <p className="text-base font-bold">{formatCurrency(resumen.comisionMiguel + resumen.comisionJeronimo)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Domicilios */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Truck className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-base font-bold">Domicilios</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatCurrency(resumen.domicilioTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendedores</span>
              <span className="font-medium">{formatCurrency(resumen.domicilioTotal / 2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">{config.nombreSocio1} parte</span>
              <span className="font-bold">{formatCurrency(resumen.domicilioSocios / 3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ventas por vendedor */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-base font-bold">Por Vendedor</h3>

          <div className="space-y-2">
            {Object.entries(resumen.ventasPorVendedor).map(([nombre, datos]) => (
              <div key={nombre} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{nombre}</p>
                    <p className="text-xs text-muted-foreground">{datos.cantidad} ud.</p>
                  </div>
                </div>
                <p className="text-base font-bold ml-2">{formatCurrency(datos.total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ganancia */}
      <Card className="border-2 border-accent bg-accent/10 overflow-hidden">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{config.nombreSocio1} Ganancia</p>
          <p className="mt-1 text-2xl font-bold text-accent">{formatCurrency(resumen.gananciaOperador)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
