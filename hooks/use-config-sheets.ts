'use client'

import { useState, useEffect, useCallback } from 'react'
import { type ConfigNegocio, CONFIG_DEFAULT } from '@/lib/types'

export function useConfigSheets() {
  const [config, setConfigState] = useState<ConfigNegocio>(CONFIG_DEFAULT)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Cargar configuración desde Google Sheets
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config')
      const result = await response.json()

      if (result.success && result.data) {
        // Combinar con valores por defecto para asegurar que no falte nada
        const mergedConfig = { ...CONFIG_DEFAULT, ...result.data }
        setConfigState(mergedConfig)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      // Usar valores por defecto si falla
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Guardar configuración en Google Sheets
  const saveConfig = useCallback(async (newConfig: Partial<ConfigNegocio>) => {
    const updatedConfig = { ...config, ...newConfig }
    
    // Actualizar estado local inmediatamente
    setConfigState(updatedConfig)
    
    // Guardar en Google Sheets en background
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: updatedConfig
        })
      })

      const result = await response.json()
      if (!result.success) {
        console.error('Error al guardar:', result.error)
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  const addVendedor = useCallback((nombre: string) => {
    if (nombre.trim() && !config.vendedores.includes(nombre.trim())) {
      saveConfig({ vendedores: [...config.vendedores, nombre.trim()] })
    }
  }, [config.vendedores, saveConfig])

  const removeVendedor = useCallback((nombre: string) => {
    saveConfig({ vendedores: config.vendedores.filter((v) => v !== nombre) })
  }, [config.vendedores, saveConfig])

  // Cargar configuración al iniciar
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    setConfig: saveConfig,
    addVendedor,
    removeVendedor,
    isLoaded,
    isLoading,
    reloadConfig: loadConfig
  }
}