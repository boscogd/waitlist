// =====================================================
// TIENDA · ETIQUETA COSIDA
// =====================================================
// La seña de la tienda: cada pieza hecha a mano lleva una etiqueta de tela
// «cosida» con quién la hace, cuántas horas lleva y cuántas quedan este mes.
// Es escasez de verdad, con cifra y causa (inventarla es ilegal en la UE).
// La posición la decide quien la usa (className); por defecto, en el flujo.
import type { Hechura } from '@/lib/tienda/catalogo';

export default function Etiqueta({
  hechura,
  grande = false,
  compacta = false,
  className = 'relative',
}: {
  hechura: Hechura;
  grande?: boolean;
  compacta?: boolean;
  className?: string;
}) {
  const { quien, horas, mes, nota } = hechura;
  const quedan = mes ? `Quedan ${mes.quedan} de ${mes.hechas} este mes` : (nota ?? 'Por encargo');

  // En las tarjetas: una tira estrecha que asoma por el borde del dibujo.
  if (compacta) {
    return (
      <div
        className={`bg-[#FBF8F1] px-3 py-1.5 text-azul shadow-[0_6px_14px_-8px_rgba(22,38,63,0.5)] -rotate-2 ${className}`}
        style={{ outline: '1.5px dashed #C9A23F', outlineOffset: '-4px' }}
      >
        <p className="whitespace-nowrap font-[family-name:var(--font-lora)] text-[13px] italic leading-tight">{quien}</p>
        <p className="whitespace-nowrap text-[11px] font-medium leading-tight tabular-nums text-azul/80">{quedan}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#FBF8F1] text-azul shadow-[0_6px_18px_-8px_rgba(22,38,63,0.45)] ${
        grande ? 'w-60 px-5 py-4 -rotate-2' : 'w-[9.5rem] px-3 py-2.5 rotate-3'
      } ${className}`}
      style={{ outline: '1.5px dashed #C9A23F', outlineOffset: grande ? '-7px' : '-5px' }}
    >
      {/* Las dos puntadas que la sujetan */}
      <span aria-hidden="true" className="absolute left-1/2 -top-1.5 flex -translate-x-1/2 gap-2">
        <span className="h-3 w-[2px] rounded bg-albero" />
        <span className="h-3 w-[2px] rounded bg-albero" />
      </span>
      <p className={`font-semibold uppercase tracking-[0.18em] text-azul/55 ${grande ? 'text-[10px]' : 'text-[8.5px]'}`}>Hecho a mano</p>
      <p className={`font-[family-name:var(--font-lora)] italic leading-tight ${grande ? 'mt-1 text-lg' : 'mt-0.5 text-sm'}`}>{quien}</p>
      {grande ? (
        <dl className="mt-2 space-y-0.5 text-[13px] tabular-nums">
          <div className="flex justify-between gap-2">
            <dt className="text-azul/60">Trabajo</dt>
            <dd className="font-medium">{horas}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-azul/60">{mes ? 'Este mes' : 'Cuándo'}</dt>
            <dd className="font-medium">{mes ? `quedan ${mes.quedan} de ${mes.hechas}` : (nota ?? 'por encargo').toLowerCase()}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-1 text-[11px] leading-snug text-azul/75 tabular-nums">
          {horas} de trabajo
          <br />
          <span className="font-medium text-azul">{quedan}</span>
        </p>
      )}
    </div>
  );
}
