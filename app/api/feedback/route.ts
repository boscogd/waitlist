import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendFeedbackNotification } from '@/lib/resend';

export async function POST(request: Request) {
  try {
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

    // Enviar notificación por email (no bloqueante, no falla la request si falla el email)
    console.log('ADMIN_EMAIL configurado:', process.env.ADMIN_EMAIL);
    console.log('RESEND_FROM_EMAIL configurado:', process.env.RESEND_FROM_EMAIL);

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
      // No retornamos error al usuario, solo lo logueamos
    });

    return NextResponse.json(
      {
        success: true,
        message: '¡Gracias por tu feedback!',
        // @ts-expect-error - Supabase type inference issue
        id: newFeedback.id,
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

// Endpoint GET para obtener estadísticas de feedback (opcional, para admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');

    // Proteger el endpoint con una clave secreta (opcional)
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener todos los feedbacks
    // @ts-ignore - Supabase types will be generated after creating the feedback table
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo feedbacks:', error);
      return NextResponse.json(
        { error: 'Error al obtener feedbacks' },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const totalFeedbacks = feedbacks?.length || 0;
    const averageRating =
      feedbacks?.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedbacks || 0;

    return NextResponse.json(
      {
        total: totalFeedbacks,
        averageRating: averageRating.toFixed(2),
        feedbacks: feedbacks || [],
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
