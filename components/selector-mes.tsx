'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, Calendar } from 'lucide-react'

interface Props {
  mesSeleccionado?: string
  onMesChange: (mes: string) => void
}

export function SelectorMes({ mesSeleccionado, onMesChange }: Props) {
  const [mesesDisponibles, setMesesDisponibles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarSelector, setMostrarSelector] = useState(false)

  useEffect(() => {
    async function fetchMeses() {
      try {
        const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || process.env.GOOGLE_APPS_SCRIPT_URL
        if (!appsScriptUrl) {
          return
        }
        
        const response = await fetch(`${appsScriptUrl}?action=mesesDisponibles`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setMesesDisponibles(result.data)
          if (!mesSeleccionado && result.data.length > 0) {
            onMesChange(result.data[result.data.length - 1])
          }
        }
      } catch (error) {
        console.error('Error al obtener meses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeses()
  }, [mesSeleccionado, onMesChange])

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Cargando meses...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      <Card className="border-2">
        <CardContent className="p-0">
          <Button
            variant="ghost"
            onClick={() => setMostrarSelector(!mostrarSelector)}
            className="w-full justify-between h-auto p-3"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {mesSeleccionado || 'Seleccionar mes'}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${mostrarSelector ? 'rotate-180' : ''}`} />
          </Button>
        </CardContent>
      </Card>

      {mostrarSelector && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-2 shadow-lg">
          <CardContent className="p-1">
            <div className="max-h-48 overflow-y-auto">
              {mesesDisponibles.map((mes) => (
                <Button
                  key={mes}
                  variant="ghost"
                  onClick={() => {
                    onMesChange(mes)
                    setMostrarSelector(false)
                  }}
                  className={`w-full justify-start h-auto p-2 text-sm ${
                    mes === mesSeleccionado ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {mes}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}