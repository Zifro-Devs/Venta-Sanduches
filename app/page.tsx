'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FormularioVenta } from '@/components/formulario-venta'
import { HistorialVentas } from '@/components/historial-ventas'
import { ResumenSemanal } from '@/components/resumen-semanal'
import { ResumenMensual } from '@/components/resumen-mensual'
import { GestionNegocio } from '@/components/gestion-negocio'
import { Navegacion } from '@/components/navegacion'
import { useConfigSheets } from '@/hooks/use-config-sheets'

type Tab = 'nueva' | 'historial' | 'mensual' | 'gestion'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('nueva')
  const [refreshKey, setRefreshKey] = useState(0)
  const { config, vendedores, universidades, setConfig, addVendedor, removeVendedor, addUniversidad, removeUniversidad, isLoaded } = useConfigSheets()

  const handleVentaRegistrada = () => {
    setRefreshKey((k) => k + 1)
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src="/logo.png"
              alt="Uy Qué Cubano"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold leading-tight truncate">Uy Qué Cubano</h1>
            <p className="text-xs text-muted-foreground">Control de ventas</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-4">
        {activeTab === 'nueva' && (
          <FormularioVenta config={config} vendedores={vendedores} onVentaRegistrada={handleVentaRegistrada} />
        )}

        {activeTab === 'historial' && (
          <HistorialVentas config={config} vendedores={vendedores} refreshKey={refreshKey} />
        )}

        {activeTab === 'mensual' && <ResumenMensual key={`mensual-${refreshKey}`} config={config} />}

        {activeTab === 'gestion' && (
          <GestionNegocio
            config={config}
            vendedores={vendedores}
            universidades={universidades}
            onConfigChange={setConfig}
            onAddVendedor={addVendedor}
            onRemoveVendedor={removeVendedor}
            onAddUniversidad={addUniversidad}
            onRemoveUniversidad={removeUniversidad}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navegacion active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
