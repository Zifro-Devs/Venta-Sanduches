'use client'

import { cn } from '@/lib/utils'
import { CalendarDays, History, PlusCircle, Settings, Wrench } from 'lucide-react'

type Tab = 'nueva' | 'historial' | 'mensual' | 'gestion'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs = [
  { id: 'nueva' as const, label: 'Venta', icon: PlusCircle },
  { id: 'historial' as const, label: 'Historial', icon: History },
  { id: 'mensual' as const, label: 'Resumen', icon: CalendarDays },
  { id: 'gestion' as const, label: 'Ajustes', icon: Wrench },
]

export function Navegacion({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card pb-safe">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground active:scale-95'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              </div>
              <span className={cn('text-[10px] font-medium', isActive && 'text-primary')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
