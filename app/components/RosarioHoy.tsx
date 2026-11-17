'use client';

import { useEffect, useState } from 'react';
import { DownloadLink } from './StoreButtons';
import { GRUPOS, ORDEN_SEMANA, SEMANA, hoyRosario, type HoyRosario } from '@/lib/content/rosario';

// La respuesta del día. El servidor la escribe con la fecha de Madrid (es lo
// que lee Google); al cargar, se corrige con la fecha de quien lee, para que
// alguien en América no vea «hoy» con el día de España ya cambiado.
export default function RosarioHoy({ inicial }: { inicial: HoyRosario }) {
  const [hoy, setHoy] = useState(inicial);
  // También al volver a la pestaña: quien la dejó abierta anoche no debe
  // seguir viendo el día de ayer.
  useEffect(() => {
    const ajustar = () => {
      const local = hoyRosario();
      setHoy((actual) => (actual.iso === local.iso ? actual : local));
    };
    ajustar();
    const alVolver = () => {
      if (document.visibilityState === 'visible') ajustar();
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', ajustar);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', ajustar);
    };
  }, []);

  const grupo = GRUPOS[SEMANA[hoy.diaSemana].grupo];

  return (
    <>
      {/* Respuesta directa: lo primero que se lee */}
      <div className="rounded-2xl border border-albero/50 bg-white p-6 sm:p-8 space-y-4">
        <p className="text-xl sm:text-2xl text-texto/90 leading-snug">
          Hoy es <time dateTime={hoy.iso}>{hoy.etiqueta}</time>: se rezan los{' '}
          <strong className="text-azul">{grupo.nombre}</strong>.
        </p>
        <p className="text-texto/80 leading-relaxed">{grupo.resumen}</p>
        <DownloadLink
          where="rosario-de-hoy-inicio"
          className="inline-block bg-azul text-white px-6 py-3 rounded-lg font-medium hover:bg-azul-800 transition-colors shadow-sm"
        >
          Rezarlo ahora con audio
        </DownloadLink>
      </div>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-5">
          Los cinco {grupo.nombre} de hoy
        </h2>
        <ol className="space-y-5">
          {grupo.misterios.map((m, i) => (
            <li key={m.titulo} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-azul text-white font-semibold"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-lg text-azul leading-snug">{m.titulo}</h3>
                <p className="text-texto/85 leading-relaxed mt-1">{m.texto}</p>
                {m.cita ? <p className="text-sm text-texto/70 mt-1">{m.cita}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mb-4">
          Qué misterios se rezan cada día de la semana
        </h2>
        <table className="w-full text-left border-y border-azul/10">
          <thead className="sr-only">
            <tr>
              <th scope="col">Día</th>
              <th scope="col">Misterios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-azul/10">
            {ORDEN_SEMANA.map((d) => {
              const esHoy = d === hoy.diaSemana;
              return (
                <tr key={d} className={esHoy ? 'bg-albero/15' : undefined}>
                  <th scope="row" className="py-3 pl-3 pr-4 font-semibold text-azul whitespace-nowrap">
                    {SEMANA[d].dia}
                    {esHoy ? <span className="ml-2 text-sm font-medium text-[#8a6d1f]">hoy</span> : null}
                  </th>
                  <td className="py-3 pr-3 text-texto/85">
                    <span className="capitalize">{GRUPOS[SEMANA[d].grupo].id}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
