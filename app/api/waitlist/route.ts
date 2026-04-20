import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWaitlistCode, isValidEmail } from '@/lib/utils';
import { sendWaitlistConfirmation } from '@/lib/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 registros por IP cada 15 minutos
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`waitlist:${ip}`, 3, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Inténtalo en unos minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    // Validar campos requeridos
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud del nombre
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre debe tener entre 2 y 100 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado en la waitlist' },
        { status: 409 }
      );
    }

    // Generar código único
    let code = generateWaitlistCode();
    let codeExists = true;
    let attempts = 0;

    // Intentar generar un código único (máximo 10 intentos)
    while (codeExists && attempts < 10) {
      const { data } = await supabase
        .from('waitlist')
        .select('code')
        .eq('code', code)
        .single();

      if (!data) {
        codeExists = false;
      } else {
        code = generateWaitlistCode();
        attempts++;
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Error generando código único. Inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    // Insertar en la base de datos
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        code,
        notified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error insertando en waitlist:', insertError);
      return NextResponse.json(
        { error: 'Error al registrarse en la waitlist' },
        { status: 500 }
      );
    }

    // Enviar email de confirmación
    const emailResult = await sendWaitlistConfirmation({
      // @ts-expect-error - Supabase type inference issue
      email: newEntry.email,
      // @ts-expect-error - Supabase type inference issue
      name: newEntry.name,
      // @ts-expect-error - Supabase type inference issue
      code: newEntry.code,
    });

    if (!emailResult.success) {
      console.error('Error enviando email de confirmación:', emailResult.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: '¡Bienvenido a la waitlist! Revisa tu email para ver tu código.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en API waitlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar si un email ya está en la waitlist
// Solo devuelve si existe o no (sin datos sensibles)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET waitlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
