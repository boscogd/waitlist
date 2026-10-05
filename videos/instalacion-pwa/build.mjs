// Genera android/index.html e ios/index.html.
// Uso: node build.mjs   (después, dentro de android/ o ios/: npm run check && npm run render)
//
// Cada vídeo es una reconstrucción, no una grabación:
//   - la página es una captura de la app ACTUAL (assets/app.png, ver BRIEF.md);
//   - encima van piezas reales del navegador recortadas de la grabación de enero de 2026
//     (barra de Chrome, menú, diálogo de instalar, panel de compartir de Safari...);
//   - donde esas piezas enseñaban el icono antiguo se tapa con el actual (assets/icon.png).
// Los tiempos (segundos) son relativos al inicio del contenido, que empieza en T0.

import { writeFileSync } from 'node:fs';

const W = 1080;
const H = 2340;
const T0 = 1.5; // la cartela de entrada se funde entre T0 y T0 + 0.4
const INTRO = T0 + 0.4;
const END = 3.6;
const END_FADE = 0.45;

const r2 = (n) => Math.round(n * 1000) / 1000;

// Recorte de un fotograma antiguo colocado en su sitio original.
const crop = (src, x, y, w, h, radius = 0) => ({ src, x, y, w, h, radius });

const VIDEOS = {
  android: {
    platform: 'Android',
    browser: 'Chrome',
    length: 14.2,
    // Fondo fijo: barra de estado + barra de Chrome, página actual y barra de navegación.
    base: [
      { box: { x: 0, y: 0, w: W, h: H, color: '#f1e8da' } },
      { img: 'app.png', x: 0, y: 232, w: W, h: 1982 },
      crop('m3-last.jpg', 0, 0, W, 232),
      crop('m3-last.jpg', 0, 2214, W, 126),
    ],
    layers: [
      {
        id: 'menu',
        ...crop('m2-first.jpg', 388, 100, 676, 2084, 58),
        shadow: true,
        in: { t: 5.2, dur: 0.32, type: 'pop', origin: '100% 0%' },
        out: { t: 8.8, dur: 0.18 },
      },
      { id: 'dim', box: { x: 0, y: 0, w: W, h: 2214, color: 'rgba(0, 0, 0, 0.64)' }, in: { t: 8.9, dur: 0.3, type: 'fade' }, out: { t: 12.3, dur: 0.25 } },
      {
        id: 'dialog',
        ...crop('m2-last.jpg', 27, 941, 1026, 526, 64),
        icon: { x: 62, y: 196, size: 98, radius: 34, pad: '#27282c' },
        in: { t: 8.95, dur: 0.3, type: 'pop', origin: '50% 50%' },
        out: { t: 12.3, dur: 0.22 },
      },
      { id: 'toast', ...crop('m3-last.jpg', 350, 1800, 378, 123, 61), in: { t: 12.6, dur: 0.25, type: 'fade' } },
    ],
    steps: [
      { t: 0, end: 2.4, step: 1, text: 'Abre Refugio en Chrome', pos: 'bottom' },
      { t: 2.4, end: 5.5, step: 2, text: 'Toca los tres puntos', pos: 'bottom', target: { x: 950, y: 95, w: 124, h: 124, r: 62, until: 5.2 } },
      {
        t: 5.6,
        end: 9.2,
        step: 3,
        text: 'Elige «Añadir a pantalla de inicio»',
        pos: 'bottom',
        target: { x: 398, y: 1640, w: 660, h: 130, r: 28, until: 8.8 },
      },
      { t: 9.3, end: 13.4, step: 4, text: 'Pulsa «Instalar»', pos: 'bottom', target: { x: 796, y: 1300, w: 196, h: 120, r: 30, until: 12.3 } },
    ],
  },
  ios: {
    platform: 'iPhone',
    browser: 'Safari',
    length: 19.0,
    statusCover: 162, // franja que hace de barra de estado
    base: [
      { box: { x: 0, y: 0, w: W, h: H, color: '#060201' } },
      { img: 'app.png', x: 0, y: 162, w: W, h: 1906 },
      crop('m1-first.jpg', 0, 2068, W, 272),
    ],
    layers: [
      {
        id: 'menu',
        ...crop('m1-last.jpg', 308, 1222, 687, 1026, 84),
        shadow: true,
        in: { t: 5.4, dur: 0.32, type: 'pop', origin: '90% 100%' },
        out: { t: 8.4, dur: 0.16 },
      },
      {
        id: 'sheet',
        ...crop('m2-last.jpg', 24, 838, 1038, 1476, 104),
        shadow: true,
        icon: { x: 66, y: 65, size: 179, radius: 42 },
        in: { t: 8.45, dur: 0.5, type: 'slide', from: 1520 },
        out: { t: 11.8, dur: 0.2 },
      },
      {
        id: 'full',
        ...crop('m3-last.jpg', 0, 162, W, 2178),
        icon: { x: 75, y: 80, size: 179, radius: 42 },
        in: { t: 11.6, dur: 0.38, type: 'slide', from: 700 },
        out: { t: 15.45, dur: 0.05 },
      },
      {
        id: 'add',
        ...crop('m4-last.jpg', 0, 162, W, 2178),
        over: { src: 'm5-last.jpg', t: 18.5, dur: 0.12 }, // botón «Añadir» pulsado
        icon: { x: 41, y: 318, size: 167, radius: 40 },
        in: { t: 15.0, dur: 0.45, type: 'slide', from: 2200 },
      },
    ],
    steps: [
      { t: 0, end: 2.4, step: 1, text: 'Abre Refugio en Safari', pos: 'low' },
      {
        t: 2.4,
        end: 5.7,
        step: 2,
        text: 'Toca los tres puntos',
        sub: 'Si ves el icono de compartir, tócalo',
        pos: 'low',
        target: { x: 838, y: 2098, w: 164, h: 164, r: 82, until: 5.4 },
      },
      { t: 5.8, end: 8.9, step: 2, text: 'Elige «Compartir»', pos: 'top', target: { x: 370, y: 1240, w: 640, h: 132, r: 30, until: 8.4 } },
      { t: 9.0, end: 11.9, step: 3, text: 'Desliza el panel hacia arriba', pos: 'top', swipe: [9.5, 10.6] },
      {
        t: 12.0,
        end: 15.4,
        step: 3,
        text: 'Toca «Añadir a pantalla de inicio»',
        pos: 'top',
        target: { x: 56, y: 2100, w: 974, h: 132, r: 34, until: 15.0 },
      },
      { t: 15.5, end: 19.0, step: 4, text: 'Toca «Añadir»', pos: 'mid', target: { x: 796, y: 232, w: 248, h: 124, r: 62, until: 18.5 } },
    ],
  },
};

function build(key, cfg) {
  const abs = (t) => r2(T0 + t);
  const footageEnd = T0 + cfg.length;
  const endStart = r2(footageEnd - END_FADE);
  const total = r2(endStart + END);
  const anim = [];
  const html = [];

  const cropStyle = (c) =>
    `left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;background-image:url(assets/${c.src});background-position:-${c.x}px -${c.y}px;border-radius:${c.radius}px`;

  // Fondo: un único clip que dura todo el contenido.
  const baseParts = cfg.base.map((b) => {
    if (b.box) return `<div class="piece" style="left:${b.box.x}px;top:${b.box.y}px;width:${b.box.w}px;height:${b.box.h}px;background:${b.box.color}"></div>`;
    if (b.img) return `<img class="piece" src="assets/${b.img}" alt="" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px" />`;
    return `<div class="piece crop" style="${cropStyle(b)}"></div>`;
  });
  html.push(`<div class="clip layer" data-start="0" data-duration="${r2(footageEnd)}" data-track-index="0">${baseParts.join('')}</div>`);

  // Piezas del navegador que entran y salen.
  cfg.layers.forEach((l, i) => {
    const id = `${key}-${l.id}`;
    const start = abs(l.in.t);
    const end = l.out ? abs(l.out.t + l.out.dur) : r2(footageEnd);
    let inner;
    if (l.box) {
      inner = `<div id="${id}" class="piece" style="left:${l.box.x}px;top:${l.box.y}px;width:${l.box.w}px;height:${l.box.h}px;background:${l.box.color}"></div>`;
    } else {
      const icon = l.icon
        ? `${l.icon.pad ? `<div class="piece" style="left:${l.icon.x - 4}px;top:${l.icon.y - 4}px;width:${l.icon.size + 8}px;height:${l.icon.size + 8}px;background:${l.icon.pad}"></div>` : ''}<div class="piece" style="left:${l.icon.x}px;top:${l.icon.y}px;width:${l.icon.size}px;height:${l.icon.size}px;border-radius:${l.icon.radius}px;background:url(assets/icon.png) center / cover"></div>`
        : '';
      const over = l.over
        ? `<div id="${id}-over" class="piece crop" style="left:0;top:0;width:${l.w}px;height:${l.h}px;background-image:url(assets/${l.over.src});background-position:-${l.x}px -${l.y}px"></div>`
        : '';
      inner = `<div id="${id}" class="piece crop${l.shadow ? ' shadow' : ''}" style="${cropStyle(l)};overflow:hidden${l.in.origin ? `;transform-origin:${l.in.origin}` : ''}">${over}${icon}</div>`;
      if (l.over) anim.push(`tl.fromTo("#${id}-over", { opacity: 0 }, { opacity: 1, duration: ${l.over.dur}, ease: "none" }, ${abs(l.over.t)});`);
    }
    html.push(`<div class="clip layer" data-start="${start}" data-duration="${r2(end - start)}" data-track-index="${1 + (i % 2)}">${inner}</div>`);

    if (l.in.type === 'pop') anim.push(`tl.fromTo("#${id}", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: ${l.in.dur}, ease: "power3.out" }, ${start});`);
    if (l.in.type === 'fade') anim.push(`tl.fromTo("#${id}", { opacity: 0 }, { opacity: 1, duration: ${l.in.dur}, ease: "power1.out" }, ${start});`);
    if (l.in.type === 'slide') anim.push(`tl.fromTo("#${id}", { y: ${l.in.from} }, { y: 0, duration: ${l.in.dur}, ease: "power3.out" }, ${start});`);
    if (l.out) anim.push(`tl.to("#${id}", { opacity: 0, duration: ${l.out.dur}, ease: "power1.in" }, ${abs(l.out.t)});`);
  });

  if (cfg.statusCover) {
    html.push(`<div class="clip statusbar" style="height:${cfg.statusCover}px" data-start="0" data-duration="${r2(footageEnd)}" data-track-index="3"></div>`);
  }

  // Focos y gestos.
  cfg.steps.forEach((s, i) => {
    if (s.target) {
      const g = s.target;
      const id = `${key}-s${i}`;
      const start = abs(s.t);
      const until = abs(g.until);
      html.push(
        `<div class="clip layer" data-start="${start}" data-duration="${r2(until - start + 0.05)}" data-track-index="4"><div id="${id}" class="spot" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border-radius:${g.r}px"></div></div>`,
      );
      const a = r2(start + 0.45);
      // Latidos completos (ida y vuelta) que caben antes de la «pulsación» final.
      const pulses = Math.max(2, Math.floor((until - start - 0.22 - 0.95 - 0.05) / 0.84) * 2);
      anim.push(
        `tl.fromTo("#${id}", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, ${a});`,
        `tl.to("#${id}", { scale: 1.07, duration: 0.42, ease: "sine.inOut", yoyo: true, repeat: ${pulses - 1} }, ${r2(a + 0.5)});`,
        `tl.to("#${id}", { scale: 0.9, duration: 0.12, ease: "power2.in" }, ${r2(until - 0.22)});`,
        `tl.to("#${id}", { opacity: 0, duration: 0.1, ease: "none" }, ${r2(until - 0.08)});`,
      );
    }
    if (s.swipe) {
      s.swipe.forEach((at, n) => {
        const id = `${key}-w${i}-${n}`;
        const start = abs(at);
        html.push(`<div class="clip layer" data-start="${start}" data-duration="0.9" data-track-index="4"><div id="${id}" class="swipe"></div></div>`);
        anim.push(
          `tl.fromTo("#${id}", { opacity: 0, y: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }, ${start});`,
          `tl.to("#${id}", { y: -620, duration: 0.6, ease: "power2.inOut" }, ${r2(start + 0.15)});`,
          `tl.to("#${id}", { opacity: 0, duration: 0.18, ease: "none" }, ${r2(start + 0.62)});`,
        );
      });
    }
  });

  // Rótulos.
  cfg.steps.forEach((s, i) => {
    const id = `${key}-c${i}`;
    const start = abs(s.t);
    const end = abs(s.end);
    html.push(
      `<div class="clip layer" data-start="${start}" data-duration="${r2(end - start)}" data-track-index="5"><div id="${id}" class="cap cap-${s.pos}"><div class="num">${s.step}</div><div class="cap-text"><p class="cap-main">${s.text}</p>${
        s.sub ? `<p class="cap-sub">${s.sub}</p>` : ''
      }</div></div></div>`,
    );
    anim.push(
      `tl.fromTo("#${id}", { opacity: 0, y: ${s.pos === 'bottom' || s.pos === 'low' ? 60 : -60} }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${r2(start + 0.08)});`,
      `tl.fromTo("#${id} .num", { scale: 0.4 }, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, ${r2(start + 0.16)});`,
      `tl.to("#${id}", { opacity: 0, duration: 0.2, ease: "power1.in" }, ${r2(end - 0.22)});`,
    );
  });

  anim.push(
    // Cartela de entrada
    `tl.fromTo("#${key}-intro-icon", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)" }, 0.05);`,
    `tl.fromTo("#${key}-intro-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.22);`,
    `tl.fromTo("#${key}-intro-sub", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, 0.42);`,
    `tl.fromTo("#${key}-intro-glow", { scale: 0.9 }, { scale: 1.18, duration: ${INTRO}, ease: "sine.inOut" }, 0);`,
    `tl.to("#${key}-intro", { opacity: 0, duration: 0.4, ease: "power1.inOut" }, ${T0});`,
    // Cartela de cierre
    `tl.fromTo("#${key}-end", { opacity: 0 }, { opacity: 1, duration: ${END_FADE}, ease: "power1.inOut" }, ${endStart});`,
    `tl.fromTo("#${key}-end-glow", { scale: 0.85 }, { scale: 1.2, duration: ${END}, ease: "sine.inOut" }, ${endStart});`,
    `tl.fromTo("#${key}-end-icon", { scale: 0.3, opacity: 0, y: -80 }, { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.8)" }, ${r2(endStart + 0.35)});`,
    `tl.fromTo("#${key}-end-label", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, ${r2(endStart + 0.85)});`,
    `tl.fromTo("#${key}-end-check", { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, ${r2(endStart + 0.95)});`,
    `tl.fromTo("#${key}-end-title", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, ${r2(endStart + 1.0)});`,
    `tl.fromTo("#${key}-end-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ${r2(endStart + 1.2)});`,
  );

  const doc = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Instalar Refugio en ${cfg.platform}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #16263f; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
      .layer { position: absolute; inset: 0; overflow: hidden; }
      .piece { position: absolute; display: block; }
      .crop { background-repeat: no-repeat; background-size: ${W}px ${H}px; }
      .shadow { box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45); }
      .statusbar { position: absolute; left: 0; top: 0; width: 100%; background: #0b0d12; }

      /* Foco: recuadro dorado sobre el botón y el resto de la pantalla oscurecido */
      .spot { position: absolute; border: 8px solid #e1b955; box-shadow: 0 0 0 3000px rgba(9, 15, 28, 0.6), 0 0 44px 6px rgba(225, 185, 85, 0.75); }
      .swipe { position: absolute; left: 470px; top: 1820px; width: 140px; height: 140px; border-radius: 70px; background: rgba(225, 185, 85, 0.55); border: 8px solid #e1b955; box-shadow: 0 0 40px rgba(225, 185, 85, 0.6); }

      /* Rótulo de paso */
      .cap { position: absolute; left: 44px; width: 992px; display: flex; align-items: center; gap: 34px; padding: 36px 40px; background: #faf7f0; border-radius: 48px; border: 4px solid #e1b955; box-shadow: 0 24px 70px rgba(6, 12, 24, 0.55); }
      .cap-top { top: 196px; }
      .cap-mid { top: 1096px; }
      .cap-low { top: 1810px; }
      .cap-bottom { bottom: 168px; }
      .num { flex: none; width: 116px; height: 116px; border-radius: 58px; display: flex; align-items: center; justify-content: center; background: #e1b955; color: #16263f; font-weight: 900; font-size: 68px; }
      .cap-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
      .cap-main { color: #16263f; font-weight: 700; font-size: 58px; line-height: 1.12; letter-spacing: -0.02em; }
      .cap-sub { color: #3d4c63; font-weight: 400; font-size: 38px; line-height: 1.2; }

      /* Cartelas */
      .card { position: absolute; inset: 0; background: #16263f; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .glow { position: absolute; left: 90px; top: 520px; width: 900px; height: 900px; border-radius: 450px; background: radial-gradient(circle, rgba(225, 185, 85, 0.3) 0%, rgba(225, 185, 85, 0.1) 42%, rgba(225, 185, 85, 0) 70%); }
      .rule { position: absolute; left: 120px; width: 840px; height: 4px; background: rgba(225, 185, 85, 0.35); }
      .rule-top { top: 300px; }
      .rule-bottom { bottom: 300px; }
      .icon { position: relative; display: block; width: 300px; height: 300px; border-radius: 68px; box-shadow: 0 30px 80px rgba(4, 8, 18, 0.6); }
      .icon-wrap { position: relative; width: 300px; height: 300px; }
      .check { position: absolute; right: -34px; top: -34px; width: 104px; height: 104px; border-radius: 52px; background: #e1b955; border: 8px solid #16263f; display: flex; align-items: center; justify-content: center; }
      .check svg { display: block; width: 56px; height: 56px; }
      .icon-label { margin-top: 26px; color: #faf7f0; font-weight: 400; font-size: 44px; }
      .title { margin-top: 84px; width: 920px; text-align: center; color: #faf7f0; font-weight: 900; font-size: 112px; line-height: 1.04; letter-spacing: -0.035em; }
      .sub { margin-top: 36px; width: 880px; text-align: center; color: #e1b955; font-weight: 700; font-size: 54px; line-height: 1.2; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${key}" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
      ${html.join('\n      ')}
      <div class="clip layer" data-start="0" data-duration="${INTRO}" data-track-index="6">
        <div id="${key}-intro" class="card">
          <div id="${key}-intro-glow" class="glow"></div>
          <div class="rule rule-top"></div>
          <div class="rule rule-bottom"></div>
          <img id="${key}-intro-icon" class="icon" src="assets/icon-intro.png" alt="" />
          <h1 id="${key}-intro-title" class="title">Instala Refugio en tu ${cfg.platform}</h1>
          <p id="${key}-intro-sub" class="sub">4 pasos desde ${cfg.browser}</p>
        </div>
      </div>
      <div class="clip layer" data-start="${endStart}" data-duration="${r2(total - endStart)}" data-track-index="6">
        <div id="${key}-end" class="card">
          <div id="${key}-end-glow" class="glow"></div>
          <div class="rule rule-top"></div>
          <div class="rule rule-bottom"></div>
          <div id="${key}-end-icon" class="icon-wrap">
            <img class="icon" src="assets/icon-end.png" alt="" />
            <div id="${key}-end-check" class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#16263f" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg></div>
          </div>
          <p id="${key}-end-label" class="icon-label">Refugio</p>
          <h1 id="${key}-end-title" class="title">¡Listo!</h1>
          <p id="${key}-end-sub" class="sub">Ya tienes Refugio en tu pantalla de inicio</p>
        </div>
      </div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${anim.join('\n      ')}
      window.__timelines["${key}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
  writeFileSync(new URL(`./${key}/index.html`, import.meta.url), doc);
  console.log(`${key}: ${total}s`);
}

for (const [key, cfg] of Object.entries(VIDEOS)) build(key, cfg);
