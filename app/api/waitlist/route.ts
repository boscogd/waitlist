import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWaitlistCode, isValidEmail } from '@/lib/utils';
import { sendWaitlistConfirmation } from '@/lib/resend';

export async function POST(request: Request) {
  try {
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
      .select('email, code')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Este email ya está registrado en la waitlist',
          // @ts-expect-error - Supabase type inference issue
          code: existingUser.code
        },
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
      // No fallamos la solicitud si falla el email, pero lo registramos
    }

    return NextResponse.json(
      {
        success: true,
        message: '¡Bienvenido a la waitlist!',
        // @ts-expect-error - Supabase type inference issue
        code: newEntry.code,
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
      .select('email, code, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        exists: true,
        // @ts-expect-error - Supabase type inference issue
        code: data.code,
        // @ts-expect-error - Supabase type inference issue
        created_at: data.created_at,
      },
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
