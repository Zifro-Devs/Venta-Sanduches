'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/calculos'
import { type ConfigNegocio, type Venta, type Vendedor } from '@/lib/types'
import {
  AlertCircle,
  Calendar,
  Clock,
  Filter,
  Loader2,
  Package,
  Pencil,
  RotateCcw,
  Trash2,
  Truck,
  User,
} from 'lucide-react'

interface Props {
  config: ConfigNegocio
  vendedores: Vendedor[]
  refreshKey?: number
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Datos de ejemplo
const EJEMPLO_VENTAS: Venta[] = [
  {
    id: '1',
    fecha: new Date().toISOString(),
    vendedorId: 'ejemplo-1',
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
    vendedorId: 'ejemplo-2',
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

export function HistorialVentas({ config, vendedores, refreshKey }: Props) {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [usandoEjemplo, setUsandoEjemplo] = useState(false)
  const [anulando, setAnulando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [editingDomicilio, setEditingDomicilio] = useState<{ ventaId: string; valor: string } | null>(null)
  const [guardandoDomicilio, setGuardandoDomicilio] = useState(false)
  const [errorDomicilio, setErrorDomicilio] = useState<string | null>(null)

  const hoy = useMemo(() => new Date(), [])
  const hace30 = useMemo(() => {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 30)
    return d
  }, [hoy])

  const [fechaDesde, setFechaDesde] = useState(() => toDateInputValue(hace30))
  const [fechaHasta, setFechaHasta] = useState(() => toDateInputValue(hoy))
  const [filtroVendedorId, setFiltroVendedorId] = useState<string>('')

  const [appliedFechaDesde, setAppliedFechaDesde] = useState(() => toDateInputValue(hace30))
  const [appliedFechaHasta, setAppliedFechaHasta] = useState(() => toDateInputValue(hoy))
  const [appliedFiltroVendedorId, setAppliedFiltroVendedorId] = useState<string>('')

  const fetchVentas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (appliedFechaDesde) params.set('fechaDesde', appliedFechaDesde)
      if (appliedFechaHasta) params.set('fechaHasta', appliedFechaHasta)
      if (appliedFiltroVendedorId) params.set('vendedorId', appliedFiltroVendedorId)
      const url = params.toString() ? `/api/ventas?${params.toString()}` : '/api/ventas'
      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        setVentas(Array.isArray(result.data) ? result.data : [])
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
  }, [appliedFechaDesde, appliedFechaHasta, appliedFiltroVendedorId])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas, refreshKey])

  const aplicarFiltros = () => {
    setAppliedFechaDesde(fechaDesde)
    setAppliedFechaHasta(fechaHasta)
    setAppliedFiltroVendedorId(filtroVendedorId)
  }

  const handleGuardarDomicilio = async () => {
    if (!editingDomicilio) return
    const valor = Math.round(Number(editingDomicilio.valor) || 0)
    if (valor < 0) {
      setErrorDomicilio('El valor debe ser mayor o igual a 0')
      return
    }
    setErrorDomicilio(null)
    setGuardandoDomicilio(true)
    try {
      const response = await fetch('/api/ventas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingDomicilio.ventaId, domicilioTotal: valor }),
      })
      const result = await response.json()
      if (result.success) {
        setEditingDomicilio(null)
        await fetchVentas()
      } else {
        setErrorDomicilio(result.error || 'Error al guardar')
      }
    } catch {
      setErrorDomicilio('Error de conexión')
    } finally {
      setGuardandoDomicilio(false)
    }
  }

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
    const hoyRef = new Date()
    const esHoy = date.toDateString() === hoyRef.toDateString()
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

  const ventasFiltradas = ventas

  const hayFiltrosActivos = appliedFechaDesde || appliedFechaHasta || appliedFiltroVendedorId
  const nombreVendedorFiltro = appliedFiltroVendedorId ? vendedores.find((v) => v.id === appliedFiltroVendedorId)?.nombre : null

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
        <Button variant="ghost" size="sm" onClick={fetchVentas} className="h-9 gap-2">
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-1.5 sm:col-span-2 flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 min-w-0 space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Vendedor
                </Label>
                <select
                  value={filtroVendedorId}
                  onChange={(e) => setFiltroVendedorId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos los vendedores</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
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
          </div>
          {hayFiltrosActivos && (
            <div className="border-t border-border/60 pt-2 mt-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1.5">Filtros aplicados</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {(appliedFechaDesde || appliedFechaHasta) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {appliedFechaDesde && appliedFechaHasta ? `${appliedFechaDesde} → ${appliedFechaHasta}` : appliedFechaDesde || appliedFechaHasta}
                  </span>
                )}
                {nombreVendedorFiltro && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {nombreVendedorFiltro}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {usandoEjemplo && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-blue-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs">Datos de ejemplo. Configura Supabase para ver ventas reales.</p>
        </div>
      )}

      {ventasFiltradas.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {hayFiltrosActivos
                ? 'No hay ventas con los filtros aplicados'
                : 'No hay ventas en el historial'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ventasFiltradas.map((venta) => (
            <Card key={venta.id} className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0 p-3 space-y-2">
                    {/* Fila 1: badges comisiones en un renglón completo (menos domicilio 1/3 cada uno) */}
                    {(() => {
                      const parteDomicilio = venta.domicilioSocios / 3
                      const netoMiguel = venta.comisionMiguel - parteDomicilio
                      const netoJeronimo = venta.comisionJeronimo - parteDomicilio
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded bg-chart-1/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-1">
                            {config.nombreSocio2}: {formatCurrency(netoMiguel)}
                          </span>
                          <span className="rounded bg-chart-2/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-2">
                            {config.nombreSocio3}: {formatCurrency(netoJeronimo)}
                          </span>
                          <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:text-yellow-200">
                            {config.nombreSocio1}: {formatCurrency(venta.gananciaOperador)}
                          </span>
                        </div>
                      )
                    })()}
                    {/* Fila 2: nombre + total del pedido */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <p className="font-semibold text-sm truncate">{venta.vendedor}</p>
                      </div>
                      <p className="text-sm font-bold text-primary shrink-0" title="Total del pedido">
                        {formatCurrency(venta.ingresoVendedor)}
                      </p>
                    </div>

                    {/* Fila 3: fecha y cantidad */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatFecha(venta.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {venta.cantidad} ud.
                      </span>
                    </div>
                    {/* Fila 4: domicilio, editar domicilio y caneca en el mismo renglón */}
                    <div className="flex flex-nowrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground min-w-0">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Truck className="h-3 w-3" />
                        <span className="font-medium text-foreground">{formatCurrency(venta.domicilioTotal)}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary shrink-0 whitespace-nowrap"
                        onClick={() => {
                          setErrorDomicilio(null)
                          setEditingDomicilio({ ventaId: venta.id, valor: String(venta.domicilioTotal) })
                        }}
                      >
                        <Pencil className="h-3 w-3 shrink-0 mr-1" />
                        <span className="hidden sm:inline">Editar valor de domicilio</span>
                        <span className="sm:hidden">Editar domicilio</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(venta.id)}
                        className="ml-auto flex shrink-0 items-center justify-center rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal editar valor de domicilio */}
      <Dialog open={!!editingDomicilio} onOpenChange={(open) => !open && setEditingDomicilio(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar valor de domicilio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="domicilio-valor">Valor (COP)</Label>
              <Input
                id="domicilio-valor"
                type="number"
                min={0}
                step={100}
                value={editingDomicilio?.valor ?? ''}
                onChange={(e) =>
                  editingDomicilio &&
                  setEditingDomicilio({ ...editingDomicilio, valor: e.target.value })
                }
              />
            </div>
            {errorDomicilio && (
              <p className="text-sm text-destructive">{errorDomicilio}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDomicilio(null)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarDomicilio} disabled={guardandoDomicilio}>
              {guardandoDomicilio ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación de anulación */}
      <Dialog open={!!confirmando} onOpenChange={(open) => !open && setConfirmando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Anular esta venta?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Esta acción <span className="font-semibold text-destructive">no se puede deshacer</span>. 
              Se eliminará el registro de la venta del historial.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmando && handleAnular(confirmando)}
              disabled={!!anulando}
            >
              {anulando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anulando...
                </>
              ) : (
                'Sí, anular venta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
