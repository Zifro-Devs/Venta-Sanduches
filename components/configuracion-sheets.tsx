'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, ExternalLink, FileSpreadsheet, Code, Globe, Key } from 'lucide-react'

const APPS_SCRIPT_CODE = `// Pega este codigo en Google Apps Script
// Ve a Extensions > Apps Script en tu Google Sheet

const SHEET_NAME = 'Ventas';

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'agregarVenta') {
    const venta = data.data;
    const id = Utilities.getUuid();
    
    sheet.appendRow([
      id,
      venta.fecha,
      venta.vendedor,
      venta.cantidad,
      venta.costoDistribucion,
      venta.ingresoVendedor,
      venta.comisionMiguel,
      venta.comisionJeronimo,
      venta.domicilioTotal,
      venta.domicilioVendedor,
      venta.domicilioSocios,
      venta.gananciaOperador
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: id }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Accion no valida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const action = e.parameter.action;
  
  if (action === 'obtenerVentas') {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const ventas = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h.toLowerCase()] = row[i]);
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: ventas }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'resumenSemanal') {
    const data = sheet.getDataRange().getValues().slice(1);
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
    inicioSemana.setHours(0, 0, 0, 0);
    
    const ventasSemana = data.filter(row => {
      const fecha = new Date(row[1]);
      return fecha >= inicioSemana;
    });
    
    const resumen = {
      semana: Math.ceil((hoy - new Date(hoy.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)).toString(),
      fechaInicio: inicioSemana.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0],
      totalVentas: ventasSemana.reduce((sum, row) => sum + row[5], 0),
      totalSandwiches: ventasSemana.reduce((sum, row) => sum + row[3], 0),
      comisionMiguel: ventasSemana.reduce((sum, row) => sum + row[6], 0),
      comisionJeronimo: ventasSemana.reduce((sum, row) => sum + row[7], 0),
      domicilioTotal: ventasSemana.reduce((sum, row) => sum + row[8], 0),
      domicilioSocios: ventasSemana.reduce((sum, row) => sum + row[10], 0),
      gananciaOperador: ventasSemana.reduce((sum, row) => sum + row[11], 0),
      ventasPorVendedor: {}
    };
    
    ventasSemana.forEach(row => {
      const vendedor = row[2];
      if (!resumen.ventasPorVendedor[vendedor]) {
        resumen.ventasPorVendedor[vendedor] = { cantidad: 0, total: 0 };
      }
      resumen.ventasPorVendedor[vendedor].cantidad += row[3];
      resumen.ventasPorVendedor[vendedor].total += row[5];
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: resumen }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'resumenMensual') {
    const data = sheet.getDataRange().getValues().slice(1);
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    const ventasMes = data.filter(row => {
      const fecha = new Date(row[1]);
      return fecha >= inicioMes;
    });
    
    const resumen = {
      mes: hoy.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      totalFacturado: ventasMes.reduce((sum, row) => sum + row[5], 0),
      totalSandwiches: ventasMes.reduce((sum, row) => sum + row[3], 0),
      comisionMiguel: ventasMes.reduce((sum, row) => sum + row[6], 0),
      comisionJeronimo: ventasMes.reduce((sum, row) => sum + row[7], 0),
      domicilioTotal: ventasMes.reduce((sum, row) => sum + row[8], 0),
      gananciaOperador: ventasMes.reduce((sum, row) => sum + row[11], 0)
    };
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: resumen }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Accion no valida' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

const HEADERS = [
  'ID',
  'Fecha',
  'Vendedor',
  'Cantidad',
  'CostoDistribucion',
  'IngresoVendedor',
  'ComisionMiguel',
  'ComisionJeronimo',
  'DomicilioTotal',
  'DomicilioVendedor',
  'DomicilioSocios',
  'GananciaOperador',
]

export function ConfiguracionSheets() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedHeaders, setCopiedHeaders] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(APPS_SCRIPT_CODE)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyHeaders = async () => {
    await navigator.clipboard.writeText(HEADERS.join('\t'))
    setCopiedHeaders(true)
    setTimeout(() => setCopiedHeaders(false), 2000)
  }

  const steps = [
    {
      icon: FileSpreadsheet,
      title: 'Crear Google Sheet',
      content: (
        <div className="space-y-3">
          <p className="text-base text-muted-foreground">
            Ve a{' '}
            <a
              href="https://sheets.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary underline"
            >
              sheets.google.com
              <ExternalLink className="h-4 w-4" />
            </a>{' '}
            y crea una nueva hoja llamada <strong>Ventas</strong>
          </p>
        </div>
      ),
    },
    {
      icon: FileSpreadsheet,
      title: 'Agregar encabezados',
      content: (
        <div className="space-y-3">
          <p className="text-base text-muted-foreground">Pega estos encabezados en la fila 1:</p>
          <div className="flex gap-3">
            <code className="flex-1 overflow-auto rounded-xl bg-muted p-4 text-sm">{HEADERS.join(' | ')}</code>
            <Button variant="outline" size="lg" onClick={copyHeaders} className="h-auto bg-transparent">
              {copiedHeaders ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Code,
      title: 'Crear Apps Script',
      content: (
        <div className="space-y-3">
          <p className="text-base text-muted-foreground">
            En tu Google Sheet, ve a <strong>Extensiones &gt; Apps Script</strong> y pega este codigo:
          </p>
          <div className="relative">
            <pre className="max-h-56 overflow-auto rounded-xl bg-muted p-4 text-xs">{APPS_SCRIPT_CODE}</pre>
            <Button
              variant="outline"
              size="lg"
              className="absolute right-3 top-3 bg-card"
              onClick={copyCode}
            >
              {copiedCode ? (
                <>
                  <Check className="h-5 w-5 text-accent mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Globe,
      title: 'Publicar como Web App',
      content: (
        <ol className="space-y-2 text-base text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">1</span>
            <span>Haz clic en <strong>Implementar &gt; Nueva implementacion</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">2</span>
            <span>Selecciona tipo: <strong>Aplicacion web</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">3</span>
            <span>En &quot;Quien tiene acceso&quot; selecciona <strong>Cualquier persona</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">4</span>
            <span>Copia la <strong>URL</strong> que te da</span>
          </li>
        </ol>
      ),
    },
    {
      icon: Key,
      title: 'Configurar en Vercel',
      content: (
        <div className="space-y-3">
          <p className="text-base text-muted-foreground">
            Agrega la variable de entorno en la seccion <strong>&quot;Vars&quot;</strong> del sidebar izquierdo:
          </p>
          <code className="block rounded-xl bg-muted p-4 text-sm font-semibold">
            GOOGLE_APPS_SCRIPT_URL = tu_url_aqui
          </code>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Conectar Google Sheets</h2>
        <p className="mt-2 text-muted-foreground">Sigue estos pasos para conectar tu Excel en la nube</p>
      </div>

      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <Card key={index} className="border-2 overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">{index + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
              </div>
              {step.content}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
