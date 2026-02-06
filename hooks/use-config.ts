'use client'

import { useState, useEffect, useCallback } from 'react'
import { type ConfigNegocio, CONFIG_DEFAULT } from '@/lib/types'

const CONFIG_KEY = 'sandwiches_config'

export function useConfig() {
  const [config, setConfigState] = useState<ConfigNegocio>(CONFIG_DEFAULT)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setConfigState({ ...CONFIG_DEFAULT, ...parsed })
      }
    } catch {
      // Si falla, usa los valores por defecto
    }
    setIsLoaded(true)
  }, [])

  const setConfig = useCallback((newConfig: Partial<ConfigNegocio>) => {
    setConfigState((prev) => {
      const updated = { ...prev, ...newConfig }
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfigState(CONFIG_DEFAULT)
    try {
      localStorage.removeItem(CONFIG_KEY)
    } catch {
      // Ignore
    }
  }, [])

  return {
    config,
    setConfig,
    resetConfig,
    isLoaded,
  }
}
