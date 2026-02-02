'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { type ConfigNegocio } from '@/lib/types'
import { calcularVenta, formatCurrency } from '@/lib/calculos'
import { Check, Loader2, Minus, Plus, Truck, User } from 'lucide-react'

interface Props {
  config: ConfigNegocio
  onVentaRegistrada?: () => void
}

export function FormularioVenta({ config, onVentaRegistrada }: Props) {
  const [vendedor, setVendedor] = useState<string>('')
  const [cantidad, setCantidad] = useState<number>(10)
  const [incluyeDomicilio, setIncluyeDomicilio] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = vendedor && cantidad > 0 ? calcularVenta(vendedor, cantidad, incluyeDomicilio, config) : null

  const handleSubmit = async () => {
    if (!vendedor || cantidad < 1) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendedor, cantidad, incluyeDomicilio, config }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setVendedor('')
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
        <div className="grid grid-cols-3 gap-2">
          {config.vendedores.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVendedor(v)}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                vendedor === v
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card active:bg-muted'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  vendedor === v ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <User className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium truncate w-full text-center ${vendedor === v ? 'text-primary' : ''}`}>
                {v}
              </span>
              {vendedor === v && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
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
            <p className="text-base font-semibold">Domicilio</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(config.domicilioTotal)}</p>
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

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-card p-3">
                <p className="text-xs text-muted-foreground">Vendedor paga</p>
                <p className="text-base font-bold truncate">{formatCurrency(preview.ingresoVendedor)}</p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <p className="text-xs text-muted-foreground">Tu costo</p>
                <p className="text-base font-bold truncate">{formatCurrency(preview.costoDistribucion)}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Comisiones</p>
              <div className="flex items-center justify-between rounded-lg bg-chart-1/10 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{config.nombreSocio2}</p>
                  <p className="text-xs text-muted-foreground">{Math.min(cantidad, config.limiteComisionMiguel)} ud.</p>
                </div>
                <p className="text-base font-bold text-chart-1 ml-2">{formatCurrency(preview.comisionMiguel)}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-chart-2/10 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{config.nombreSocio3}</p>
                  <p className="text-xs text-muted-foreground">{cantidad} ud.</p>
                </div>
                <p className="text-base font-bold text-chart-2 ml-2">{formatCurrency(preview.comisionJeronimo)}</p>
              </div>
            </div>

            {incluyeDomicilio && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between rounded-lg bg-accent/10 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Tu parte domicilio</p>
                    <p className="text-xs text-muted-foreground">1/3 del 50%</p>
                  </div>
                  <p className="text-base font-bold text-accent ml-2">{formatCurrency(preview.domicilioSocios / 3)}</p>
                </div>
              </>
            )}

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between rounded-xl bg-primary p-4 text-primary-foreground">
              <span className="font-semibold">Tu ganancia</span>
              <span className="text-lg font-bold">{formatCurrency(preview.gananciaOperador)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boton de enviar */}
      <Button
        className="h-14 w-full text-base font-bold rounded-xl"
        onClick={handleSubmit}
        disabled={!vendedor || cantidad < 1 || isSubmitting || success}
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
