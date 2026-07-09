import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';

// =====================================================
// POST /api/admin/upload — subida de imágenes del editor de correos
// =====================================================
// Recibe un archivo de imagen (campo `file` de un FormData), lo guarda en el
// bucket público `email-images` de Supabase Storage y devuelve su URL pública
// para insertarla en un bloque `image` del editor visual de correos.
//
// Auth: cookie httpOnly de admin (verifyAdminAuth). Escritura privilegiada con
// la service-role key (getServiceClient); si la clave falta respondemos 400
// legible en vez de un 500 opaco, para que el editor muestre un aviso amable.

// Nombre del bucket público donde viven las imágenes de los correos.
const BUCKET = 'email-images';

// Tamaño máximo permitido: 5 MB. Los correos deben pesar poco.
const MAX_BYTES = 5 * 1024 * 1024;

// Damos margen a la subida (archivos grandes + red lenta) sin llegar al tope.
export const maxDuration = 30;

// Deriva una extensión razonable a partir del nombre o del tipo MIME.
function pickExtension(fileName: string, mimeType: string): string {
  // 1) Si el nombre trae extensión, la reutilizamos (en minúsculas y saneada).
  const dot = fileName.lastIndexOf('.');
  if (dot !== -1 && dot < fileName.length - 1) {
    const ext = fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (ext && ext.length <= 5) return ext;
  }
  // 2) Si no, la deducimos del MIME (image/png → png, image/jpeg → jpeg…).
  const fromMime = mimeType.split('/')[1]?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return fromMime && fromMime.length <= 5 ? fromMime : 'png';
}

export async function POST(request: Request) {
  // 1) Solo admins autenticados pueden subir imágenes.
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 },
    );
  }

  // 2) Cliente service-role. Si falta la key, respondemos 400 legible.
  let supabase: ReturnType<typeof getServiceClient>;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY no configurada' },
      { status: 400 },
    );
  }

  try {
    // 3) Leemos el archivo del FormData (campo `file`).
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No se ha recibido ningún archivo.' },
        { status: 400 },
      );
    }

    // 4) Validamos que sea una imagen.
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen.' },
        { status: 400 },
      );
    }

    // 5) Validamos el tamaño (< 5 MB).
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'La imagen supera el límite de 5 MB.' },
        { status: 400 },
      );
    }

    // 6) Aseguramos que el bucket público existe. Si ya existe, la llamada
    //    devuelve error y lo ignoramos deliberadamente.
    await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    // 7) Nombre único para no pisar imágenes anteriores.
    const ext = pickExtension(file.name, file.type);
    const objectName = `${crypto.randomUUID()}.${ext}`;

    // 8) Subimos el archivo. Convertimos a ArrayBuffer para que Storage lo acepte.
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `No se pudo subir la imagen: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // 9) URL pública para insertarla en el correo.
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectName);

    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: `Error al procesar la subida: ${message}` },
      { status: 500 },
    );
  }
}
