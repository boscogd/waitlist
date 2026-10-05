---
workflow: general-video
flow: automation
storyboard: no
message: "Instalar Refugio son cuatro toques en el navegador"
destination: web
aspect: 1080x2340
language: es
audience: "Visitantes de refugioenlapalabra.com en el móvil, poco técnicos"
length: 19s (Android) y 24s (iPhone)
---

## Intent

Dos tutoriales mudos para /descargar y la sección «Cómo funciona» de la home: uno para
Android (Chrome) y otro para iPhone (Safari). Cada paso se para con un rótulo numerado y
un foco dorado sobre el botón que hay que tocar.

Son una RECONSTRUCCIÓN, no una grabación: la página es una captura de la app actual y
encima van piezas reales del navegador recortadas de la grabación de enero de 2026.

## Assets

- */assets/app.png — captura de la pantalla de acceso actual de la app (5-10-2026), hecha
  con Chrome sin cabeza a tamaño de móvil: Android 360×661 a 3× (1080×1982); iPhone
  402×713 a 3×, reducida a 1080 de ancho y recortada a 1906 de alto. Los avisos de cookies
  y de «Instala Refugio en tu iPhone» se quitaron del DOM solo para la captura.
- */assets/mN-first.jpg, mN-last.jpg — fotogramas de la grabación de enero (1080×2340) de
  los que se recortan la barra de Chrome, el menú, el diálogo «Instalar aplicación», el
  aviso «Instalando…», la barra de Safari, su menú, el panel de compartir y «Añadir a
  pantalla de inicio». Las coordenadas de cada recorte están en `build.mjs`.
- */assets/icon.png — icono actual de la app (icons/rebranding/Rp.png sobre fondo crema);
  tapa el icono antiguo dentro de los diálogos y sale en las cartelas.

## Notes

- Bosco rechazó el 5-10-2026 la primera versión, hecha sobre la grabación de enero, porque
  enseñaba la app de antes del cambio de logo. No volver a usar ese metraje para la página.
- Queda un resto de la versión antigua: en el panel de compartir de Safari el título dice
  «Tu compañero espiritual diario» (hoy la página se titula «Refugio en la Palabra»).
- Si cambia la pantalla de acceso de la app, basta repetir la captura y volver a renderizar.
- Los originales de la grabación están en el historial de git de refugio-web:
  `git show 5009493^:public/android.mp4` (1080×2340) y `git show 5009493^:public/ios.mp4` (886×1920).
- En iPhone una franja oscura hace de barra de estado (la grabación enseñaba la pastilla «WhatsApp»).
- `node build.mjs` regenera `android/index.html` e `ios/index.html`.
- Versión web: `ffmpeg -i renders/X-master.mp4 -an -vf scale=720:1560:flags=lanczos -c:v libx264 -preset veryslow -crf 28 -g 240 -movflags +faststart` → `public/X.mp4`; póster = fotograma del segundo 1,3.
