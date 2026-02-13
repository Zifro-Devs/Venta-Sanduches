'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ConfigNegocio, type Vendedor, type VendedorInfo, type UniversidadEntity, UNIVERSIDADES } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Check, Plus, Trash2, User, DollarSign, Users, ChevronDown, ChevronUp, Phone, GraduationCap } from 'lucide-react'

interface Props {
  config: ConfigNegocio
  vendedores: Vendedor[]
  universidades: UniversidadEntity[]
  onConfigChange: (config: Partial<ConfigNegocio>) => void
  onAddVendedor: (vendedor: VendedorInfo) => void
  onRemoveVendedor: (id: string) => void
  onAddUniversidad: (nombre: string) => void
  onRemoveUniversidad: (id: string) => void
}

export function GestionNegocio({ config, vendedores, universidades, onConfigChange, onAddVendedor, onRemoveVendedor, onAddUniversidad, onRemoveUniversidad }: Props) {
  const [nuevoVendedor, setNuevoVendedor] = useState('')
  const [nuevaUniversidad, setNuevaUniversidad] = useState<string>('U Nacional')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoNombreUniversidad, setNuevoNombreUniversidad] = useState('')
  const [showPrecios, setShowPrecios] = useState(false)
  const [showComisiones, setShowComisiones] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<{ tipo: 'universidad' | 'vendedor'; id: string; nombre: string } | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // Estados locales para edición
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})

  const listaUniversidades = universidades.length > 0 ? universidades.map((u) => u.nombre) : [...UNIVERSIDADES]
  const universidadDefault = listaUniversidades[0] ?? 'U Nacional'

  const handleAddUniversidad = () => {
    if (nuevoNombreUniversidad.trim()) {
      onAddUniversidad(nuevoNombreUniversidad.trim())
      setNuevoNombreUniversidad('')
      showSaved('universidad')
    }
  }

  const handleAddVendedor = () => {
    if (nuevoVendedor.trim()) {
      onAddVendedor({
        nombre: nuevoVendedor.trim(),
        universidad: nuevaUniversidad || universidadDefault,
        telefono: nuevoTelefono.trim(),
      })
      setNuevoVendedor('')
      setNuevaUniversidad(universidadDefault)
      setNuevoTelefono('')
      showSaved('vendedor')
    }
  }

  const showSaved = (key: string) => {
    setSaved(key)
    setTimeout(() => setSaved(null), 1500)
  }

  const handleConfirmarEliminar = async () => {
    if (!confirmandoEliminar) return
    setEliminando(true)
    try {
      if (confirmandoEliminar.tipo === 'universidad') {
        await onRemoveUniversidad(confirmandoEliminar.id)
      } else {
        await onRemoveVendedor(confirmandoEliminar.id)
      }
      setConfirmandoEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  // Función para iniciar edición
  const startEditing = (key: keyof ConfigNegocio, currentValue: number | string) => {
    setEditingValues(prev => ({
      ...prev,
      [key]: currentValue.toString()
    }))
  }

  // Función para manejar cambios mientras se edita
  const handleEditChange = (key: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Función para guardar cuando termina la edición
  const finishEditing = (key: keyof ConfigNegocio) => {
    const value = editingValues[key]
    if (value !== undefined) {
      // Si es un número, convertir y validar
      if (typeof config[key] === 'number') {
        const num = parseInt(value.replace(/\D/g, ''), 10)
        if (!isNaN(num) && num >= 0) {
          onConfigChange({ [key]: num })
          showSaved(key)
        }
      } else {
        // Si es string, guardar directamente
        onConfigChange({ [key]: value })
        showSaved(key)
      }
    }
    
    // Limpiar estado de edición
    setEditingValues(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  // Función para cancelar edición
  const cancelEditing = (key: string) => {
    setEditingValues(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  // Función para obtener el valor a mostrar
  const getDisplayValue = (key: keyof ConfigNegocio): string => {
    if (editingValues[key] !== undefined) {
      return editingValues[key]
    }
    const value = config[key]
    return typeof value === 'number' ? value.toLocaleString('es-CO') : value.toString()
  }

  return (
    <div className="space-y-4">
      {/* Universidades */}
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-primary/5 p-4 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            Universidades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {universidades.map((u) => (
              <div
                key={u.id}
                className="group flex items-center gap-1.5 rounded-full bg-secondary pl-3 pr-1 py-1 text-sm font-medium"
              >
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate max-w-[120px]">{u.nombre}</span>
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar({ tipo: 'universidad', id: u.id, nombre: u.nombre })}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border-2 border-dashed border-muted p-3">
            <p className="text-sm font-medium text-muted-foreground">Nueva universidad</p>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Nombre de la universidad"
                value={nuevoNombreUniversidad}
                onChange={(e) => setNuevoNombreUniversidad(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUniversidad()}
                className="h-11 flex-1 min-w-[180px] text-base"
              />
              <Button
                onClick={handleAddUniversidad}
                disabled={!nuevoNombreUniversidad.trim()}
                className="h-11"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            {saved === 'universidad' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-accent" />
                Universidad agregada
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendedores */}
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-primary/5 p-4 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {vendedores.map((v) => (
              <div
                key={v.id}
                className="group flex items-center gap-1.5 rounded-full bg-secondary pl-3 pr-1 py-1 text-sm font-medium"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate max-w-[80px]">{v.nombre}</span>
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar({ tipo: 'vendedor', id: v.id, nombre: v.nombre })}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border-2 border-dashed border-muted p-3">
            <p className="text-sm font-medium text-muted-foreground">Nuevo vendedor</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input
                  placeholder="Nombre del vendedor"
                  value={nuevoVendedor}
                  onChange={(e) => setNuevoVendedor(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVendedor()}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Universidad
                </Label>
                <Select value={nuevaUniversidad || universidadDefault} onValueChange={(v) => setNuevaUniversidad(v)}>
                  <SelectTrigger className="h-11 w-full text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {listaUniversidades.map((u) => (
                      <SelectItem key={u} value={u} className="text-base">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Número de teléfono
                </Label>
                <Input
                  placeholder="Ej: 300 123 4567"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVendedor()}
                  className="h-11 text-base"
                  inputMode="tel"
                />
              </div>
            </div>
            <Button
              onClick={handleAddVendedor}
              disabled={!nuevoVendedor.trim()}
              className="h-11 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar vendedor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Precios Sandwiches */}
      <Card className="overflow-hidden border-2">
        <button
          type="button"
          onClick={() => setShowPrecios(!showPrecios)}
          className="w-full text-left"
        >
          <CardHeader className="bg-chart-4/10 p-4">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-4/20">
                  <DollarSign className="h-4 w-4 text-chart-4" />
                </div>
                Precios
              </div>
              {showPrecios ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </button>
        {showPrecios && (
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">{config.nombreSocio1} ingreso (distribución)</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('precioDistribucion')}
                  onFocus={() => startEditing('precioDistribucion', config.precioDistribucion)}
                  onChange={(e) => handleEditChange('precioDistribucion', e.target.value)}
                  onBlur={() => finishEditing('precioDistribucion')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('precioDistribucion')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('precioDistribucion')
                      e.currentTarget.blur()
                    }
                  }}
                  className="h-11 text-base font-semibold"
                  placeholder="Precio de distribución"
                />
                {saved === 'precioDistribucion' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Vendedor (primeros 20)</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('precioVendedorPrimeros20')}
                  onFocus={() => startEditing('precioVendedorPrimeros20', config.precioVendedorPrimeros20)}
                  onChange={(e) => handleEditChange('precioVendedorPrimeros20', e.target.value)}
                  onBlur={() => finishEditing('precioVendedorPrimeros20')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('precioVendedorPrimeros20')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('precioVendedorPrimeros20')
                      e.currentTarget.blur()
                    }
                  }}
                  className="h-11 text-base font-semibold"
                  placeholder="Precio primeros 20"
                />
                {saved === 'precioVendedorPrimeros20' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Vendedor (despues 20)</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('precioVendedorDespues20')}
                  onFocus={() => startEditing('precioVendedorDespues20', config.precioVendedorDespues20)}
                  onChange={(e) => handleEditChange('precioVendedorDespues20', e.target.value)}
                  onBlur={() => finishEditing('precioVendedorDespues20')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('precioVendedorDespues20')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('precioVendedorDespues20')
                      e.currentTarget.blur()
                    }
                  }}
                  className="h-11 text-base font-semibold"
                  placeholder="Precio después de 20"
                />
                {saved === 'precioVendedorDespues20' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comisiones */}
      <Card className="overflow-hidden border-2">
        <button
          type="button"
          onClick={() => setShowComisiones(!showComisiones)}
          className="w-full text-left"
        >
          <CardHeader className="bg-chart-2/10 p-4">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/20">
                  <Users className="h-4 w-4 text-chart-2" />
                </div>
                Comisiones
              </div>
              {showComisiones ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </button>
        {showComisiones && (
          <CardContent className="p-4 space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">{config.nombreSocio2}</Label>
                <p className="text-xs text-muted-foreground">Por unidad (max {config.limiteComisionMiguel})</p>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={getDisplayValue('comisionMiguelPorUnidad')}
                    onFocus={() => startEditing('comisionMiguelPorUnidad', config.comisionMiguelPorUnidad)}
                    onChange={(e) => handleEditChange('comisionMiguelPorUnidad', e.target.value)}
                    onBlur={() => finishEditing('comisionMiguelPorUnidad')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        finishEditing('comisionMiguelPorUnidad')
                        e.currentTarget.blur()
                      }
                      if (e.key === 'Escape') {
                        cancelEditing('comisionMiguelPorUnidad')
                        e.currentTarget.blur()
                      }
                    }}
                    className="h-11 text-base font-semibold"
                    placeholder="Comisión por unidad"
                  />
                  {saved === 'comisionMiguelPorUnidad' && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">{config.nombreSocio3}</Label>
                <p className="text-xs text-muted-foreground">Por cada unidad</p>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={getDisplayValue('comisionJeronimoPorUnidad')}
                    onFocus={() => startEditing('comisionJeronimoPorUnidad', config.comisionJeronimoPorUnidad)}
                    onChange={(e) => handleEditChange('comisionJeronimoPorUnidad', e.target.value)}
                    onBlur={() => finishEditing('comisionJeronimoPorUnidad')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        finishEditing('comisionJeronimoPorUnidad')
                        e.currentTarget.blur()
                      }
                      if (e.key === 'Escape') {
                        cancelEditing('comisionJeronimoPorUnidad')
                        e.currentTarget.blur()
                      }
                    }}
                    className="h-11 text-base font-semibold"
                    placeholder="Comisión por unidad"
                  />
                  {saved === 'comisionJeronimoPorUnidad' && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Nombres socios</Label>
              <div className="space-y-2">
                <Input
                  value={getDisplayValue('nombreSocio1')}
                  onFocus={() => startEditing('nombreSocio1', config.nombreSocio1)}
                  onChange={(e) => handleEditChange('nombreSocio1', e.target.value)}
                  onBlur={() => finishEditing('nombreSocio1')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('nombreSocio1')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('nombreSocio1')
                      e.currentTarget.blur()
                    }
                  }}
                  placeholder="Socio 1"
                  className="h-10 text-sm"
                />
                <Input
                  value={getDisplayValue('nombreSocio2')}
                  onFocus={() => startEditing('nombreSocio2', config.nombreSocio2)}
                  onChange={(e) => handleEditChange('nombreSocio2', e.target.value)}
                  onBlur={() => finishEditing('nombreSocio2')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('nombreSocio2')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('nombreSocio2')
                      e.currentTarget.blur()
                    }
                  }}
                  placeholder="Socio 2"
                  className="h-10 text-sm"
                />
                <Input
                  value={getDisplayValue('nombreSocio3')}
                  onFocus={() => startEditing('nombreSocio3', config.nombreSocio3)}
                  onChange={(e) => handleEditChange('nombreSocio3', e.target.value)}
                  onBlur={() => finishEditing('nombreSocio3')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing('nombreSocio3')
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      cancelEditing('nombreSocio3')
                      e.currentTarget.blur()
                    }
                  }}
                  placeholder="Socio 3"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmandoEliminar}
        onOpenChange={(open) => !open && setConfirmandoEliminar(null)}
        title={confirmandoEliminar?.tipo === 'universidad' ? '¿Eliminar esta universidad?' : '¿Eliminar este vendedor?'}
        description={
          <p>
            {confirmandoEliminar?.tipo === 'universidad' ? (
              <>
                Se marcará como eliminada la universidad <span className="font-semibold">&quot;{confirmandoEliminar?.nombre}&quot;</span>.
                No se mostrará en listas pero se conservará el historial.
              </>
            ) : (
              <>
                Se marcará como eliminado el vendedor <span className="font-semibold">&quot;{confirmandoEliminar?.nombre}&quot;</span>.
                No aparecerá en listas pero seguirá visible en las ventas ya registradas.
              </>
            )}
          </p>
        }
        confirmLabel={confirmandoEliminar?.tipo === 'universidad' ? 'Sí, eliminar universidad' : 'Sí, eliminar vendedor'}
        loadingLabel="Eliminando..."
        loading={eliminando}
        onConfirm={handleConfirmarEliminar}
      />
    </div>
  )
}
