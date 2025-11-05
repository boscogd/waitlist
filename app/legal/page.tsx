import Link from 'next/link';

export const metadata = {
  title: 'Información Legal | Refugio en la Palabra',
  description: 'Términos y condiciones, aviso legal y políticas de Refugio en la Palabra',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-azul hover:text-azul-800 transition-colors"
          >
            <span>←</span>
            <span className="font-[family-name:var(--font-lora)] text-xl font-semibold">
              Refugio en la Palabra
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-lora)] text-4xl md:text-5xl font-semibold text-azul mb-8">
          Información Legal
        </h1>

        <p className="text-lg text-texto/80 mb-12">
          <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Índice de navegación */}
        <nav className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-12 border border-azul/10">
          <h2 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-4">
            Índice
          </h2>
          <ul className="space-y-2">
            <li>
              <a href="#terminos" className="text-azul hover:text-albero transition-colors">
                1. Términos y Condiciones de Uso
              </a>
            </li>
            <li>
              <a href="#aviso-legal" className="text-azul hover:text-albero transition-colors">
                2. Aviso Legal
              </a>
            </li>
            <li>
              <a href="#cookies" className="text-azul hover:text-albero transition-colors">
                3. Política de Cookies
              </a>
            </li>
            <li>
              <Link href="/privacidad" className="text-azul hover:text-albero transition-colors">
                4. Política de Privacidad →
              </Link>
            </li>
            <li>
              <a href="#contacto" className="text-azul hover:text-albero transition-colors">
                5. Información de Contacto
              </a>
            </li>
          </ul>
        </nav>

        <div className="space-y-16 text-texto">

          {/* TÉRMINOS Y CONDICIONES */}
          <section id="terminos" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul mb-8">
              1. Términos y Condiciones de Uso
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.1. Aceptación de los Términos
                </h3>
                <p className="leading-relaxed">
                  Al acceder y utilizar <strong>Refugio en la Palabra</strong> (en adelante, la Aplicación),
                  aceptas estar legalmente vinculado por estos términos y condiciones. Si no estás de acuerdo
                  con alguna parte de estos términos, no debes utilizar la Aplicación.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.2. Descripción del Servicio
                </h3>
                <p className="leading-relaxed">
                  Refugio en la Palabra es una aplicación web que proporciona:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Guías para el rezo del Santo Rosario</li>
                  <li>Lecturas y reflexiones del Evangelio diario</li>
                  <li>Sistema de logros y seguimiento espiritual</li>
                  <li>Consultor espiritual basado en inteligencia artificial</li>
                  <li>Contenido educativo sobre la fe católica</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.3. Requisitos de Uso
                </h3>
                <p className="leading-relaxed">
                  Para utilizar la Aplicación debes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ser mayor de 13 años o contar con el consentimiento de tus padres o tutores</li>
                  <li>Proporcionar información verídica y actualizada durante el registro</li>
                  <li>Mantener la confidencialidad de tus credenciales de acceso</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.4. Uso Aceptable
                </h3>
                <p className="leading-relaxed">
                  Te comprometes a utilizar la Aplicación únicamente para fines legales y de acuerdo
                  con estos términos. Está prohibido:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilizar la Aplicación para fines ilegales o no autorizados</li>
                  <li>Interferir con el funcionamiento de la Aplicación o sus servidores</li>
                  <li>Intentar acceder a áreas no autorizadas de la Aplicación</li>
                  <li>Reproducir, duplicar o copiar el contenido sin autorización</li>
                  <li>Utilizar robots, scrapers u otras herramientas automatizadas</li>
                  <li>Publicar contenido ofensivo, difamatorio o que incite al odio</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.5. Propiedad Intelectual
                </h3>
                <p className="leading-relaxed">
                  Todo el contenido de la Aplicación, incluyendo textos, gráficos, logotipos, iconos,
                  imágenes, audio y software, es propiedad de Refugio en la Palabra o de sus licenciantes
                  y está protegido por las leyes de propiedad intelectual españolas e internacionales.
                </p>
                <p className="leading-relaxed">
                  Los textos bíblicos y oraciones tradicionales de la Iglesia Católica son de dominio
                  público, aunque su presentación y compilación en la Aplicación están protegidas.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.6. Contenido del Usuario
                </h3>
                <p className="leading-relaxed">
                  Si la Aplicación permite enviar contenido (comentarios, reflexiones, etc.),
                  conservas la propiedad de dicho contenido, pero nos otorgas una licencia mundial,
                  no exclusiva y libre de regalías para usar, modificar y mostrar dicho contenido
                  en relación con el servicio.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.7. Naturaleza del Contenido Espiritual
                </h3>
                <div className="bg-albero/10 border border-albero/30 rounded-lg p-6">
                  <p className="leading-relaxed">
                    <strong>Importante:</strong> El contenido proporcionado por la Aplicación, incluido
                    el consultor espiritual basado en IA, tiene fines informativos y de acompañamiento
                    espiritual personal. <strong>No sustituye</strong> el consejo, dirección espiritual
                    o los sacramentos proporcionados por un sacerdote o director espiritual debidamente
                    ordenado y autorizado por la Iglesia Católica.
                  </p>
                  <p className="leading-relaxed mt-4">
                    Para situaciones que requieran acompañamiento pastoral, discernimiento vocacional o
                    sacramentos, te recomendamos contactar con tu parroquia local.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.8. Tarifas y Pagos
                </h3>
                <p className="leading-relaxed">
                  Algunos servicios de la Aplicación pueden requerir pago. Los precios se mostrarán
                  claramente antes de cualquier compra. Nos reservamos el derecho de modificar los
                  precios en cualquier momento, aunque los cambios no afectarán a suscripciones ya activas.
                </p>
                <p className="leading-relaxed">
                  Los pagos se procesan de forma segura a través de proveedores de pago de terceros.
                  No almacenamos información de tarjetas de crédito en nuestros servidores.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.9. Política de Reembolso
                </h3>
                <p className="leading-relaxed">
                  Los reembolsos se evaluarán caso por caso. Si no estás satisfecho con el servicio,
                  contáctanos dentro de los primeros 14 días de tu compra para solicitar un reembolso.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.10. Limitación de Responsabilidad
                </h3>
                <p className="leading-relaxed">
                  La Aplicación se proporciona tal cual y según disponibilidad. No garantizamos
                  que el servicio será ininterrumpido, seguro o libre de errores.
                </p>
                <p className="leading-relaxed">
                  En la máxima medida permitida por la ley, no seremos responsables de daños indirectos,
                  incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso
                  de la Aplicación.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.11. Modificaciones del Servicio
                </h3>
                <p className="leading-relaxed">
                  Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto
                  de la Aplicación en cualquier momento, con o sin previo aviso.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.12. Terminación
                </h3>
                <p className="leading-relaxed">
                  Podemos suspender o terminar tu acceso a la Aplicación inmediatamente, sin previo
                  aviso, por cualquier motivo, incluyendo si consideramos que has violado estos términos.
                </p>
                <p className="leading-relaxed">
                  Puedes dejar de usar la Aplicación y eliminar tu cuenta en cualquier momento.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.13. Legislación Aplicable
                </h3>
                <p className="leading-relaxed">
                  Estos términos se rigen por las leyes de España. Cualquier disputa se someterá
                  a la jurisdicción exclusiva de los tribunales de España.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  1.14. Modificaciones de los Términos
                </h3>
                <p className="leading-relaxed">
                  Podemos actualizar estos términos ocasionalmente. Te notificaremos cambios
                  significativos por correo electrónico o mediante un aviso destacado en la Aplicación.
                  El uso continuado después de dichos cambios constituye tu aceptación de los nuevos términos.
                </p>
              </div>
            </div>
          </section>

          {/* AVISO LEGAL */}
          <section id="aviso-legal" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul mb-8">
              2. Aviso Legal
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.1. Información General
                </h3>
                <p className="leading-relaxed">
                  En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios
                  de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa
                  de los datos identificativos del titular de este sitio web:
                </p>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10">
                  <ul className="space-y-2">
                    <li><strong>Denominación:</strong> Refugio en la Palabra</li>
                    <li><strong>Dominio:</strong> www.refugioenlapalabra.com</li>
                    <li><strong>Actividad:</strong> Plataforma digital de acompañamiento espiritual católico</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.2. Objeto
                </h3>
                <p className="leading-relaxed">
                  El presente aviso legal regula el uso y utilización del sitio web www.refugioenlapalabra.com,
                  del que es titular Refugio en la Palabra.
                </p>
                <p className="leading-relaxed">
                  La navegación por el sitio web atribuye la condición de usuario del mismo e implica
                  la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas
                  en este Aviso Legal.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.3. Uso del Sitio Web
                </h3>
                <p className="leading-relaxed">
                  El sitio web www.refugioenlapalabra.com proporciona el acceso a información,
                  servicios y herramientas relacionadas con la vida espiritual católica (en adelante, los contenidos).
                </p>
                <p className="leading-relaxed">
                  El usuario asume la responsabilidad del uso del portal. El usuario se compromete
                  a hacer un uso adecuado de los contenidos y servicios que se ofrecen a través del
                  portal y a no emplearlos para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
                  <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal,
                    de apología del terrorismo o atentatorio contra los derechos humanos</li>
                  <li>Provocar daños en los sistemas físicos y lógicos del sitio web, de sus proveedores
                    o de terceras personas</li>
                  <li>Introducir o difundir en la red virus informáticos o cualesquiera otros sistemas
                    físicos o lógicos que sean susceptibles de provocar los daños anteriormente mencionados</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.4. Protección de Datos
                </h3>
                <p className="leading-relaxed">
                  Para más información sobre el tratamiento de datos personales, consulta nuestra{' '}
                  <Link href="/privacidad" className="text-azul underline hover:text-albero">
                    Política de Privacidad
                  </Link>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.5. Propiedad Intelectual e Industrial
                </h3>
                <p className="leading-relaxed">
                  Todos los contenidos del sitio web, entendiendo por estos a título meramente enunciativo
                  los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás
                  contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son
                  propiedad intelectual de Refugio en la Palabra o de terceros, sin que puedan entenderse
                  cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa
                  vigente en materia de propiedad intelectual sobre los mismos.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.6. Enlaces
                </h3>
                <p className="leading-relaxed">
                  En el caso de que en www.refugioenlapalabra.com se dispusiesen enlaces o hipervínculos
                  hacia otros sitios de Internet, Refugio en la Palabra no ejercerá ningún tipo de control
                  sobre dichos sitios y contenidos. En ningún caso asumirá responsabilidad alguna por los
                  contenidos de algún enlace perteneciente a un sitio web ajeno.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.7. Exclusión de Garantías y Responsabilidad
                </h3>
                <p className="leading-relaxed">
                  Refugio en la Palabra no se hace responsable, en ningún caso, de los daños y perjuicios
                  de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones
                  en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas
                  maliciosos o lesivos en los contenidos.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  2.8. Modificaciones
                </h3>
                <p className="leading-relaxed">
                  Refugio en la Palabra se reserva el derecho de efectuar sin previo aviso las modificaciones
                  que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos
                  y servicios que se presten a través de la misma como la forma en la que estos aparezcan
                  presentados o localizados.
                </p>
              </div>
            </div>
          </section>

          {/* POLÍTICA DE COOKIES */}
          <section id="cookies" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul mb-8">
              3. Política de Cookies
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  3.1. ¿Qué son las cookies?
                </h3>
                <p className="leading-relaxed">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                  visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen
                  de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  3.2. Cookies que utilizamos
                </h3>
                <p className="leading-relaxed">
                  Refugio en la Palabra utiliza un enfoque minimalista respecto a las cookies:
                </p>

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10 space-y-4">
                  <div>
                    <h4 className="font-semibold text-azul mb-2">Cookies Estrictamente Necesarias</h4>
                    <p className="text-sm leading-relaxed">
                      Estas cookies son esenciales para el funcionamiento del sitio web y no pueden
                      ser desactivadas en nuestros sistemas. Generalmente solo se establecen en respuesta
                      a acciones realizadas por ti, como establecer tus preferencias de privacidad,
                      iniciar sesión o completar formularios.
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                      <li>Cookie de sesión de usuario</li>
                      <li>Cookie de autenticación</li>
                      <li>Cookie de preferencias del formulario</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-azul mb-2">Cookies de Funcionalidad (Opcional)</h4>
                    <p className="text-sm leading-relaxed">
                      Estas cookies permiten que el sitio web recuerde las elecciones que haces
                      (como tu idioma o región) y proporcionan características mejoradas y más personales.
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                      <li>Preferencias de visualización</li>
                      <li>Recordatorio de configuración de oración</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-albero/10 border border-albero/30 rounded-lg p-6 mt-4">
                  <p className="font-semibold text-azul mb-2">
                    ❌ NO utilizamos:
                  </p>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Cookies de análisis o seguimiento de terceros</li>
                    <li>Cookies de publicidad</li>
                    <li>Cookies de redes sociales</li>
                    <li>Cookies de marketing</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  3.3. Gestión de cookies
                </h3>
                <p className="leading-relaxed">
                  Puedes configurar tu navegador para que rechace todas las cookies o para que te
                  avise cuando se envía una cookie. Sin embargo, algunas partes del sitio pueden no
                  funcionar correctamente si rechazas las cookies estrictamente necesarias.
                </p>
                <p className="leading-relaxed">
                  Instrucciones para gestionar cookies en los navegadores más comunes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                  </li>
                  <li>
                    <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web
                  </li>
                  <li>
                    <strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  3.4. Duración de las cookies
                </h3>
                <p className="leading-relaxed">
                  Las cookies de sesión se eliminan automáticamente cuando cierras el navegador.
                  Las cookies persistentes permanecen en tu dispositivo hasta que expiran o las eliminas manualmente.
                </p>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-azul/10 text-sm">
                  <ul className="space-y-1">
                    <li><strong>Cookies de sesión:</strong> Se eliminan al cerrar el navegador</li>
                    <li><strong>Cookies de autenticación:</strong> 30 días</li>
                    <li><strong>Cookies de preferencias:</strong> 365 días</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul">
                  3.5. Actualizaciones de esta política
                </h3>
                <p className="leading-relaxed">
                  Podemos actualizar nuestra Política de Cookies periódicamente. Te notificaremos
                  cualquier cambio publicando la nueva política en esta página y actualizando la
                  fecha de última actualización en la parte superior.
                </p>
              </div>
            </div>
          </section>

          {/* CONTACTO */}
          <section id="contacto" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul mb-8">
              5. Información de Contacto
            </h2>

            <div className="space-y-6">
              <p className="leading-relaxed">
                Si tienes preguntas sobre estos términos legales, políticas o sobre el funcionamiento
                de la aplicación, puedes contactarnos:
              </p>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-azul/10 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-azul">Correo electrónico:</h3>
                  <p className="text-texto/80">
                    Responde a cualquier email que hayas recibido de nosotros, o contacta a través
                    del formulario de la lista de espera.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-azul">Sitio web:</h3>
                  <p className="text-texto/80">
                    <a href="https://www.refugioenlapalabra.com" className="text-azul hover:text-albero underline">
                      www.refugioenlapalabra.com
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-azul">Horario de atención:</h3>
                  <p className="text-texto/80">
                    Respondemos a todas las consultas en un plazo máximo de 48 horas laborables.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-albero/10 to-dorado/10 border border-albero/30 rounded-lg p-6">
                <h3 className="font-semibold text-azul mb-2">
                  Derechos del Usuario
                </h3>
                <p className="text-sm leading-relaxed">
                  Recuerda que tienes derecho a acceder, rectificar, suprimir, limitar el tratamiento,
                  portabilidad de datos y oposición. Para ejercer estos derechos, contáctanos usando
                  cualquiera de los métodos anteriores.
                </p>
              </div>
            </div>
          </section>

          {/* Enlaces rápidos a documentos relacionados */}
          <section className="pt-8 border-t border-azul/10">
            <h3 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-azul mb-4">
              Documentos relacionados
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/privacidad"
                className="block bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10 hover:border-albero/30 transition-all"
              >
                <h4 className="font-semibold text-azul mb-2">📄 Política de Privacidad</h4>
                <p className="text-sm text-texto/70">
                  Información detallada sobre cómo recopilamos, usamos y protegemos tus datos personales.
                </p>
              </Link>

              <a
                href="#terminos"
                className="block bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10 hover:border-albero/30 transition-all"
              >
                <h4 className="font-semibold text-azul mb-2">📋 Términos y Condiciones</h4>
                <p className="text-sm text-texto/70">
                  Condiciones de uso de la aplicación y derechos y responsabilidades.
                </p>
              </a>
            </div>
          </section>

        </div>

        {/* Mensaje final */}
        <div className="mt-16 p-8 bg-gradient-to-br from-azul/5 to-albero/5 border border-azul/10 rounded-xl">
          <p className="text-center text-texto/80 leading-relaxed">
            <strong className="text-azul">Refugio en la Palabra</strong> se compromete a proporcionar
            un servicio transparente, seguro y respetuoso con tus derechos. Estamos aquí para acompañarte
            en tu camino espiritual con integridad y responsabilidad.
          </p>
        </div>

        {/* Back to home button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-azul rounded-lg hover:bg-azul-800 transition-all duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-azul/10">
        <p className="text-xs text-texto/50">
          © {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
        </p>
        <div className="mt-2 space-x-4 text-xs">
          <Link href="/legal" className="text-azul/50 hover:text-azul transition-colors">
            Información Legal
          </Link>
          <span className="text-texto/30">•</span>
          <Link href="/privacidad" className="text-azul/50 hover:text-azul transition-colors">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
