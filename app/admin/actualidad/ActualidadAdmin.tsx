'use client';

import { useCallback, useEffect, useState } from 'react';

// =====================================================
// ADMIN — Actualidad: revisar el borrador semanal y publicarlo
// =====================================================
// El trabajo de los lunes deja la edición como borrador. Aquí se quitan,
// corrigen o añaden noticias y se publica; si nadie lo hace, el borrador se
// publica solo en la fecha que se muestra. Habla con /api/admin/news.

type State = 'draft' | 'published' | 'retired';

interface Item {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  country: string | null;
  published_at: string | null;
  is_published: boolean;
}

interface Edition {
  id: string;
  edition_date: string;
  intro: string | null;
  state: State;
  auto_publish_at: string | null;
  published_at: string | null;
  items: Item[];
}

const MIN_TO_PUBLISH = 5;

const STATE_LABEL: Record<State, { text: string; cls: string }> = {
  draft: { text: 'Borrador', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  published: { text: 'Publicada', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  retired: { text: 'Retirada', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function formatDay(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid',
  });
}

function formatMoment(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
}

async function call(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export default function ActualidadAdmin() {
  const [editions, setEditions] = useState<Edition[] | null>(null);
  const [today, setToday] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/news');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setEditions(data.editions);
      setToday(data.today);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando las ediciones');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Ejecuta una acción, muestra el resultado y recarga.
  const run = async (body: Record<string, unknown>, ok: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await call(body);
      setNotice(ok);
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!editions && !error) return <p className="text-texto/60">Cargando…</p>;

  const drafts = (editions || []).filter((e) => e.state === 'draft');
  const others = (editions || []).filter((e) => e.state !== 'draft');
  const hasToday = (editions || []).some((e) => e.edition_date === today);

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">{notice}</div>
      )}

      {editions && drafts.length === 0 && (
        <section className="bg-white rounded-2xl p-6 border border-azul/10 shadow-sm">
          <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul">No hay borrador pendiente</h2>
          <p className="text-sm text-texto/60 mt-1">
            Cada lunes se prepara uno solo y te llega un correo. Si esta semana no llegó, puedes montar la edición a mano.
          </p>
          {!hasToday && (
            <button
              disabled={busy}
              onClick={() => run({ action: 'create_draft' }, 'Edición creada: añade las noticias y publícala.')}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-azul rounded-xl hover:bg-azul/90 disabled:opacity-50"
            >
              Crear la edición de hoy a mano
            </button>
          )}
        </section>
      )}

      {drafts.map((e) => (
        <EditionCard key={e.id} edition={e} busy={busy} run={run} highlighted />
      ))}

      {others.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-lora)] text-lg font-semibold text-azul mb-3">Ediciones anteriores</h2>
          <div className="space-y-3">
            {others.map((e) =>
              openId === e.id ? (
                <EditionCard key={e.id} edition={e} busy={busy} run={run} onClose={() => setOpenId(null)} />
              ) : (
                <button
                  key={e.id}
                  onClick={() => setOpenId(e.id)}
                  className="w-full flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-azul/10 hover:border-azul/30 text-left"
                >
                  <span className="text-azul font-medium capitalize">{formatDay(e.edition_date)}</span>
                  <span className="flex items-center gap-3 text-sm text-texto/60">
                    {e.items.length} noticias
                    <StateBadge state={e.state} />
                  </span>
                </button>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: State }) {
  const s = STATE_LABEL[state];
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${s.cls}`}>{s.text}</span>;
}

type Run = (body: Record<string, unknown>, ok: string, confirmText?: string) => Promise<boolean>;

function EditionCard({
  edition: e,
  busy,
  run,
  highlighted,
  onClose,
}: {
  edition: Edition;
  busy: boolean;
  run: Run;
  highlighted?: boolean;
  onClose?: () => void;
}) {
  const [intro, setIntro] = useState(e.intro || '');
  const [adding, setAdding] = useState(false);
  const enough = e.items.length >= MIN_TO_PUBLISH;

  return (
    <section
      className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-sm space-y-5 ${
        highlighted ? 'border-amber-300 ring-1 ring-amber-200' : 'border-azul/10'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul capitalize">
              {formatDay(e.edition_date)}
            </h2>
            <StateBadge state={e.state} />
          </div>
          <p className="text-sm text-texto/60 mt-1">
            {e.items.length} noticias
            {e.state === 'draft' &&
              (e.auto_publish_at
                ? ` · se publicará sola el ${formatMoment(e.auto_publish_at)}`
                : ' · en pausa: solo se publica a mano')}
            {e.state === 'published' && (
              <>
                {' · '}
                <a href={`/actualidad/${e.edition_date}`} target="_blank" rel="noopener noreferrer" className="underline">
                  ver página
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {e.state !== 'published' && (
            <button
              disabled={busy || !enough}
              title={enough ? '' : `Hacen falta al menos ${MIN_TO_PUBLISH} noticias`}
              onClick={() =>
                run(
                  { action: 'publish', edition_id: e.id },
                  'Publicada. Ya está en la web.',
                  `¿Publicar ahora la edición con ${e.items.length} noticias?`
                )
              }
              className="px-4 py-2 text-sm font-semibold text-white bg-azul rounded-xl hover:bg-azul/90 disabled:opacity-40"
            >
              {e.state === 'retired' ? 'Volver a publicar' : 'Publicar ahora'}
            </button>
          )}
          {e.state === 'draft' && (
            <button
              disabled={busy}
              onClick={() =>
                run(
                  { action: e.auto_publish_at ? 'pause' : 'resume', edition_id: e.id },
                  e.auto_publish_at ? 'En pausa: no se publicará sola.' : 'Se publicará sola en 48 horas.'
                )
              }
              className="px-4 py-2 text-sm text-azul border border-azul/20 rounded-xl hover:bg-azul/5 disabled:opacity-40"
            >
              {e.auto_publish_at ? 'Pausar' : 'Reanudar'}
            </button>
          )}
          {e.state !== 'retired' && (
            <button
              disabled={busy}
              onClick={() =>
                run(
                  { action: 'retire', edition_id: e.id },
                  e.state === 'draft' ? 'Borrador descartado.' : 'Edición retirada de la web.',
                  e.state === 'draft'
                    ? '¿Descartar este borrador? No se publicará.'
                    : '¿Retirar esta edición de la web? Se puede volver a publicar.'
                )
              }
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-40"
            >
              {e.state === 'draft' ? 'Descartar' : 'Retirar'}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="px-3 py-2 text-sm text-texto/60 hover:text-azul">
              Cerrar
            </button>
          )}
        </div>
      </div>

      {!enough && e.state !== 'published' && (
        <p className="text-sm text-amber-700">
          Faltan noticias: hacen falta al menos {MIN_TO_PUBLISH} para publicar.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-texto/70 mb-1">Entradilla de la semana</label>
        <textarea
          value={intro}
          onChange={(ev) => setIntro(ev.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm text-texto bg-marfil/40 border border-azul/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-azul/20"
        />
        <div className="flex items-center justify-between mt-1">
          <Counter value={intro} min={80} max={600} optional />
          {intro !== (e.intro || '') && (
            <button
              disabled={busy}
              onClick={() => run({ action: 'update_intro', edition_id: e.id, intro }, 'Entradilla guardada.')}
              className="text-sm font-medium text-azul hover:underline disabled:opacity-40"
            >
              Guardar entradilla
            </button>
          )}
        </div>
      </div>

      <ol className="space-y-4">
        {e.items.map((item, i) => (
          <ItemEditor key={item.id} item={item} index={i + 1} busy={busy} run={run} lastOnes={e.items.length <= MIN_TO_PUBLISH && e.state === 'published'} />
        ))}
      </ol>

      {e.state !== 'retired' &&
        (adding ? (
          <AddItemForm editionId={e.id} busy={busy} run={run} onDone={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full py-3 text-sm font-medium text-azul border border-dashed border-azul/30 rounded-xl hover:bg-azul/5"
          >
            + Añadir una noticia a mano
          </button>
        ))}
    </section>
  );
}

function Counter({ value, min, max, optional }: { value: string; min: number; max: number; optional?: boolean }) {
  const n = value.replace(/\s+/g, ' ').trim().length;
  const ok = (optional && n === 0) || (n >= min && n <= max);
  return (
    <span className={`text-xs ${ok ? 'text-texto/40' : 'text-red-600'}`}>
      {n} / {min}–{max} caracteres
    </span>
  );
}

function ItemEditor({
  item,
  index,
  busy,
  run,
  lastOnes,
}: {
  item: Item;
  index: number;
  busy: boolean;
  run: Run;
  lastOnes: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [summary, setSummary] = useState(item.summary);
  const dirty = title !== item.title || summary !== item.summary;
  const date = item.published_at
    ? new Date(item.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' })
    : '';

  return (
    <li className="rounded-xl border border-azul/10 bg-marfil/30 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs text-texto/50">
        <span>
          {index}. {item.source_name} · {item.country || 'Internacional'} {date && `· ${date}`}
        </span>
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-azul hover:underline shrink-0">
          Leer en el medio ↗
        </a>
      </div>
      <input
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        className="w-full px-3 py-2 text-base font-semibold text-azul bg-white border border-azul/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul/20"
      />
      <Counter value={title} min={15} max={140} />
      <textarea
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm text-texto bg-white border border-azul/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul/20"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Counter value={summary} min={60} max={420} />
        <div className="flex gap-3">
          {dirty && (
            <>
              <button
                onClick={() => {
                  setTitle(item.title);
                  setSummary(item.summary);
                }}
                className="text-sm text-texto/60 hover:text-azul"
              >
                Deshacer
              </button>
              <button
                disabled={busy}
                onClick={() => run({ action: 'update_item', item_id: item.id, title, summary }, 'Noticia guardada.')}
                className="text-sm font-semibold text-azul hover:underline disabled:opacity-40"
              >
                Guardar
              </button>
            </>
          )}
          <button
            disabled={busy}
            onClick={() =>
              run(
                { action: 'delete_item', item_id: item.id },
                'Noticia quitada.',
                lastOnes
                  ? 'Esta edición ya está publicada y se quedará con menos de 5 noticias. ¿Quitarla igualmente?'
                  : '¿Quitar esta noticia de la edición?'
              )
            }
            className="text-sm text-red-600 hover:underline disabled:opacity-40"
          >
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}

function AddItemForm({
  editionId,
  busy,
  run,
  onDone,
}: {
  editionId: string;
  busy: boolean;
  run: Run;
  onDone: () => void;
}) {
  const [f, setF] = useState({
    source_url: '',
    source_name: '',
    country: 'España',
    published_at: new Date().toISOString().slice(0, 10),
    title: '',
    summary: '',
  });
  const set = (k: keyof typeof f) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: ev.target.value });
  const input =
    'w-full px-3 py-2 text-sm text-texto bg-white border border-azul/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul/20';

  return (
    <form
      className="rounded-xl border border-azul/20 p-4 space-y-3"
      onSubmit={async (ev) => {
        ev.preventDefault();
        const ok = await run(
          {
            action: 'add_item',
            edition_id: editionId,
            item: { ...f, published_at: `${f.published_at}T12:00:00Z` },
          },
          'Noticia añadida.'
        );
        if (ok) onDone();
      }}
    >
      <p className="text-sm text-texto/70">
        Escribe el titular y el resumen con tus palabras: no copies frases del medio (solo se puede enlazar).
      </p>
      <input required type="url" placeholder="Enlace al artículo (https://…)" value={f.source_url} onChange={set('source_url')} className={input} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input required placeholder="Medio (p. ej. Alfa y Omega)" value={f.source_name} onChange={set('source_name')} className={input} />
        <input placeholder="País" value={f.country} onChange={set('country')} className={input} />
        <input required type="date" value={f.published_at} onChange={set('published_at')} className={input} />
      </div>
      <div>
        <input required placeholder="Titular propio" value={f.title} onChange={set('title')} className={input} />
        <Counter value={f.title} min={15} max={140} />
      </div>
      <div>
        <textarea required rows={3} placeholder="Resumen propio (2-3 frases)" value={f.summary} onChange={set('summary')} className={input} />
        <Counter value={f.summary} min={60} max={420} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onDone} className="px-4 py-2 text-sm text-texto/60 hover:text-azul">
          Cancelar
        </button>
        <button type="submit" disabled={busy} className="px-4 py-2 text-sm font-semibold text-white bg-azul rounded-xl hover:bg-azul/90 disabled:opacity-50">
          Añadir
        </button>
      </div>
    </form>
  );
}
