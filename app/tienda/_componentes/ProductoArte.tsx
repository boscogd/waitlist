// =====================================================
// TIENDA · ILUSTRACIONES DE PRODUCTO (DEMO)
// =====================================================
// Hasta que haya fotos reales, cada producto se dibuja en SVG: figuras de
// amigurumi (formas redondas con textura de punto), escapularios, capillita y
// prendas. Las texturas («punto», «lana», «rizo») se definen una sola vez en
// <TiendaDefs/>, dentro del layout de la tienda.
import type { Arte } from '@/lib/tienda/catalogo';

const C = {
  lino: '#EDE4D0',
  linoOsc: '#E2D6BC',
  manto: '#3E5C8A',
  piel: '#F1D2B4',
  pielOsc: '#9A6646',
  mejilla: '#E39A95',
  pelo: '#6B4A2F',
  tunica: '#9C7A55',
  cuerda: '#C9A46A',
  paja: '#D9B45A',
  madera: '#B98B5A',
  maderaOsc: '#8F6640',
  blanco: '#FBF8F1',
  tinta: '#1F2937',
  buey: '#8A5A3B',
  mula: '#8C8A86',
  oro: '#E1B955',
  azul: '#1F3A5F',
  azulSuave: '#DCE3EC',
  alberoSuave: '#F3E6C4',
  rojo: '#A33B3B',
  verde: '#4F7A5A',
  morado: '#5E4B7A',
};

/** Texturas compartidas. Va una vez en el layout de la tienda. */
export function TiendaDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {/* Punto de ganchillo: filas de «v» */}
        <pattern id="t-punto" width="9" height="8" patternUnits="userSpaceOnUse">
          <path d="M1 1 L4.5 6 L8 1" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="1.3" strokeLinecap="round" />
        </pattern>
        {/* Lana: trama fina cruzada */}
        <pattern id="t-lana" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0 M-1 1 L1 -1 M5 7 L7 5" stroke="#fff" strokeOpacity="0.14" strokeWidth="1" />
        </pattern>
        {/* Rizo del forro polar */}
        <pattern id="t-rizo" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.4" fill="#fff" fillOpacity="0.09" />
          <circle cx="8" cy="8" r="1.4" fill="#fff" fillOpacity="0.09" />
        </pattern>
      </defs>
    </svg>
  );
}

function Cara({ y = 0, piel = C.piel, dormido = false }: { y?: number; piel?: string; dormido?: boolean }) {
  return (
    <g transform={`translate(0 ${y})`}>
      {dormido ? (
        <>
          <path d="M-12 0 Q-9 3 -6 0" stroke={C.tinta} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M6 0 Q9 3 12 0" stroke={C.tinta} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-11" cy="0" r="2.8" fill={C.tinta} />
          <circle cx="11" cy="0" r="2.8" fill={C.tinta} />
        </>
      )}
      <circle cx="-19" cy="10" r="5" fill={C.mejilla} opacity={piel === C.piel ? 0.55 : 0.35} />
      <circle cx="19" cy="10" r="5" fill={C.mejilla} opacity={piel === C.piel ? 0.55 : 0.35} />
      <path d="M-5 12 Q0 16 5 12" stroke={C.tinta} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cuerpo({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <path d={d} fill={fill} />
      <path d={d} fill="url(#t-punto)" />
    </>
  );
}

function Virgen() {
  const cuerpo = 'M-55 0 Q-52 -96 0 -110 Q52 -96 55 0 Z';
  return (
    <g>
      <ellipse cx="0" cy="2" rx="58" ry="8" fill="#000" opacity="0.08" />
      <Cuerpo d={cuerpo} fill={C.manto} />
      <circle cx="0" cy="-128" r="47" fill={C.manto} />
      <circle cx="0" cy="-128" r="47" fill="url(#t-punto)" />
      <circle cx="0" cy="-120" r="33" fill={C.piel} />
      <Cara y={-122} />
      <circle cx="0" cy="-58" r="11" fill={C.piel} />
      <path d="M-7 -60 L7 -60" stroke={C.manto} strokeWidth="1.5" opacity="0.4" />
    </g>
  );
}

function Jose() {
  const cuerpo = 'M-56 0 Q-52 -100 0 -112 Q52 -100 56 0 Z';
  return (
    <g>
      <ellipse cx="6" cy="2" rx="64" ry="8" fill="#000" opacity="0.08" />
      <Cuerpo d={cuerpo} fill={C.tunica} />
      <rect x="-50" y="-58" width="100" height="7" rx="3" fill={C.cuerda} />
      <circle cx="0" cy="-134" r="38" fill={C.pelo} />
      <circle cx="0" cy="-124" r="32" fill={C.piel} />
      <Cara y={-128} />
      <path d="M-30 -116 Q0 -74 30 -116 Q0 -100 -30 -116 Z" fill={C.pelo} />
      <line x1="66" y1="0" x2="66" y2="-168" stroke="#7A5636" strokeWidth="6" strokeLinecap="round" />
      <path d="M66 -168 Q67 -190 50 -186" stroke="#7A5636" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="58" cy="-80" r="10" fill={C.piel} />
    </g>
  );
}

function Nino() {
  return (
    <g>
      <ellipse cx="0" cy="3" rx="56" ry="7" fill="#000" opacity="0.08" />
      <path d="M-46 0 L-58 22 M46 0 L58 22" stroke={C.maderaOsc} strokeWidth="5" strokeLinecap="round" transform="translate(0 -22)" />
      <path d="M-54 -38 L54 -38 L42 0 L-42 0 Z" fill={C.madera} />
      <path d="M-54 -38 L54 -38 L42 0 L-42 0 Z" fill="url(#t-punto)" />
      <path
        d="M-52 -40 l7 -9 l6 9 l8 -10 l7 10 l8 -9 l7 9 l8 -10 l7 10 l8 -9 l6 9 l8 -10 l6 10 l7 -8"
        stroke={C.paja}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="6" cy="-54" rx="40" ry="18" fill={C.blanco} />
      <ellipse cx="6" cy="-54" rx="40" ry="18" fill="url(#t-punto)" />
      <circle cx="-30" cy="-60" r="23" fill="none" stroke={C.oro} strokeWidth="3" />
      <circle cx="-30" cy="-58" r="16" fill={C.piel} />
      <g transform="translate(-30 -58) scale(0.6)">
        <Cara dormido />
      </g>
    </g>
  );
}

function Animal({ tipo }: { tipo: 'buey' | 'mula' }) {
  const col = tipo === 'buey' ? C.buey : C.mula;
  return (
    <g>
      <ellipse cx="0" cy="2" rx="66" ry="8" fill="#000" opacity="0.08" />
      <ellipse cx="0" cy="-30" rx="62" ry="32" fill={col} />
      <ellipse cx="0" cy="-30" rx="62" ry="32" fill="url(#t-punto)" />
      {tipo === 'buey' ? (
        <path d="M-80 -86 Q-92 -100 -84 -110 M-46 -86 Q-34 -100 -42 -110" stroke={C.blanco} strokeWidth="6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-78 -82 L-84 -122 L-68 -88 M-50 -82 L-44 -122 L-58 -88" fill={col} stroke={col} strokeWidth="8" strokeLinejoin="round" />
      )}
      <circle cx="-63" cy="-64" r="28" fill={col} />
      <circle cx="-63" cy="-64" r="28" fill="url(#t-punto)" />
      <ellipse cx="-66" cy="-48" rx="17" ry="11" fill={tipo === 'buey' ? '#C9A27E' : '#BDBAB4'} />
      <circle cx="-72" cy="-49" r="2" fill={C.tinta} />
      <circle cx="-60" cy="-49" r="2" fill={C.tinta} />
      <circle cx="-73" cy="-70" r="2.6" fill={C.tinta} />
      <circle cx="-53" cy="-70" r="2.6" fill={C.tinta} />
    </g>
  );
}

function Rey({ manto, piel = C.piel, regalo }: { manto: string; piel?: string; regalo: string }) {
  const cuerpo = 'M-52 0 Q-50 -94 0 -108 Q50 -94 52 0 Z';
  return (
    <g>
      <ellipse cx="0" cy="2" rx="56" ry="8" fill="#000" opacity="0.08" />
      <Cuerpo d={cuerpo} fill={manto} />
      <path d="M-30 -100 L-40 0 M30 -100 L40 0" stroke={C.oro} strokeWidth="4" opacity="0.8" />
      <circle cx="0" cy="-122" r="32" fill={piel} />
      <Cara y={-124} piel={piel} />
      <path d="M-28 -146 L-28 -168 L-14 -154 L0 -174 L14 -154 L28 -168 L28 -146 Z" fill={C.oro} />
      <circle cx="0" cy="-160" r="3" fill={C.rojo} />
      <rect x="-14" y="-74" width="28" height="22" rx="3" fill={regalo} stroke={C.oro} strokeWidth="3" />
      <circle cx="-16" cy="-60" r="9" fill={piel} />
      <circle cx="16" cy="-60" r="9" fill={piel} />
    </g>
  );
}

function Estrella({ x, y, r = 22 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return <polygon points={pts} fill={C.oro} />;
}

function PiezaEscapulario({ x, y, rot, fondo, borde, children }: { x: number; y: number; rot: number; fondo: string; borde: string; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-52" y="-62" width="104" height="124" rx="6" fill="#000" opacity="0.08" transform="translate(4 6)" />
      <rect x="-52" y="-62" width="104" height="124" rx="6" fill={fondo} />
      <rect x="-52" y="-62" width="104" height="124" rx="6" fill="url(#t-lana)" />
      <rect x="-42" y="-52" width="84" height="104" rx="3" fill="none" stroke={borde} strokeWidth="2.5" strokeDasharray="6 5" />
      {children}
    </g>
  );
}

function Prenda({ silueta, color, textura = 't-punto' }: { silueta: string; color: string; textura?: string }) {
  return (
    <>
      <path d={silueta} fill="#000" opacity="0.07" transform="translate(6 8)" />
      <path d={silueta} fill={color} />
      <path d={silueta} fill={`url(#${textura})`} />
    </>
  );
}

const SILUETA_POLAR =
  'M140 96 L170 84 Q200 100 230 84 L260 96 L330 132 L356 262 L318 270 L300 178 L300 332 L100 332 L100 178 L82 270 L44 262 L70 132 Z';
const SILUETA_CAMISETA =
  'M135 96 L170 84 Q200 106 230 84 L265 96 L332 142 L306 188 L276 168 L276 332 L124 332 L124 168 L94 188 L68 142 Z';

function Escena({ arte }: { arte: Arte }) {
  switch (arte) {
    case 'misterio':
      return (
        <>
          <g transform="translate(118 318)"><Virgen /></g>
          <g transform="translate(278 318)"><Jose /></g>
          <g transform="translate(200 352)"><Nino /></g>
        </>
      );
    case 'misterio-animales':
      return (
        <>
          <g transform="translate(96 250) scale(0.72)"><Animal tipo="buey" /></g>
          <g transform="translate(318 250) scale(-0.72 0.72)"><Animal tipo="mula" /></g>
          <g transform="translate(132 330) scale(0.82)"><Virgen /></g>
          <g transform="translate(262 330) scale(0.82)"><Jose /></g>
          <g transform="translate(198 360) scale(0.86)"><Nino /></g>
        </>
      );
    case 'reyes':
      return (
        <>
          <g transform="translate(92 320) scale(0.86)"><Rey manto={C.rojo} regalo={C.oro} /></g>
          <g transform="translate(200 340) scale(0.9)"><Rey manto={C.verde} regalo="#A9744A" /></g>
          <g transform="translate(308 320) scale(0.86)"><Rey manto={C.morado} piel={C.pielOsc} regalo={C.blanco} /></g>
          <Estrella x={200} y={70} r={20} />
        </>
      );
    case 'belen-completo':
      return (
        <>
          <Estrella x={200} y={58} r={20} />
          <path d="M200 80 L200 120" stroke={C.oro} strokeWidth="2" strokeDasharray="3 5" />
          <g transform="translate(62 236) scale(0.5)"><Animal tipo="buey" /></g>
          <g transform="translate(340 236) scale(-0.5 0.5)"><Animal tipo="mula" /></g>
          <g transform="translate(150 280) scale(0.62)"><Virgen /></g>
          <g transform="translate(250 280) scale(0.62)"><Jose /></g>
          <g transform="translate(200 300) scale(0.64)"><Nino /></g>
          <g transform="translate(70 360) scale(0.5)"><Rey manto={C.rojo} regalo={C.oro} /></g>
          <g transform="translate(130 372) scale(0.5)"><Rey manto={C.verde} regalo="#A9744A" /></g>
          <g transform="translate(330 362) scale(0.5)"><Rey manto={C.morado} piel={C.pielOsc} regalo={C.blanco} /></g>
        </>
      );
    case 'escapulario':
      return (
        <>
          <path d="M150 128 C120 40 280 40 250 128" fill="none" stroke={C.pelo} strokeWidth="4" />
          <path d="M146 128 C 90 10 310 10 254 128" fill="none" stroke={C.pelo} strokeWidth="4" opacity="0.6" />
          <PiezaEscapulario x={140} y={208} rot={-6} fondo={C.pelo} borde="#E8D9B8">
            <path d="M0 -26 L0 18 M-14 -10 L14 -10" stroke={C.oro} strokeWidth="5" strokeLinecap="round" />
            <circle cx="-16" cy="30" r="3.5" fill={C.oro} />
            <circle cx="0" cy="34" r="3.5" fill={C.oro} />
            <circle cx="16" cy="30" r="3.5" fill={C.oro} />
          </PiezaEscapulario>
          <PiezaEscapulario x={262} y={222} rot={7} fondo={C.pelo} borde="#E8D9B8">
            <path d="M-22 22 L0 -18 L22 22 Z" fill={C.oro} opacity="0.9" />
            <path d="M0 -40 L0 -22 M-7 -33 L7 -33" stroke={C.oro} strokeWidth="4" strokeLinecap="round" />
          </PiezaEscapulario>
        </>
      );
    case 'escapulario-comunion':
      return (
        <>
          <path d="M148 128 C120 40 280 40 252 128" fill="none" stroke={C.oro} strokeWidth="3.5" />
          <PiezaEscapulario x={142} y={210} rot={-6} fondo={C.blanco} borde={C.oro}>
            <path d="M0 -30 L0 6 M-12 -18 L12 -18" stroke={C.oro} strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="24" r="10" fill="none" stroke={C.oro} strokeWidth="3" />
          </PiezaEscapulario>
          <PiezaEscapulario x={262} y={222} rot={7} fondo={C.blanco} borde={C.oro}>
            <text x="0" y="-4" textAnchor="middle" fontFamily="var(--font-lora), Georgia, serif" fontStyle="italic" fontSize="26" fill="#B8912E">Lucía</text>
            <text x="0" y="22" textAnchor="middle" fontFamily="var(--font-inter), sans-serif" fontSize="11" letterSpacing="1" fill="#B8912E">10 · V · 2027</text>
          </PiezaEscapulario>
        </>
      );
    case 'capillita':
      return (
        <>
          <path d="M200 40 L200 70 M188 52 L212 52" stroke={C.maderaOsc} strokeWidth="6" strokeLinecap="round" />
          <path d="M112 342 L112 176 Q112 78 200 78 Q288 78 288 176 L288 342 Z" fill="#000" opacity="0.08" transform="translate(6 8)" />
          <path d="M112 342 L112 176 Q112 78 200 78 Q288 78 288 176 L288 342 Z" fill={C.madera} />
          <path d="M112 342 L112 176 Q112 78 200 78 Q288 78 288 176 L288 342 Z" fill="url(#t-lana)" />
          <path d="M138 318 L138 182 Q138 106 200 106 Q262 106 262 182 L262 318 Z" fill={C.azul} />
          <path d="M138 318 L138 182 Q138 106 200 106 Q262 106 262 182 L262 318 Z" fill="none" stroke={C.oro} strokeWidth="3" strokeDasharray="2 6" />
          <circle cx="200" cy="168" r="30" fill="none" stroke={C.oro} strokeWidth="2.5" />
          <path d="M168 300 Q170 214 200 202 Q230 214 232 300 Z" fill="#7F9CC4" />
          <circle cx="200" cy="176" r="24" fill="#7F9CC4" />
          <circle cx="200" cy="182" r="16" fill={C.piel} />
          <rect x="96" y="336" width="208" height="16" rx="3" fill={C.maderaOsc} />
          <rect x="186" y="296" width="28" height="40" rx="3" fill={C.blanco} />
          <path d="M200 270 Q212 286 200 296 Q188 286 200 270 Z" fill={C.oro} />
        </>
      );
    case 'kit-mayo':
      return (
        <>
          <g transform="translate(200 300)">
            {Array.from({ length: 24 }, (_, i) => {
              const a = (Math.PI * 2 * i) / 24;
              return <circle key={i} cx={(150 * Math.cos(a)).toFixed(1)} cy={(42 * Math.sin(a)).toFixed(1)} r="12" fill={C.blanco} />;
            })}
            <ellipse rx="150" ry="42" fill={C.blanco} />
            <ellipse rx="110" ry="28" fill="none" stroke={C.linoOsc} strokeWidth="2" strokeDasharray="4 4" />
          </g>
          <rect x="146" y="120" width="108" height="150" rx="4" fill={C.oro} />
          <rect x="158" y="132" width="84" height="126" fill={C.azul} />
          <path d="M176 254 Q178 186 200 176 Q222 186 224 254 Z" fill="#7F9CC4" />
          <circle cx="200" cy="164" r="18" fill="#7F9CC4" />
          <circle cx="200" cy="168" r="12" fill={C.piel} />
          <rect x="268" y="226" width="22" height="64" rx="3" fill={C.blanco} stroke={C.linoOsc} />
          <path d="M279 200 Q289 214 279 224 Q269 214 279 200 Z" fill={C.oro} />
          <g stroke={C.verde} strokeWidth="3" strokeLinecap="round">
            <path d="M118 296 Q110 250 96 222" />
            <path d="M118 296 Q122 246 128 214" />
            <path d="M118 296 Q100 262 82 250" />
          </g>
          <circle cx="96" cy="218" r="9" fill="#E8B4C0" />
          <circle cx="129" cy="210" r="8" fill={C.blanco} />
          <circle cx="80" cy="246" r="8" fill="#C9B2DE" />
        </>
      );
    case 'polar':
      return (
        <>
          <Prenda silueta={SILUETA_POLAR} color={C.azul} textura="t-rizo" />
          <path d="M170 84 L170 66 Q200 76 230 66 L230 84 Q200 100 170 84 Z" fill="#16263F" />
          <rect x="100" y="314" width="200" height="18" fill="#16263F" />
          <path d="M318 262 L356 254 L358 270 L320 278 Z M82 262 L44 254 L42 270 L80 278 Z" fill="#16263F" />
          <line x1="200" y1="70" x2="200" y2="156" stroke={C.oro} strokeWidth="3" />
          <rect x="196" y="150" width="8" height="16" rx="2" fill={C.oro} />
          <path d="M256 138 L256 170 M244 150 L268 150" stroke={C.oro} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'sudadera':
      return (
        <>
          <path d="M150 104 Q148 40 200 38 Q252 40 250 104 Z" fill="#E7E1D4" />
          <Prenda silueta={SILUETA_POLAR} color="#F4F0E6" />
          <path d="M168 86 Q200 128 232 86 Q200 104 168 86 Z" fill="#D9D2C2" />
          <path d="M186 104 L184 150 M214 104 L216 150" stroke={C.azul} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M146 258 L254 258 L264 316 L136 316 Z" fill="none" stroke="#D9D2C2" strokeWidth="3" />
          <text x="200" y="196" textAnchor="middle" fontFamily="var(--font-lora), Georgia, serif" fontStyle="italic" fontSize="24" fill={C.azul}>Refugio</text>
          <text x="200" y="214" textAnchor="middle" fontFamily="var(--font-inter), sans-serif" fontSize="8.5" letterSpacing="2.4" fill={C.azul}>EN LA PALABRA</text>
        </>
      );
    case 'camiseta':
      return (
        <>
          <Prenda silueta={SILUETA_CAMISETA} color="#FBF7EE" />
          <path d="M170 84 Q200 106 230 84" fill="none" stroke="#E2D9C5" strokeWidth="5" />
          <text x="200" y="214" textAnchor="middle" fontFamily="var(--font-lora), Georgia, serif" fontStyle="italic" fontSize="64" fill={C.azul}>Fiat</text>
        </>
      );
  }
}

const FONDO: Record<Arte, string> = {
  misterio: C.lino,
  'misterio-animales': C.lino,
  reyes: C.lino,
  'belen-completo': C.lino,
  escapulario: C.alberoSuave,
  'escapulario-comunion': C.azulSuave,
  capillita: C.alberoSuave,
  'kit-mayo': C.azulSuave,
  polar: C.lino,
  sudadera: C.azulSuave,
  camiseta: C.alberoSuave,
};

export default function ProductoArte({ arte, titulo, className }: { arte: Arte; titulo: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      {...(titulo ? { role: 'img', 'aria-label': titulo } : { 'aria-hidden': true })}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="400" height="400" fill={FONDO[arte]} />
      <Escena arte={arte} />
    </svg>
  );
}
