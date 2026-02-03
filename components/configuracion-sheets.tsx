'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, ExternalLink, Database, Zap, Shield, Globe } from 'lucide-react'

const steps = [
  {
    icon: Database,
    title: 'Base de Datos Configurada',
    description: 'Tu aplicación ahora usa Supabase PostgreSQL',
    content: 'Supabase es una base de datos PostgreSQL en la nube, mucho más rápida y confiable que Google Sheets.',
    status: 'completed'
  },
  {
    icon: Zap,
    title: 'Rendimiento Mejorado',
    description: '40x más rápido que Google Sheets',
    content: 'Las operaciones que antes tomaban 2-5 segundos ahora toman 50-150ms.',
    status: 'completed'
  },
  {
    icon: Shield,
    title: 'Seguridad y Escalabilidad',
    description: 'Preparado para crecer con tu negocio',
    content: 'Soporta 500,000+ requests por mes en el plan gratuito, con backups automáticos.',
    status: 'completed'
  },
  {
    icon: Globe,
    title: 'Listo para Producción',
    description: 'Despliega en Vercel sin configuración adicional',
    content: 'Solo agrega las variables de entorno de Supabase y despliega.',
    status: 'completed'
  }
]

const SUPABASE_GUIDE = `# Configurar Supabase (5 minutos)

1. Ve a supabase.com y crea un proyecto
2. En SQL Editor, ejecuta el script supabase-schema.sql
3. En Project Settings > API, copia:
   - Project URL
   - anon/public key
4. Agrega las variables en .env.local:
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
5. Ejecuta: npm run verificar
6. Ejecuta: npm run dev

¡Listo! 40x más rápido que Google Sheets.`

export function ConfiguracionSheets() {
  const [copiedGuide, setCopiedGuide] = useState(false)

  const copyGuide = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_GUIDE)
      setCopiedGuide(true)
      setTimeout(() => setCopiedGuide(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configuración de Base de Datos</h2>
        <p className="mt-2 text-muted-foreground">Tu aplicación ahora usa Supabase - mucho más rápida y confiable</p>
      </div>

      {/* Guía rápida */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">Guía Rápida de Configuración</h3>
            <Button variant="outline" onClick={copyGuide} className="gap-2">
              {copiedGuide ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <pre className="text-sm bg-card p-4 rounded-lg overflow-auto">{SUPABASE_GUIDE}</pre>
          <div className="flex gap-2">
            <Button asChild variant="default">
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Ir a Supabase
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/INICIO-RAPIDO.md" target="_blank" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Guía Detallada
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pasos completados */}
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <Card key={index} className="border-2 overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Check className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  <p className="text-base">{step.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Información adicional */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-3">¿Necesitas ayuda?</h3>
          <div className="space-y-2 text-blue-700">
            <p>• Lee <strong>LISTO-PARA-USAR.md</strong> para un resumen ejecutivo</p>
            <p>• Lee <strong>INICIO-RAPIDO.md</strong> para una guía de 5 minutos</p>
            <p>• Lee <strong>MIGRACION-SUPABASE.md</strong> para instrucciones detalladas</p>
            <p>• Ejecuta <strong>npm run verificar</strong> para diagnosticar problemas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}