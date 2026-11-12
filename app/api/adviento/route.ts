import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-admin';
import { isValidEmail } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { adventoCerrado } from '@/lib/content/adviento';

// Inscripción al reto de Adviento. Solo guarda correo y nombre en
// `advent_signups` (ver supabase/adviento-schema.sql). No envía correos.
//
// Si el correo ya estaba apuntado respondemos igual que si fuera nuevo: así
// nadie puede usar el formulario para averiguar si un correo está en la lista.

const OK = { success: true };

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit(`adviento:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Prueba de nuevo en unos minutos.' },
        { status: 429 }
      );
    }

    if (adventoCerrado()) {
      return NextResponse.json({ error: 'El reto de Adviento ya ha terminado.' }, { status: 410 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Datos no válidos.' }, { status: 400 });
    }
    const { email, name, website, source } = body as Record<string, unknown>;

    // Campo trampa: las personas no lo ven; si viene relleno es un robot.
    // Respondemos como si hubiera ido bien y no guardamos nada.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json(OK, { status: 200 });
    }

    if (typeof email !== 'string' || typeof name !== 'string') {
      return NextResponse.json({ error: 'Escribe tu nombre y tu correo.' }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Ese correo no parece válido.' }, { status: 400 });
    }
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'El nombre debe tener entre 2 y 100 caracteres.' },
        { status: 400 }
      );
    }
    const cleanSource =
      typeof source === 'string' && /^[a-z0-9_-]{1,40}$/i.test(source) ? source : null;

    // Con la clave de servicio: la tabla no admite acceso público, así que el
    // límite de intentos, el campo trampa y el cierre no se pueden saltar
    // escribiendo directamente en Supabase.
    const { error } = await getServiceClient()
      .from('advent_signups')
      .insert({ email: cleanEmail, name: cleanName, source: cleanSource });

    if (error && error.code !== '23505') {
      console.error('Error guardando inscripción de Adviento:', error);
      return NextResponse.json(
        { error: 'No hemos podido apuntarte. Inténtalo de nuevo en un momento.' },
        { status: 500 }
      );
    }

    return NextResponse.json(OK, { status: 200 });
  } catch (error) {
    console.error('Error en API adviento:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
