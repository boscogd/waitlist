# Guía de Despliegue Rápido

Esta es una guía paso a paso para desplegar tu landing page de Refugio en la Palabra en Vercel.

## Antes de empezar

Asegúrate de tener:
- [ ] Cuenta en GitHub
- [ ] Cuenta en Supabase
- [ ] Cuenta en Resend
- [ ] Cuenta en Vercel

## 1. Configurar Supabase (5 minutos)

1. Ve a [https://supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Espera a que se complete la creación (2-3 minutos)
3. Ve a **Settings** > **API**
4. Copia:
   - **Project URL** (será tu `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
5. Ve a **SQL Editor**
6. Pega el contenido completo del archivo `supabase/schema.sql`
7. Haz clic en **Run** para ejecutar el SQL

✅ Supabase configurado

## 2. Configurar Resend (3 minutos)

1. Ve a [https://resend.com](https://resend.com) y crea una cuenta
2. Ve a **API Keys** en el menú lateral
3. Haz clic en **Create API Key**
4. Dale un nombre (ej: "Refugio Landing")
5. Copia la API key (será tu `RESEND_API_KEY`)
6. **(Opcional pero recomendado)** Ve a **Domains** y verifica tu dominio
   - Si no tienes dominio aún, puedes usar el dominio de prueba de Resend

✅ Resend configurado

## 3. Generar Admin API Key (1 minuto)

Opción A - En línea:
1. Ve a [https://www.random.org/strings/](https://www.random.org/strings/)
2. Genera una cadena aleatoria de 32 caracteres
3. Guárdala como tu `ADMIN_API_KEY`

Opción B - Comando (si tienes WSL o Git Bash):
```bash
openssl rand -hex 32
```

✅ Admin API Key generada

## 4. Subir a GitHub (2 minutos)

1. Crea un nuevo repositorio en GitHub (público o privado)
2. En tu terminal, en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit: Landing page con waitlist"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

✅ Código en GitHub

## 5. Desplegar en Vercel (5 minutos)

1. Ve a [https://vercel.com](https://vercel.com) y haz login con GitHub
2. Haz clic en **Add New** > **Project**
3. Importa tu repositorio de GitHub
4. En **Configure Project**:
   - Framework Preset: **Next.js** (detectado automáticamente)
   - Root Directory: `./` (por defecto)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)
5. Haz clic en **Environment Variables** y añade:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
RESEND_API_KEY=re_...tu-resend-key
RESEND_FROM_EMAIL=Refugio en la Palabra <noreply@tudominio.com>
ADMIN_API_KEY=tu-admin-api-key-generada
NEXT_PUBLIC_APP_URL=https://app.refugioenlapalabra.com
```

6. Haz clic en **Deploy**
7. Espera 2-3 minutos a que termine el despliegue

✅ Desplegado en Vercel

## 6. Configurar dominio personalizado (Opcional, 5 minutos)

1. En tu proyecto de Vercel, ve a **Settings** > **Domains**
2. Añade tu dominio (ej: `refugioenlapalabra.com`)
3. Sigue las instrucciones para configurar los DNS
4. Actualiza la variable de entorno `RESEND_FROM_EMAIL` con tu dominio real

✅ Dominio configurado

## 7. Probar todo funciona (3 minutos)

1. Ve a tu URL de Vercel (ej: `tu-proyecto.vercel.app`)
2. Prueba el formulario con tu email
3. Verifica que:
   - Se registra en Supabase (ve a Table Editor > waitlist)
   - Recibes el email de confirmación
   - El código es único y tiene el formato `REFUGIO-XXXXX`

✅ Todo funcionando

## 8. Probar notificación de lanzamiento (Cuando estés listo)

Primero, prueba con tu email:

```bash
curl -X POST https://tudominio.vercel.app/api/notify-launch \
  -H "Authorization: Bearer TU_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"testMode": true, "testEmail": "tu@email.com"}'
```

Si funciona, envía a todos:

```bash
curl -X POST https://tudominio.vercel.app/api/notify-launch \
  -H "Authorization: Bearer TU_ADMIN_API_KEY"
```

## Resumen de URLs importantes

- **Landing Page:** Tu dominio de Vercel o personalizado
- **Supabase Dashboard:** https://app.supabase.com/project/[tu-proyecto-id]
- **Resend Dashboard:** https://resend.com/overview
- **Vercel Dashboard:** https://vercel.com/[tu-usuario]/[tu-proyecto]

## Solución de problemas

### El formulario no funciona
- Verifica que las variables de entorno estén bien configuradas en Vercel
- Revisa los logs en Vercel Dashboard > Deployments > [último deploy] > Functions

### No llegan los emails
- Verifica tu API key de Resend
- Revisa el dashboard de Resend para ver si hay errores
- Si usas dominio personalizado, verifica que esté verificado en Resend

### Error de base de datos
- Verifica que ejecutaste el SQL en Supabase
- Revisa que RLS (Row Level Security) esté habilitado
- Comprueba las políticas de la tabla

## Siguientes pasos

1. Comparte tu landing en Instagram con un enlace en bio
2. Monitorea los registros en Supabase
3. Cuando lances la app, notifica a todos con el endpoint `/api/notify-launch`
4. (Opcional) Añade Google Analytics para trackear visitas

---

¿Problemas? Revisa el README.md para más detalles.
