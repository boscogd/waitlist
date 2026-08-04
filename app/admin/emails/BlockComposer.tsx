'use client';

// =====================================================
// Editor visual de correos por bloques (drag & drop)
// =====================================================
// Sustituye al <textarea> de HTML crudo. El redactor añade bloques desde una
// paleta, los reordena arrastrando, edita el texto in-situ (WYSIWYG con la
// estética real del email) y borra los que sobran. El resultado se serializa a
// HTML de marca con blocksToEmailHtml y se comunica al padre por onHtmlChange.
//
// Nota sobre contentEditable: en React es habitual que el cursor "salte" si se
// reescribe el innerHTML desde el estado en cada render. Para evitarlo, los
// bloques de texto son NO controlados: sembramos el contenido una sola vez al
// montar (vía ref, comparando contra un valor "sembrado") y solo sincronizamos
// al estado en onBlur. React nunca vuelve a tocar el DOM interno del editable.

import { useEffect, useRef, useState } from 'react';
import {
  type Block,
  type BlockType,
  PRESETS,
  blocksToEmailHtml,
  newBlock,
} from '@/lib/email-blocks';

interface BlockComposerProps {
  html: string;
  onHtmlChange: (html: string) => void;
}

// Paleta de tipos de bloque para los botones de "añadir".
const PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text', label: 'Párrafo', icon: '¶' },
  { type: 'heading', label: 'Título', icon: 'H' },
  { type: 'quote', label: 'Cita', icon: '❝' },
  { type: 'button', label: 'Botón', icon: '▭' },
  { type: 'image', label: 'Imagen', icon: '🖼' },
  { type: 'divider', label: 'Separador', icon: '—' },
];

export default function BlockComposer({ html, onHtmlChange }: BlockComposerProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => PRESETS[0].blocks);

  // Índices para el drag & drop nativo.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Cada vez que cambian los bloques, regeneramos el HTML de marca y lo subimos
  // al padre. Se ejecuta también en el montaje para sembrar el estado `html`.
  // Nota: onHtmlChange (setHtml de React) es estable, no lo añadimos a deps para
  // no reejecutar por identidad; blocks es la única dependencia real.
  useEffect(() => {
    onHtmlChange(blocksToEmailHtml(blocks));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // ---- Mutaciones de la lista -------------------------------------------

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [...prev, newBlock(type)]);
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    // Clonamos con ids frescos para no reutilizar referencias entre cargas.
    const cloned = preset.blocks.map((b) => ({ ...b, id: crypto.randomUUID() }));
    setBlocks(cloned);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Actualiza un bloque por id de forma inmutable y con el tipo correcto.
  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    );
  };

  // ---- Drag & drop nativo -----------------------------------------------

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Necesario en Firefox para que el arrastre se inicie.
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== overIndex) setOverIndex(index);
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex;
    setDragIndex(null);
    setOverIndex(null);
    if (from === null || from === index) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // ---- Render ------------------------------------------------------------

  return (
    <div>
      {/* Placeholder gris para los contentEditable vacíos. Inline (CSP estricta,
          sin hojas externas). :empty + ::before muestra el texto de ayuda. */}
      <style>{
        `.rlp-editable:empty::before{content:attr(data-placeholder);color:#A09A92;pointer-events:none;}`
      }</style>

      <label className="block text-sm font-medium text-azul mb-1">Cuerpo del correo</label>

      {/* Paleta: añadir bloques. Barra clara y evidente, con encabezado. */}
      <div className="rounded-xl border border-azul/15 bg-marfil/60 px-3 py-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-azul mr-1">Añadir al correo:</span>
          {PALETTE.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addBlock(item.type)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-azul/20 bg-white text-azul font-medium hover:bg-albero/10 hover:border-albero transition-colors"
            >
              <span aria-hidden className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        {/* Línea de ayuda breve bajo la paleta. */}
        <p className="text-xs text-texto/60 mt-2">
          Pulsa para añadir · arrastra el asa <span className="font-mono">☰</span> para reordenar · haz
          clic sobre el texto para editarlo.
        </p>
      </div>

      {/* Presets: cargar un correo completo de ejemplo */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-texto/50">Plantillas:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => loadPreset(p.id)}
            className="px-2.5 py-1 text-xs rounded-lg bg-marfil border border-azul/10 text-texto/70 hover:text-azul hover:border-azul/30 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Lienzo: aspecto de email */}
      <div
        className="rounded-xl border border-azul/10 p-5 sm:p-8"
        style={{ backgroundColor: '#FAF7F0' }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: 580,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '32px 28px',
            boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
          }}
        >
          {/* Cabecera de marca (NO editable, parte del shell) */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: '1px solid #E5E0D5',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.refugioenlapalabra.com/logo-refugio.png"
              alt="Refugio en la Palabra"
              width={54}
              height={54}
              style={{ display: 'block', margin: '0 auto 12px', borderRadius: 14 }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: 3,
                color: '#8B7355',
                textTransform: 'uppercase',
                fontFamily: 'Arial,Helvetica,sans-serif',
              }}
            >
              Refugio en la Palabra
            </span>
          </div>

          {/* Bloques editables */}
          {blocks.length === 0 ? (
            <p className="text-center text-sm" style={{ color: '#A09A92', fontFamily: 'Georgia,serif' }}>
              El correo está vacío. Añade un bloque desde la paleta de arriba.
            </p>
          ) : (
            blocks.map((block, index) => (
              <BlockRow
                key={block.id}
                block={block}
                isDragTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
                isDragging={dragIndex === index}
                onRemove={() => removeBlock(block.id)}
                onUpdate={(patch) => updateBlock(block.id, patch)}
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-texto/50 mt-2">
        <code className="bg-azul/5 px-1 rounded">{'{{name}}'}</code> se sustituye por el nombre del
        destinatario al enviar.
      </p>
    </div>
  );
}

// ===========================================================================
// Una fila = un bloque, con asa de arrastre + borrar al hacer hover.
// ===========================================================================
interface BlockRowProps {
  block: Block;
  isDragTarget: boolean;
  isDragging: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<Block>) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function BlockRow({
  block,
  isDragTarget,
  isDragging,
  onRemove,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BlockRowProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group relative"
      style={{
        borderTop: isDragTarget ? '2px solid #1F3A5F' : '2px solid transparent',
        opacity: isDragging ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Toolbar del bloque: SIEMPRE visible (discreta pero clara). El asa ☰
          arrastra para reordenar; la × borra. Se apoya a la izquierda del
          bloque; en móvil cae dentro para no salirse del lienzo. */}
      <div className="absolute left-0 sm:-left-11 top-1 flex sm:flex-col gap-1 z-10">
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          title="Arrastra para reordenar"
          aria-label="Reordenar bloque"
          className="w-7 h-7 flex items-center justify-center rounded-md bg-marfil border border-azul/20 text-azul/70 hover:text-azul hover:border-azul cursor-grab active:cursor-grabbing text-sm shadow-sm"
          style={{ cursor: 'grab' }}
        >
          ☰
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Borrar bloque"
          aria-label="Borrar bloque"
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-red-200 text-red-400 hover:text-red-600 hover:border-red-400 text-base shadow-sm"
        >
          ×
        </button>
      </div>

      {/* Empujamos el contenido a la derecha en móvil para dejar hueco a la
          toolbar interior (en desktop la toolbar va fuera del lienzo). */}
      <div className="pl-16 sm:pl-0">
        <BlockEditor block={block} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

// ===========================================================================
// El editor concreto según el tipo de bloque.
// ===========================================================================
function BlockEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (patch: Partial<Block>) => void;
}) {
  switch (block.type) {
    case 'text':
      return (
        <Editable
          initialHtml={block.html}
          asHtml
          placeholder="Escribe aquí…"
          onCommit={(value) => onUpdate({ html: value })}
          style={{
            margin: '0 0 25px',
            color: '#2D2A26',
            fontSize: 17,
            lineHeight: 1.9,
            fontFamily: "Georgia,'Times New Roman',serif",
          }}
        />
      );

    case 'heading':
      return (
        <Editable
          initialHtml={block.text}
          placeholder="Título del correo…"
          onCommit={(value) => onUpdate({ text: value })}
          style={{
            margin: '0 0 20px',
            color: '#1F3A5F',
            fontSize: 22,
            fontWeight: 'bold',
            lineHeight: 1.4,
            fontFamily: "Georgia,'Times New Roman',serif",
          }}
        />
      );

    case 'quote':
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 30,
            margin: '25px 0',
            boxShadow: '0 2px 15px rgba(0,0,0,0.04)',
            borderLeft: '3px solid #E1B955',
          }}
        >
          <Editable
            initialHtml={block.text}
            placeholder="Escribe la cita…"
            onCommit={(value) => onUpdate({ text: value })}
            style={{
              margin: 0,
              fontStyle: 'italic',
              color: '#5D574F',
              fontSize: 18,
              fontFamily: "Georgia,'Times New Roman',serif",
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12 }}>
            <span style={{ color: '#A09A92', fontSize: 14, fontFamily: 'Georgia,serif' }}>—&nbsp;</span>
            <Editable
              initialHtml={block.cite}
              placeholder="Referencia"
              onCommit={(value) => onUpdate({ cite: value })}
              style={{
                margin: 0,
                fontSize: 14,
                color: '#A09A92',
                fontFamily: "Georgia,'Times New Roman',serif",
                flex: 1,
              }}
            />
          </div>
        </div>
      );

    case 'button':
      return (
        <div style={{ margin: '25px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#1F3A5F',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: "Georgia,'Times New Roman',serif",
              }}
            >
              {block.label.trim() || 'Abrir Refugio'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={block.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Texto del botón"
              className="flex-1 px-3 py-2 border border-azul/15 rounded-lg text-sm text-texto focus:outline-none focus:border-azul bg-white"
            />
            <input
              type="url"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://…"
              className="flex-1 px-3 py-2 border border-azul/15 rounded-lg text-sm text-texto focus:outline-none focus:border-azul bg-white font-mono"
            />
          </div>
        </div>
      );

    case 'image':
      return <ImageEditor block={block} onUpdate={onUpdate} />;

    case 'divider':
      return <div style={{ height: 1, background: '#E5E0D5', margin: '35px 0' }} />;

    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _never: never = block;
      return null;
    }
  }
}

// ===========================================================================
// Editor del bloque de IMAGEN: vista previa + tres formas de poner la imagen:
//   1) pegar un enlace (input URL),
//   2) botón "Subir imagen" (abre el selector de archivos),
//   3) arrastrar una imagen del ordenador y soltarla sobre el bloque.
// Sube el archivo a /api/admin/upload y guarda la URL pública en block.url.
// ===========================================================================
function ImageEditor({
  block,
  onUpdate,
}: {
  block: { id: string; type: 'image'; url: string; alt: string };
  onUpdate: (patch: Partial<Block>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Resalta la zona de soltar mientras se arrastra un archivo por encima.
  const [dragActive, setDragActive] = useState(false);

  // Sube un archivo al endpoint y, si va bien, actualiza block.url.
  const uploadFile = async (file: File) => {
    setError(null);

    // Validación en cliente: debe ser imagen y pesar < 5 MB (el backend
    // revalida, pero así damos feedback inmediato sin viaje de red).
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera el límite de 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data: { success: boolean; url?: string; error?: string } = await res.json();

      if (!res.ok || !data.success || !data.url) {
        // Mensaje amable cuando falta la clave de servicio en Vercel.
        if (data.error?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          setError(
            'Para subir imágenes, falta configurar la clave de servicio en Vercel ' +
              '(mientras tanto, puedes pegar un enlace de imagen).',
          );
        } else {
          setError(data.error || 'No se pudo subir la imagen.');
        }
        return;
      }

      onUpdate({ url: data.url });
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  // Selector de archivos (botón "Subir imagen").
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    // Reseteamos el input para poder volver a elegir el mismo archivo.
    e.target.value = '';
  };

  // Soltar sobre el bloque. OJO: este mismo lienzo usa DnD nativo para
  // REORDENAR bloques. Distinguimos por e.dataTransfer.files.length: si hay
  // ficheros, es una imagen del ordenador → subimos; si no, es un bloque que
  // se está reordenando → dejamos que el drop burbujee a la fila (BlockRow).
  const handleDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.files.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      void uploadFile(e.dataTransfer.files[0]);
    }
    // Si no hay ficheros: no hacemos nada y el evento sigue su curso normal
    // (reordenado de bloques gestionado por BlockRow).
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Solo interceptamos cuando se arrastra un fichero (no un bloque).
    if (Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      if (!dragActive) setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.types).includes('Files')) {
      setDragActive(false);
    }
  };

  return (
    <div style={{ margin: '25px 0' }}>
      {/* Zona de imagen / soltar: vista previa si hay URL, si no un recuadro
          punteado que invita a soltar o subir. */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          borderRadius: 8,
          border: dragActive ? '2px dashed #1F3A5F' : '1px dashed #C9C1B4',
          backgroundColor: dragActive ? 'rgba(31,58,95,0.04)' : 'transparent',
          marginBottom: 12,
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
      >
        {block.url.trim() ? (
          <div style={{ position: 'relative', padding: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.url}
              alt={block.alt}
              style={{ maxWidth: '100%', borderRadius: 6, display: 'block', margin: '0 auto' }}
            />
            {dragActive && (
              <div
                className="absolute inset-0 flex items-center justify-center text-sm font-medium"
                style={{ color: '#1F3A5F', backgroundColor: 'rgba(250,247,240,0.85)', borderRadius: 6 }}
              >
                Suelta para reemplazar la imagen
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-sm text-center gap-1"
            style={{ minHeight: 120, color: '#A09A92', fontFamily: 'Georgia,serif', padding: 16 }}
          >
            {uploading ? (
              <span style={{ color: '#1F3A5F' }}>Subiendo…</span>
            ) : (
              <>
                <span>Arrastra una imagen aquí</span>
                <span style={{ fontSize: 12 }}>o usa los botones de abajo</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controles: subir archivo + pegar enlace + texto alternativo. */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-azul/20 bg-azul text-white font-medium hover:bg-azul/90 disabled:opacity-60 transition-colors"
          >
            {uploading ? 'Subiendo…' : '⬆ Subir imagen'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-xs text-texto/50">o pega un enlace de imagen:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={block.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="Pegar enlace de imagen (https://…)"
            className="flex-1 px-3 py-2 border border-azul/15 rounded-lg text-sm text-texto focus:outline-none focus:border-azul bg-white font-mono"
          />
          <input
            type="text"
            value={block.alt}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Texto alternativo"
            className="flex-1 px-3 py-2 border border-azul/15 rounded-lg text-sm text-texto focus:outline-none focus:border-azul bg-white"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Campo contentEditable NO controlado.
// - Siembra el contenido UNA sola vez al montar (o cuando initialHtml cambia
//   por una carga externa de preset, detectada con un ref "seeded").
// - React NUNCA reescribe el innerHTML durante la edición ⇒ el cursor no salta.
// - Sincroniza al estado del padre en onBlur (onCommit).
// - Placeholder gris cuando está vacío (vía :empty + atributo data-placeholder).
// ===========================================================================
function Editable({
  initialHtml,
  placeholder,
  onCommit,
  asHtml = false,
  style,
}: {
  initialHtml: string;
  placeholder: string;
  onCommit: (value: string) => void;
  asHtml?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Último valor sembrado en el DOM: si el padre cambia initialHtml (p. ej. al
  // cargar un preset) y NO coincide con lo que hay dentro, re-sembramos. Durante
  // la edición normal initialHtml no cambia (es no controlado), así que no se
  // toca el DOM y el cursor se mantiene.
  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (seededRef.current === initialHtml) return;
    // Solo reescribimos si el DOM difiere realmente, para no pisar la edición
    // en curso ni mover el cursor sin necesidad.
    const current = asHtml ? el.innerHTML : el.innerText;
    if (current !== initialHtml) {
      if (asHtml) {
        el.innerHTML = initialHtml;
      } else {
        el.innerText = initialHtml;
      }
    }
    seededRef.current = initialHtml;
  }, [initialHtml, asHtml]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const value = asHtml ? el.innerHTML : el.innerText;
    const normalized = value === '<br>' ? '' : value;
    seededRef.current = normalized;
    onCommit(normalized.trim() === '' ? '' : normalized);
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      onBlur={commit}
      className="rlp-editable"
      style={{
        outline: 'none',
        cursor: 'text',
        minHeight: '1.2em',
        ...style,
      }}
    />
  );
}
