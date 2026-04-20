import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendFeedbackNotification } from '@/lib/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 feedbacks por IP cada 15 minutos
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`feedback:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Inténtalo en unos minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { whatYouLike, whatYouDontLike, whatToImprove, additionalComments, rating } = body;

    // Validar que al menos uno de los campos de texto tenga contenido o que haya rating
    if (
      !rating &&
      !whatYouLike?.trim() &&
      !whatYouDontLike?.trim() &&
      !whatToImprove?.trim() &&
      !additionalComments?.trim()
    ) {
      return NextResponse.json(
        { error: 'Por favor completa al menos un campo o proporciona una calificación' },
        { status: 400 }
      );
    }

    // Validar rating si está presente
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Validar longitud máxima de los campos (prevenir spam)
    const maxLength = 2000;
    if (
      (whatYouLike && whatYouLike.length > maxLength) ||
      (whatYouDontLike && whatYouDontLike.length > maxLength) ||
      (whatToImprove && whatToImprove.length > maxLength) ||
      (additionalComments && additionalComments.length > maxLength)
    ) {
      return NextResponse.json(
        { error: 'Cada campo no puede exceder 2000 caracteres' },
        { status: 400 }
      );
    }

    // Insertar en la base de datos
    // @ts-ignore - Supabase types will be generated after creating the feedback table
    const { data: newFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        what_you_like: whatYouLike?.trim() || null,
        what_you_dont_like: whatYouDontLike?.trim() || null,
        what_to_improve: whatToImprove?.trim() || null,
        additional_comments: additionalComments?.trim() || null,
        rating: rating || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error insertando feedback:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar el feedback. Por favor, inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    // Enviar notificación por email (no bloqueante)
    sendFeedbackNotification({
      // @ts-expect-error - Supabase type inference issue
      feedbackId: newFeedback.id,
      rating,
      whatYouLike,
      whatYouDontLike,
      whatToImprove,
      additionalComments,
    }).catch((err) => {
      console.error('Error enviando notificación de feedback:', err);
    });

    return NextResponse.json(
      {
        success: true,
        message: '¡Gracias por tu feedback!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en API feedback:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener feedbacks (protegido con Authorization header)
export async function GET(request: Request) {
  try {
    // Verificar Authorization header (no query string)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener feedbacks con paginación
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '50'));
    const offset = (page - 1) * pageSize;

    // @ts-ignore - Supabase types will be generated after creating the feedback table
    const { data: feedbacks, error, count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error obteniendo feedbacks:', error);
      return NextResponse.json(
        { error: 'Error al obtener feedbacks' },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const totalFeedbacks = count || 0;
    const ratingsOnly = (feedbacks || []).filter((f: { rating?: number }) => f.rating);
    const averageRating = ratingsOnly.length > 0
      ? ratingsOnly.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / ratingsOnly.length
      : 0;

    return NextResponse.json(
      {
        total: totalFeedbacks,
        averageRating: averageRating.toFixed(2),
        feedbacks: feedbacks || [],
        page,
        pageSize,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET feedback:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
