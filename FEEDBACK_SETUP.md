# Configuración del Sistema de Feedback

Este documento explica cómo configurar y usar el sistema de feedback para tu MVP de Refugio en la Palabra.

## 📋 Lo que se ha creado

1. **Página de Feedback** (`/feedback`) - Formulario anónimo para usuarios
2. **Panel de Administración** (`/admin/feedback`) - Panel para revisar feedbacks
3. **Notificaciones por Email** - Recibes un email cada vez que llega nuevo feedback
4. **Base de datos** - Tabla en Supabase para almacenar feedback

## 🚀 Pasos de Configuración

### 1. Crear la tabla en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-feedback-table.sql`
4. Ejecuta el SQL haciendo clic en "Run"

### 2. Configurar variables de entorno

Añade estas variables en tu archivo `.env.local`:

```bash
# Email del administrador (donde llegarán las notificaciones)
ADMIN_EMAIL=tu-email@ejemplo.com

# Clave secreta para acceder al panel de admin
ADMIN_SECRET_KEY=tu_clave_secreta_aqui_cambiar

# URL del sitio (opcional, para los enlaces en los emails)
NEXT_PUBLIC_SITE_URL=https://refugioenlapalabra.com
```

**Importante:**
- Cambia `ADMIN_SECRET_KEY` por una clave segura
- Esta será la contraseña para acceder a `/admin/feedback`

### 3. Variables que ya deberías tener configuradas

Estas variables ya deberían estar en tu `.env.local` del proyecto actual:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=tu_email_verificado_en_resend
```

## 📊 Cómo usar el sistema

### Para los usuarios del MVP

1. Comparte el link: `https://refugioenlapalabra.com/feedback`
2. Los usuarios pueden:
   - Dar una calificación de 1-5 estrellas
   - Decir qué les gusta
   - Decir qué no les gusta
   - Sugerir mejoras
   - Dejar comentarios adicionales
3. Todo es **100% anónimo** - no se pide email ni nombre

### Para ti (administrador)

#### Ver feedbacks en el panel

1. Ve a `https://refugioenlapalabra.com/admin/feedback`
2. Ingresa la clave secreta (la que configuraste en `ADMIN_SECRET_KEY`)
3. Verás:
   - Total de feedbacks recibidos
   - Calificación promedio
   - Todos los feedbacks organizados con colores:
     - 🟢 Verde: Lo que les gusta
     - 🔴 Rojo: Lo que no les gusta
     - 🔵 Azul: Sugerencias de mejora
     - 🟣 Morado: Comentarios adicionales

#### Recibir notificaciones por email

Cada vez que un usuario envíe feedback, recibirás un email en la dirección configurada en `ADMIN_EMAIL` con:
- La calificación (si la dieron)
- Todas sus respuestas
- Un enlace directo al panel de admin

## 🔒 Seguridad

- El formulario es completamente anónimo
- El panel de admin está protegido con clave secreta
- Los datos se almacenan de forma segura en Supabase
- Las notificaciones solo se envían al email del admin configurado

## 📝 Gestión de Feedbacks (opcional)

La tabla incluye campos adicionales para gestión que puedes usar si quieres:

- `reviewed`: Marcar como revisado
- `status`: Estado (pending, in_progress, completed, discarded)
- `priority`: Prioridad (1=Alta, 2=Media, 3=Baja)
- `admin_notes`: Notas internas

Puedes modificar estos campos directamente desde Supabase si quieres llevar un mejor control.

## 🎯 URLs importantes

- **Formulario de feedback**: `https://refugioenlapalabra.com/feedback`
- **Panel de administración**: `https://refugioenlapalabra.com/admin/feedback`

## 🆘 Solución de problemas

### No recibo emails de notificación

1. Verifica que `ADMIN_EMAIL` esté correctamente configurado en `.env.local`
2. Verifica que `RESEND_API_KEY` y `RESEND_FROM_EMAIL` estén configurados
3. Revisa los logs del servidor para ver si hay errores
4. Los emails pueden tardar unos minutos en llegar

### No puedo acceder al panel de admin

1. Verifica que `ADMIN_SECRET_KEY` esté configurado en `.env.local`
2. Asegúrate de estar usando la clave correcta
3. Si olvidaste la clave, cámbiala en `.env.local` y reinicia el servidor

### Los feedbacks no se guardan

1. Verifica que la tabla `feedback` exista en Supabase
2. Verifica las variables de Supabase en `.env.local`
3. Revisa los logs del navegador y servidor para ver errores

## 📞 Próximos pasos

Una vez configurado todo:

1. Prueba el formulario tú mismo en `/feedback`
2. Verifica que el feedback aparezca en `/admin/feedback`
3. Confirma que recibiste el email de notificación
4. Comparte el link `/feedback` con los usuarios de tu MVP
5. ¡Recopila feedback valioso para mejorar tu app!

---

**¡Listo!** Ya tienes un sistema completo para recopilar y gestionar feedback de tu MVP.
