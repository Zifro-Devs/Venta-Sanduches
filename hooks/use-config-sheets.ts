'use client'

import { useState, useEffect, useCallback } from 'react'
import { type ConfigNegocio, type Vendedor, type VendedorInfo, type UniversidadEntity, CONFIG_DEFAULT } from '@/lib/types'

export function useConfigSheets() {
  const [config, setConfigState] = useState<ConfigNegocio>(CONFIG_DEFAULT)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [universidades, setUniversidades] = useState<UniversidadEntity[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config')
      const result = await response.json()
      if (result.success && result.data) {
        setConfigState({ ...CONFIG_DEFAULT, ...result.data })
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }, [])

  const loadVendedores = useCallback(async () => {
    try {
      const response = await fetch('/api/vendedores')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setVendedores(result.data)
      }
    } catch (error) {
      console.error('Error al cargar vendedores:', error)
    }
  }, [])

  const loadUniversidades = useCallback(async () => {
    try {
      const response = await fetch('/api/universidades')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setUniversidades(result.data)
      }
    } catch (error) {
      console.error('Error al cargar universidades:', error)
    }
  }, [])

  const saveConfig = useCallback(async (newConfig: Partial<ConfigNegocio>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfigState(updatedConfig)
    try {
      setIsLoading(true)
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updatedConfig }),
      })
      const result = await response.json()
      if (!result.success) console.error('Error al guardar:', result.error)
    } catch (error) {
      console.error('Error al guardar configuración:', error)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  const addVendedor = useCallback(async (vendedor: VendedorInfo) => {
    if (!vendedor.nombre.trim()) return
    try {
      const response = await fetch('/api/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: vendedor.nombre.trim(),
          universidad: vendedor.universidad ?? 'U Nacional',
          telefono: vendedor.telefono ?? '',
        }),
      })
      const result = await response.json()
      if (result.success) {
        await loadVendedores()
      } else {
        console.error('Error al agregar vendedor:', result.error)
      }
    } catch (error) {
      console.error('Error al agregar vendedor:', error)
    }
  }, [loadVendedores])

  const removeVendedor = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/vendedores?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        setVendedores((prev) => prev.filter((v) => v.id !== id))
      } else {
        console.error('Error al eliminar vendedor:', result.error)
      }
    } catch (error) {
      console.error('Error al eliminar vendedor:', error)
    }
  }, [])

  const addUniversidad = useCallback(async (nombre: string) => {
    if (!nombre.trim()) return
    try {
      const response = await fetch('/api/universidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() }),
      })
      const result = await response.json()
      if (result.success) {
        await loadUniversidades()
      } else {
        console.error('Error al agregar universidad:', result.error)
      }
    } catch (error) {
      console.error('Error al agregar universidad:', error)
    }
  }, [loadUniversidades])

  const removeUniversidad = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/universidades?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        setUniversidades((prev) => prev.filter((u) => u.id !== id))
      } else {
        console.error('Error al eliminar universidad:', result.error)
      }
    } catch (error) {
      console.error('Error al eliminar universidad:', error)
    }
  }, [])

  useEffect(() => {
    Promise.all([loadConfig(), loadVendedores(), loadUniversidades()]).then(() => setIsLoaded(true))
  }, [loadConfig, loadVendedores, loadUniversidades])

  return {
    config,
    vendedores,
    universidades,
    setConfig: saveConfig,
    addVendedor,
    removeVendedor,
    addUniversidad,
    removeUniversidad,
    isLoaded,
    isLoading,
    reloadConfig: loadConfig,
    reloadVendedores: loadVendedores,
    reloadUniversidades: loadUniversidades,
  }
}
