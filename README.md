# 🥪 Sistema de Gestión de Ventas de Sandwiches

Sistema completo para gestionar ventas, comisiones y reportes de un negocio de sandwiches con múltiples vendedores y socios.

## ✨ Características

- 📊 **Registro de ventas** con cálculo automático de comisiones
- 👥 **Gestión de vendedores** configurable
- 💰 **Cálculo automático** de ganancias para operador y socios
- 📈 **Resúmenes semanales y mensuales** con gráficos
- 🚚 **Gestión de domicilios** con distribución de costos
- ⚙️ **Configuración dinámica** de precios y comisiones
- 🌙 **Modo oscuro/claro**
- 📱 **Diseño responsive** para móvil y desktop
- ⚡ **Súper rápido** con Supabase

## 🚀 Tecnologías

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Despliegue**: Vercel

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd <tu-proyecto>
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura Supabase (ver sección siguiente)

4. Copia las variables de entorno:
```bash
cp .env.example .env.local
```

5. Edita `.env.local` con tus credenciales de Supabase

6. Inicia el servidor de desarrollo:
```bash
npm run dev
```

7. Abre [http://localhost:3000](http://localhost:3000)

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda la contraseña de la base de datos

### 2. Crear Tablas

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia el contenido de `supabase-schema.sql`
3. Pégalo y ejecuta el script
4. Verifica que las tablas `ventas` y `configuracion` se crearon

### 3. Obtener Credenciales

1. Ve a **Project Settings > API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pégalos en `.env.local`

### 4. Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 Documentación Completa

Para instrucciones detalladas de migración y configuración, consulta:
- **[MIGRACION-SUPABASE.md](./MIGRACION-SUPABASE.md)** - Guía completa de migración

## 🔄 Migrar desde Google Sheets (Opcional)

Si tienes datos existentes en Google Sheets:

1. Mantén temporalmente las variables de Google Sheets en `.env.local`
2. Instala tsx: `npm install -D tsx`
3. Ejecuta el script de migración:
```bash
npx tsx scripts/migrar-datos-sheets-a-supabase.ts
```

## 🚀 Despliegue en Vercel

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno de Supabase
4. Despliega

## 📖 Uso

### Registrar una Venta

1. Selecciona el vendedor
2. Ajusta la cantidad de sandwiches
3. Activa/desactiva domicilio
4. Revisa el resumen de cálculos
5. Haz clic en "Registrar Venta"

### Ver Reportes

- **Resumen Semanal**: Ventas de la semana actual con gráficos
- **Resumen Mensual**: Totales del mes con comparativas
- **Historial**: Últimas ventas con opción de anular

### Configurar el Negocio

1. Ve a "Configuración"
2. Ajusta precios, comisiones y domicilios
3. Agrega o elimina vendedores
4. Personaliza nombres de socios
5. Los cambios se aplican inmediatamente

## 🏗️ Estructura del Proyecto

```
├── app/
│   ├── api/              # Rutas API de Next.js
│   │   ├── config/       # Configuración del negocio
│   │   ├── ventas/       # CRUD de ventas
│   │   └── resumenes/    # Resúmenes y reportes
│   ├── globals.css       # Estilos globales
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página principal
├── components/           # Componentes React
│   ├── ui/              # Componentes de shadcn/ui
│   ├── formulario-venta.tsx
│   ├── historial-ventas.tsx
│   ├── resumen-semanal.tsx
│   ├── resumen-mensual.tsx
│   └── ...
├── lib/
│   ├── supabase.ts      # Cliente de Supabase
│   ├── google-sheets.ts # Funciones de base de datos
│   ├── calculos.ts      # Lógica de negocio
│   ├── types.ts         # Tipos TypeScript
│   └── utils.ts         # Utilidades
├── hooks/               # Custom hooks
├── scripts/             # Scripts de utilidad
├── supabase-schema.sql  # Esquema de base de datos
└── .env.local          # Variables de entorno
```

## 🧮 Lógica de Cálculos

### Precios por Vendedor
- Primeros 20 sandwiches: $7,000 c/u
- Después de 20: $6,500 c/u

### Comisiones
- **Miguel**: $1,000 por unidad (máximo 20 unidades)
- **Jeronimo**: $500 por unidad (todas las unidades)

### Domicilio
- Total: $5,000
- 50% para el vendedor
- 50% dividido entre 3 socios

### Ganancia del Operador
```
Ganancia = Ingreso Vendedor - Costo Distribución - Comisión Miguel - Comisión Jeronimo - (Domicilio Socios / 3)
```

## 🔒 Seguridad

Actualmente configurado con acceso público para desarrollo. Para producción:

1. Implementa autenticación con Supabase Auth
2. Ajusta las políticas RLS en Supabase
3. Restringe acceso por usuario/rol

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica las variables de entorno en `.env.local`
- Asegúrate de que empiecen con `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo

### Las ventas no aparecen
- Verifica que ejecutaste el script SQL en Supabase
- Revisa la consola del navegador (F12) para errores
- Verifica las políticas RLS en Supabase

### La app sigue lenta
- Confirma que estás usando Supabase (no Google Sheets)
- Verifica la conexión a internet
- Revisa el Network tab en DevTools

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso personal.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

Hecho con ❤️ para gestionar tu negocio de sandwiches
