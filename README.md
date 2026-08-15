# Cockpit Comercial — MANGRO

Aplicación web de gestión, control, análisis y proyección comercial para vendedores, con líneas Nestlé, Golosinas, Colgate, DKasa y Philip Morris.

## Estado de esta entrega

Este es el **MVP funcional** construido sobre la propuesta de arquitectura aprobada, con las dos correcciones indicadas:

1. **Cuotas** — habilitado para vendedor *y* administrador (el vendedor registra/ajusta la cuota mensual que se le indicó, ya que esta app opera independiente del sistema corporativo principal).
2. **Importación y exportación de reportes en Excel** — habilitado para vendedor *y* administrador, sin restricción de rol.

Corre en **modo demo** por defecto (datos de ejemplo en memoria, sin backend), para que puedas ver y probar toda la aplicación de inmediato. Cuando quieras pasar a datos reales, conecta tu propio proyecto de Supabase siguiendo los pasos de abajo — el código ya está preparado para ambos modos.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. En la pantalla de login usa:
- **Vendedor:** andy.acosta@mangro.com.pe (cualquier contraseña)
- **Administrador:** admin@mangro.com.pe (cualquier contraseña)

## Conectar tu propio backend (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta el contenido de `supabase/schema.sql` — crea todas las tablas, los correlativos automáticos, la validación de rechazos y las políticas de seguridad (RLS) ya con las dos correcciones aplicadas.
3. Copia `.env.local.example` a `.env.local` y completa:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. Reinicia `npm run dev`. En este punto el código de `lib/AppDataContext.tsx` queda como referencia de la lógica de negocio (correlativos, validación de saldo de rechazo, cálculo de KPIs) para reconectarla a consultas reales de Supabase — es intencionalmente la única pieza que falta cablear a datos en vivo, para que puedas revisarla y ajustarla antes de mover clientes/ventas reales.

## Desplegar

- **Frontend:** conecta este repo a [Vercel](https://vercel.com) (igual que tu app de Registro de Gastos) — despliegue automático en cada push a GitHub.
- **Backend:** Supabase Cloud, sin servidores que mantener.

## Instalarlo como app en iPhone (sin App Store)

Esta app está pensada para no pasar por App Store — se "instala" desde el navegador como *Progressive Web App* (PWA):

1. Abre la URL de la app en **Safari** en el iPhone (tiene que ser Safari, no Chrome, para que aparezca la opción).
2. Toca el botón de **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elige **"Agregar a pantalla de inicio"**.
4. Queda un ícono como cualquier app: abre a pantalla completa, sin la barra de Safari, con su propio ícono (`public/icons/`) y color de tema pastel.

Esto ya está configurado en `app/layout.tsx` y `public/manifest.json` (metaetiquetas `apple-mobile-web-app-capable`, `manifest.json`, íconos en varios tamaños). Es totalmente responsive: barra lateral en escritorio/tablet, barra inferior de navegación en móvil, formularios y tablas adaptados a pantallas pequeñas.

## Estructura del proyecto

```
app/                  páginas (Next.js App Router)
  login/              inicio de sesión
  dashboard/           cockpit principal (KPIs, gráfico, plan de ataque)
  ventas/              listado, nueva venta, detalle/trazabilidad + registrar rechazo
  rechazos/            historial de rechazos con filtros
  clientes/            gestión de clientes
  sucursales/          gestión de sucursales
  zonas/                gestión de zonas
  cuotas/              cuota mensual por línea (vendedor y admin)
  reportes/            exportación Excel/CSV + importación de clientes con vista previa
components/           Sidebar/BottomNav (AppShell), tarjetas de KPI, pills de estado
lib/
  types.ts             modelo de datos (TypeScript)
  demoData.ts          datos de ejemplo (modo demo)
  kpis.ts              todas las fórmulas de KPI del brief
  AppDataContext.tsx   lógica de negocio: correlativos, validación de saldo de rechazo, cuotas
  supabaseClient.ts    cliente de Supabase (activo solo si hay variables de entorno)
supabase/
  schema.sql           esquema completo + RLS + triggers de correlativos y validación
```

## Próximos pasos sugeridos

1. Revisar y aprobar este MVP navegando la app en modo demo.
2. Conectar Supabase con datos reales de tus clientes/sucursales/zonas (o importarlos vía Excel desde la pantalla de Reportes).
3. Cablear `AppDataContext.tsx` a consultas Supabase en vivo (hoy usa datos en memoria).
4. Agregar más vendedores cuando quieras compartir la app con tus compañeros — el modelo y las políticas RLS ya están preparados para eso sin cambios estructurales.
