# Refugio en la Palabra - Landing Page & Waitlist

Landing page profesional con sistema de waitlist para Refugio en la Palabra, tu espacio diario para orar, comprender y avanzar con sentido.

## Características

- ✨ Diseño sobrio, cálido y contemplativo
- 📝 Formulario de waitlist con validación
- 🎨 Colores personalizados (Albero, Azul, Dorado)
- 🔤 Tipografías: Lora (títulos) e Inter (texto)
- 📧 Sistema de emails automatizados con Resend
- 🔐 Base de datos segura con Supabase
- 🎁 Generación de códigos únicos de acceso anticipado
- 🇪🇺 Cumplimiento RGPD
- ⚡ Optimizado para PWA mobile-first

## Stack Tecnológico

- **Framework:** Next.js 15 con App Router
- **Estilización:** Tailwind CSS v4
- **Base de datos:** Supabase (PostgreSQL)
- **Emails:** Resend
- **Hosting:** Vercel
- **Lenguaje:** TypeScript

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd landing-waitlist
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Completa las variables en `.env.local` con tus credenciales reales.

## Configuración

### 1. Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener tu URL y Anon Key
3. Ejecuta el SQL del archivo `supabase/schema.sql` en el SQL Editor
4. Añade las credenciales a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

### 2. Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Ve a API Keys y crea una nueva key
3. Verifica tu dominio en Resend (opcional pero recomendado)
4. Añade las credenciales a `.env.local`:
   ```
   RESEND_API_KEY=re_tu_api_key
   RESEND_FROM_EMAIL=Refugio en la Palabra <noreply@tudominio.com>
   ```

### 3. Admin API Key

Genera una clave secreta para proteger el endpoint de notificaciones:

```bash
# En Linux/Mac/WSL:
openssl rand -hex 32

# O usa cualquier generador de claves aleatorias
```

Añádela a `.env.local`:
```
ADMIN_API_KEY=tu_clave_super_secreta
```

### 4. URL de la aplicación

```
NEXT_PUBLIC_APP_URL=https://app.refugioenlapalabra.com
```

## Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno en el dashboard de Vercel:
   - Ve a Settings > Environment Variables
   - Añade todas las variables de `.env.example`
4. Despliega

### Variables de entorno en Vercel

Asegúrate de añadir todas estas variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Uso

### Registro en la waitlist

Los usuarios se registran a través del formulario en la página principal. Automáticamente:
1. Se genera un código único (`REFUGIO-XXXXX`)
2. Se guarda en Supabase
3. Se envía un email de confirmación con el código

### Notificar el lanzamiento

Cuando estés listo para lanzar la aplicación, envía notificaciones a todos los usuarios:

#### Modo prueba (recomendado primero)

```bash
curl -X POST https://tudominio.com/api/notify-launch \
  -H "Authorization: Bearer TU_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"testMode": true, "testEmail": "tu@email.com"}'
```

#### Modo producción (envía a todos)

```bash
curl -X POST https://tudominio.com/api/notify-launch \
  -H "Authorization: Bearer TU_ADMIN_API_KEY"
```

## Estructura del proyecto

```
landing-waitlist/
├── app/
│   ├── api/
│   │   ├── waitlist/          # Endpoint para registro
│   │   └── notify-launch/     # Endpoint para notificaciones
│   ├── components/
│   │   └── WaitlistForm.tsx   # Formulario de waitlist
│   ├── privacidad/            # Página de privacidad RGPD
│   ├── globals.css            # Estilos globales y tema
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página principal
├── lib/
│   ├── supabase.ts            # Cliente de Supabase
│   ├── resend.ts              # Cliente de Resend y plantillas
│   ├── types.ts               # Tipos TypeScript
│   └── utils.ts               # Utilidades (generación de códigos)
├── supabase/
│   └── schema.sql             # Schema de la base de datos
└── .env.example               # Plantilla de variables de entorno
```

## Personalización

### Colores

Los colores están definidos en `app/globals.css`:

- **Albero:** #E1B955
- **Azul:** #1F3A5F
- **Azul 800:** #16263F
- **Dorado:** #D4AF37
- **Marfil:** #FAF7F0
- **Texto:** #1F2937

### Tipografías

- **Títulos:** Lora (serif)
- **Texto:** Inter (sans-serif)

## Seguridad

- ✅ Row Level Security (RLS) habilitado en Supabase
- ✅ Validación de entrada en el backend
- ✅ API Key para endpoint de notificaciones
- ✅ Sin cookies de seguimiento
- ✅ Cumplimiento RGPD

## Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## Licencia

© 2025 Refugio en la Palabra. Todos los derechos reservados.
