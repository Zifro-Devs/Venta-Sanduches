'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { type ConfigNegocio, type Vendedor } from '@/lib/types'
import { calcularVenta, formatCurrency } from '@/lib/calculos'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Loader2, Minus, Plus, Truck, User } from 'lucide-react'

interface Props {
  config: ConfigNegocio
  vendedores: Vendedor[]
  onVentaRegistrada?: () => void
}

export function FormularioVenta({ config, vendedores, onVentaRegistrada }: Props) {
  const [vendedorId, setVendedorId] = useState<string>('')
  const [cantidad, setCantidad] = useState<number>(10)
  const [incluyeDomicilio, setIncluyeDomicilio] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vendedorSeleccionado = vendedores.find((v) => v.id === vendedorId)
  // En el preview, si incluye domicilio mostramos 0 (valor por definir); si no, 0.
  const valorDomicilioPreview = incluyeDomicilio ? 0 : undefined
  const preview =
    vendedorSeleccionado && cantidad > 0
      ? calcularVenta(vendedorSeleccionado.nombre, cantidad, incluyeDomicilio, config, valorDomicilioPreview)
      : null

  const handleSubmit = async () => {
    if (!vendedorId || cantidad < 1) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendedorId, cantidad, incluyeDomicilio, config }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setVendedorId('')
          setCantidad(10)
          onVentaRegistrada?.()
        }, 1500)
      } else {
        setError(result.error || 'Error al registrar venta')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const incrementar = (n: number) => setCantidad((c) => c + n)
  const decrementar = (n: number) => setCantidad((c) => Math.max(1, c - n))

  return (
    <div className="space-y-4">
      {/* Selector de vendedor */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Vendedor</Label>
        <Select value={vendedorId} onValueChange={setVendedorId}>
          <SelectTrigger className="h-12 w-full rounded-xl border-2 text-base">
            <User className="h-5 w-5 text-muted-foreground" />
            <SelectValue placeholder="Selecciona un vendedor" />
          </SelectTrigger>
          <SelectContent>
            {vendedores.map((v) => (
              <SelectItem key={v.id} value={v.id} className="text-base">
                {v.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de cantidad */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-4">
          <Label className="text-base font-semibold">Cantidad</Label>
          <div className="mt-3 flex items-center justify-between gap-1">
            <div className="flex gap-1">
              <Button
                variant="outline"
                className="h-12 w-12 text-base font-bold bg-transparent p-0"
                onClick={() => decrementar(5)}
                disabled={cantidad <= 5}
              >
                -5
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 bg-transparent p-0"
                onClick={() => decrementar(1)}
                disabled={cantidad <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex h-14 min-w-[4.5rem] items-center justify-center rounded-xl bg-primary/10 px-3">
              <span className="text-2xl font-bold text-primary">{cantidad}</span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                className="h-12 w-12 bg-transparent p-0"
                onClick={() => incrementar(1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 text-base font-bold bg-transparent p-0"
                onClick={() => incrementar(5)}
              >
                +5
              </Button>
            </div>
          </div>

          {/* Botones rapidos */}
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {[10, 15, 20, 25, 30].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCantidad(n)}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  cantidad === n
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted active:bg-muted/70'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Switch domicilio */}
      <div
        className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer ${
          incluyeDomicilio ? 'border-accent bg-accent/10' : 'border-border bg-card'
        }`}
        onClick={() => setIncluyeDomicilio(!incluyeDomicilio)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              incluyeDomicilio ? 'bg-accent text-accent-foreground' : 'bg-muted'
            }`}
          >
            <Truck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold">Incluye domicilio</p>
            <p className="text-sm text-muted-foreground">El valor se define de el historial</p>
          </div>
        </div>
        <Switch 
          checked={incluyeDomicilio} 
          onCheckedChange={setIncluyeDomicilio}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</div>
      )}

      {/* Preview de calculos */}
      {preview && (
        <Card className="border-2 border-primary/30 bg-primary/5 overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-base font-bold text-primary">Resumen</h3>

            <div className="rounded-lg bg-card p-3">
              <p className="text-xs text-muted-foreground">Total venta</p>
              <p className="text-base font-bold truncate">{formatCurrency(preview.ingresoVendedor)}</p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Comisiones (menos domicilio 1/3 cada uno)</p>
              {(() => {
                const parteDomicilio = preview.domicilioSocios / 3
                const netoMiguel = preview.comisionMiguel - parteDomicilio
                const netoJeronimo = preview.comisionJeronimo - parteDomicilio
                return (
                  <>
                    <div className="rounded-lg bg-chart-1/10 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{config.nombreSocio2}</p>
                        <p className="text-base font-bold text-chart-1 ml-2">{formatCurrency(netoMiguel)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(preview.comisionMiguel)} comisión
                      </p>
                    </div>
                    <div className="rounded-lg bg-chart-2/10 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{config.nombreSocio3}</p>
                        <p className="text-base font-bold text-chart-2 ml-2">{formatCurrency(netoJeronimo)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(preview.comisionJeronimo)} comisión
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{config.nombreSocio1}</p>
                        <p className="text-base font-bold text-primary ml-2">{formatCurrency(preview.gananciaOperador)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(preview.ingresoVendedor)} total − {formatCurrency(preview.comisionMiguel)} − {formatCurrency(preview.comisionJeronimo)}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>

          </CardContent>
        </Card>
      )}

      {/* Boton de enviar */}
      <Button
        className="h-14 w-full text-base font-bold rounded-xl"
        onClick={handleSubmit}
        disabled={!vendedorId || cantidad < 1 || isSubmitting || success}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Registrado
          </>
        ) : (
          'Registrar Venta'
        )}
      </Button>
    </div>
  )
}
