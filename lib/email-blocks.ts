// =====================================================
// Modelo de bloques del editor visual de correos
// =====================================================
// Un correo se compone de una lista ordenada de "bloques". Cada bloque conoce
// cómo pintarse a sí mismo como un snippet de HTML de marca (blockToHtml). El
// correo final se genera envolviendo esos snippets en el "shell" de marca
// (cabecera con logo + contenedor crema), reutilizando la misma estética que
// lib/email-starters.ts. El pie legal + baja NO va aquí: lo añade el backend al
// enviar (decorateEmailHtml).

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type BlockType =
  | 'text'
  | 'heading'
  | 'quote'
  | 'button'
  | 'image'
  | 'divider';

export type Block =
  | { id: string; type: 'text'; html: string }
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'quote'; text: string; cite: string }
  | { id: string; type: 'button'; label: string; url: string }
  | { id: string; type: 'image'; url: string; alt: string }
  | { id: string; type: 'divider' };

// ---------------------------------------------------------------------------
// Shell de marca (réplica de doc() en email-starters.ts)
// ---------------------------------------------------------------------------

const HEADER = `    <div style="text-align:center;margin-bottom:45px;padding-bottom:28px;border-bottom:1px solid #E5E0D5;">
      <img src="https://www.refugioenlapalabra.com/logo-512-1.png" alt="Refugio en la Palabra" width="60" height="60" style="display:block;margin:0 auto 14px;border-radius:14px;">
      <span style="font-size:14px;letter-spacing:3px;color:#8B7355;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Refugio en la Palabra</span>
    </div>`;

/** Envuelve el contenido en el "shell" de marca (cabecera + contenedor). */
function doc(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background-color:#FAF7F0;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">
${HEADER}
    <div style="color:#2D2A26;font-size:17px;line-height:1.9;">
${content}
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Escape helpers
// ---------------------------------------------------------------------------

// Escapa texto plano para insertarlo en el cuerpo de un elemento. NO tocamos
// {{name}} (se sustituye al enviar), así que el escape de & respeta las llaves
// normales; escapamos <, >, & y comillas de forma conservadora.
function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Escapa un valor que va dentro de un atributo entre comillas dobles (href, src…).
function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;');
}

// Convierte saltos de línea de un texto plano en <br> (para citas / headings
// multilínea), tras escapar el texto.
function textWithBreaks(value: string): string {
  return escapeText(value).replace(/\r?\n/g, '<br>');
}

// Sanea una URL para href/src: solo permitimos http(s), mailto y rutas
// relativas. Cualquier otra cosa (p. ej. javascript:) se descarta.
function safeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return trimmed;
  // Sin esquema reconocido: lo tratamos como https:// por comodidad del redactor.
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) return `https://${trimmed}`;
  return '';
}

// ---------------------------------------------------------------------------
// Render de un bloque a HTML de marca
// ---------------------------------------------------------------------------

export function blockToHtml(block: Block): string {
  switch (block.type) {
    case 'text': {
      // En 'text' permitimos el HTML inline del usuario (negritas, enlaces…),
      // por eso NO escapamos: lo envolvemos en un <p> con el margen de marca.
      // Si el usuario ya escribió etiquetas de bloque, aun así queda válido.
      const inner = block.html.trim() || '&nbsp;';
      return `      <p style="margin-bottom:25px;">${inner}</p>`;
    }

    case 'heading': {
      const text = textWithBreaks(block.text) || '&nbsp;';
      return `      <p style="font-size:22px;color:#1F3A5F;font-weight:bold;margin:0 0 20px;line-height:1.4;">${text}</p>`;
    }

    case 'quote': {
      const text = textWithBreaks(block.text) || '&nbsp;';
      const cite = block.cite.trim();
      const citeHtml = cite
        ? `\n        <p style="margin:12px 0 0 0;font-size:14px;color:#A09A92;">— ${escapeText(cite)}</p>`
        : '';
      return `      <div style="background-color:#ffffff;border-radius:8px;padding:30px;margin:35px 0;box-shadow:0 2px 15px rgba(0,0,0,0.04);border-left:3px solid #E1B955;">
        <p style="margin:0;font-style:italic;color:#5D574F;font-size:18px;">${text}</p>${citeHtml}
      </div>`;
    }

    case 'button': {
      const label = escapeText(block.label.trim()) || 'Abrir Refugio';
      const url = safeUrl(block.url) || 'https://www.refugioenlapalabra.com';
      return `      <div style="text-align:center;margin:35px 0;">
        <a href="${escapeAttr(url)}" style="display:inline-block;background-color:#1F3A5F;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">${label}</a>
      </div>`;
    }

    case 'image': {
      const url = safeUrl(block.url);
      if (!url) return '';
      const alt = escapeAttr(block.alt.trim());
      return `      <div style="margin:35px 0;text-align:center;">
        <img src="${escapeAttr(url)}" alt="${alt}" style="max-width:100%;border-radius:8px;display:block;margin:0 auto;">
      </div>`;
    }

    case 'divider':
      return `      <div style="height:1px;background:#E5E0D5;margin:35px 0;"></div>`;

    default: {
      // Exhaustividad: si se añade un tipo nuevo, TS marcará este punto.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _never: never = block;
      return '';
    }
  }
}

// ---------------------------------------------------------------------------
// Render del correo completo
// ---------------------------------------------------------------------------

export function blocksToEmailHtml(blocks: Block[]): string {
  const content = blocks
    .map(blockToHtml)
    .filter((snippet) => snippet.length > 0)
    .join('\n');
  return doc(content);
}

// ---------------------------------------------------------------------------
// Fábrica de bloques por defecto
// ---------------------------------------------------------------------------

function uid(): string {
  return crypto.randomUUID();
}

export function newBlock(type: BlockType): Block {
  switch (type) {
    case 'text':
      return { id: uid(), type: 'text', html: '' };
    case 'heading':
      return { id: uid(), type: 'heading', text: '' };
    case 'quote':
      return { id: uid(), type: 'quote', text: '', cite: '' };
    case 'button':
      return { id: uid(), type: 'button', label: 'Abrir Refugio', url: 'https://www.refugioenlapalabra.com' };
    case 'image':
      return { id: uid(), type: 'image', url: '', alt: '' };
    case 'divider':
      return { id: uid(), type: 'divider' };
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _never: never = type;
      return { id: uid(), type: 'text', html: '' };
    }
  }
}

// ---------------------------------------------------------------------------
// Presets (equivalentes a los EMAIL_STARTERS actuales, como arrays de bloques)
// ---------------------------------------------------------------------------

export interface Preset {
  id: string;
  label: string;
  blocks: Block[];
}

// Cada preset genera ids frescos en cada llamada para no compartir referencias
// entre montajes. Por eso PRESETS es una función-getter envuelta en getter de
// array: exponemos una constante calculada al importar, suficiente para el
// editor (los ids se regeneran igualmente al cargar un preset vía newBlock/spread).
export const PRESETS: Preset[] = [
  {
    id: 'carta',
    label: 'Carta sencilla',
    blocks: [
      { id: uid(), type: 'text', html: '{{name}},' },
      {
        id: uid(),
        type: 'text',
        html: 'Escribe aquí tu mensaje. Cuéntalo cercano, como si le escribieras a un amigo en la fe.',
      },
      {
        id: uid(),
        type: 'text',
        html: 'Puedes añadir tantos párrafos como quieras, dejando espacio entre ellos para que respire.',
      },
      {
        id: uid(),
        type: 'text',
        html: 'Con cariño,<br><span style="color:#8B7355;">— El equipo de Refugio</span>',
      },
    ],
  },
  {
    id: 'cita',
    label: 'Con cita',
    blocks: [
      { id: uid(), type: 'text', html: '{{name}},' },
      { id: uid(), type: 'text', html: 'Escribe aquí una breve introducción antes de la cita.' },
      {
        id: uid(),
        type: 'quote',
        text: 'Escribe aquí la cita bíblica o del santo.',
        cite: 'Referencia',
      },
      { id: uid(), type: 'text', html: 'Y aquí tu reflexión sobre lo que esa cita nos dice hoy.' },
      {
        id: uid(),
        type: 'text',
        html: 'Un abrazo,<br><span style="color:#8B7355;">— El equipo de Refugio</span>',
      },
    ],
  },
  {
    id: 'anuncio',
    label: 'Anuncio',
    blocks: [
      { id: uid(), type: 'heading', text: 'Una novedad para ti' },
      { id: uid(), type: 'text', html: '{{name}},' },
      {
        id: uid(),
        type: 'text',
        html: 'Escribe aquí la novedad que quieres compartir con la comunidad.',
      },
      { id: uid(), type: 'button', label: 'Abrir Refugio', url: 'https://www.refugioenlapalabra.com' },
      {
        id: uid(),
        type: 'text',
        html: 'Con cariño,<br><span style="color:#8B7355;">— El equipo de Refugio</span>',
      },
    ],
  },
  {
    id: 'evangelio',
    label: 'Reflexión',
    blocks: [
      { id: uid(), type: 'text', html: '{{name}},' },
      { id: uid(), type: 'text', html: 'Hoy quiero compartir contigo el Evangelio de este día.' },
      {
        id: uid(),
        type: 'quote',
        text: 'Escribe aquí el pasaje del Evangelio.',
        cite: 'Evangelio · Referencia',
      },
      {
        id: uid(),
        type: 'text',
        html: 'Escribe aquí una reflexión personal y cercana, no una homilía.',
      },
      {
        id: uid(),
        type: 'text',
        html: '<strong>Para pensar hoy:</strong> una pregunta que invite a la oración.',
      },
      {
        id: uid(),
        type: 'text',
        html: 'Que tengas un día en paz,<br><span style="color:#8B7355;">— El equipo de Refugio</span>',
      },
    ],
  },
];
