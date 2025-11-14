/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | Refugio en la Palabra',
  description: 'Política de privacidad y protección de datos de Refugio en la Palabra',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10">
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
          Política de Privacidad
        </h1>

        <div className="prose prose-lg max-w-none space-y-8 text-texto">
          <p className="text-lg">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-amber-800 mb-1">
                  ACCIÓN REQUERIDA - Cumplimiento RGPD
                </h4>
                <p className="text-sm text-amber-700">
                  Esta política contiene campos marcados como [PENDIENTE] que deben completarse obligatoriamente
                  según el artículo 13 del RGPD y la LOPDGDD. Las sanciones por incumplimiento pueden alcanzar
                  hasta 20 millones de euros o el 4% de la facturación global anual.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: RESPONSABLE DEL TRATAMIENTO */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              1. Responsable del Tratamiento (Art. 13.1.a RGPD)
            </h2>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10">
              <ul className="space-y-3">
                <li><strong>Identidad:</strong> Refugio en la Palabra</li>
                <li><strong>NIF/CIF:</strong> [PENDIENTE: Insertar NIF/CIF]</li>
                <li><strong>Dirección postal:</strong> [PENDIENTE: Insertar dirección completa]</li>
                <li><strong>Correo electrónico:</strong> [PENDIENTE: Insertar email de contacto]</li>
                <li><strong>Teléfono:</strong> [PENDIENTE: Insertar teléfono]</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Delegado de Protección de Datos (DPO):</strong> Si tu entidad está obligada a designar
                un DPO según el artículo 37 del RGPD o artículo 34 de la LOPDGDD, debes incluir aquí sus datos
                de contacto (nombre y email). Si no es obligatorio y no has designado uno, puedes indicar: "No aplicable".
              </p>
              <div className="mt-3 bg-white rounded p-3">
                <p className="text-sm"><strong>DPO:</strong> [PENDIENTE: Indicar nombre y email del DPO o "No aplicable"]</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: FINALIDAD Y LEGITIMACIÓN */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              2. Finalidad y Base Legal del Tratamiento (Art. 13.1.c RGPD)
            </h2>

            <div className="space-y-4">
              <h3 className="font-semibold text-azul text-lg">¿Qué datos personales recopilamos?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Nombre:</strong> Para personalizar la comunicación contigo</li>
                <li><strong>Correo electrónico:</strong> Para enviarte tu código de acceso anticipado y comunicaciones relacionadas</li>
              </ul>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-azul text-lg">Finalidad del tratamiento</h3>
              <p>Tratamos tus datos personales para las siguientes finalidades:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar tu inscripción en la lista de espera de acceso anticipado</li>
                <li>Enviarte tu código único de acceso anticipado a la aplicación</li>
                <li>Notificarte cuando la aplicación esté disponible</li>
                <li>Comunicarte actualizaciones importantes relacionadas con el proyecto</li>
                <li>Gestionar consultas que nos envíes a través de los canales de contacto</li>
              </ul>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10 mt-6">
              <h3 className="font-semibold text-azul text-lg mb-3">Base legal (Legitimación)</h3>
              <p className="mb-3">El tratamiento de tus datos se basa en:</p>
              <ul className="space-y-3">
                <li>
                  <strong>Consentimiento del interesado</strong> (Art. 6.1.a RGPD): Al registrarte en nuestra
                  lista de espera, consientes expresamente el tratamiento de tus datos para las finalidades indicadas.
                  Puedes retirar tu consentimiento en cualquier momento.
                </li>
                <li>
                  <strong>Ejecución de un contrato o medidas precontractuales</strong> (Art. 6.1.b RGPD):
                  Para proporcionarte el servicio solicitado (acceso anticipado a la aplicación).
                </li>
              </ul>
            </div>
          </section>

          {/* SECCIÓN 3: CONSERVACIÓN DE DATOS */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              3. Plazo de Conservación (Art. 13.2.a RGPD)
            </h2>
            <p>Tus datos personales serán conservados durante los siguientes períodos:</p>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10">
              <ul className="space-y-3">
                <li>
                  <strong>Datos de lista de espera:</strong> Hasta que se lance la aplicación y obtengas acceso,
                  o hasta que solicites la supresión de tus datos, lo que ocurra primero.
                </li>
                <li>
                  <strong>Datos de usuario registrado:</strong> Mientras mantengas tu cuenta activa en la aplicación.
                </li>
                <li>
                  <strong>Tras la cancelación:</strong> Los datos se eliminarán en un plazo máximo de 30 días,
                  salvo que exista una obligación legal de conservación.
                </li>
                <li>
                  <strong>Datos legales requeridos:</strong> Aquellos datos que debamos conservar por obligación
                  legal (fiscales, contables) se mantendrán durante los plazos establecidos por la legislación aplicable.
                </li>
              </ul>
            </div>
          </section>

          {/* SECCIÓN 4: DESTINATARIOS */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              4. Destinatarios y Transferencias Internacionales (Art. 13.1.e y f RGPD)
            </h2>

            <div className="space-y-4">
              <h3 className="font-semibold text-azul text-lg">¿Con quién compartimos tus datos?</h3>
              <p>
                No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales
                o de marketing. Tus datos pueden ser comunicados a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Proveedores de servicios tecnológicos:</strong> Empresas que nos proporcionan servicios
                  de alojamiento, almacenamiento de datos y envío de emails, que actúan como encargados del tratamiento
                  bajo nuestras instrucciones.
                </li>
                <li>
                  <strong>Autoridades públicas:</strong> Cuando exista una obligación legal de comunicar la información.
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Transferencias Internacionales</h3>
              <p className="text-sm text-blue-800 mb-3">
                Tus datos se almacenan en servidores de <strong>Supabase</strong>, que puede utilizar servidores
                ubicados fuera del Espacio Económico Europeo (EEE).
              </p>
              <p className="text-sm text-blue-800">
                Estas transferencias se realizan con las garantías adecuadas previstas en el RGPD:
              </p>
              <ul className="list-disc pl-6 text-sm text-blue-800 mt-2 space-y-1">
                <li>Cláusulas contractuales tipo aprobadas por la Comisión Europea</li>
                <li>Decisiones de adecuación para países que garantizan un nivel adecuado de protección</li>
                <li>Certificaciones como Privacy Shield (cuando aplique) o medidas de seguridad equivalentes</li>
              </ul>
              <p className="text-sm text-blue-800 mt-3">
                Puedes solicitar más información sobre las garantías aplicadas enviándonos un email.
              </p>
            </div>
          </section>

          {/* SECCIÓN 5: DERECHOS */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              5. Tus Derechos (Art. 13.2.b RGPD)
            </h2>
            <p>
              Puedes ejercer en cualquier momento los siguientes derechos reconocidos en el RGPD y la LOPDGDD:
            </p>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10">
              <ul className="space-y-3">
                <li><strong>Derecho de acceso:</strong> Obtener confirmación sobre si estamos tratando tus datos y acceder a ellos</li>
                <li><strong>Derecho de rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Derecho de supresión ("derecho al olvido"):</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios</li>
                <li><strong>Derecho a la limitación del tratamiento:</strong> Solicitar que suspendamos el tratamiento de tus datos</li>
                <li><strong>Derecho a la portabilidad:</strong> Recibir tus datos en formato estructurado y de uso común</li>
                <li><strong>Derecho de oposición:</strong> Oponerte al tratamiento de tus datos personales</li>
                <li><strong>Derecho a retirar el consentimiento:</strong> Puedes retirar tu consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo</li>
                <li><strong>Derecho a no ser objeto de decisiones automatizadas:</strong> Incluida la elaboración de perfiles</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-albero/10 to-dorado/10 border border-albero/30 rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-azul mb-2">¿Cómo ejercer tus derechos?</h3>
              <p className="text-sm leading-relaxed mb-3">
                Para ejercer cualquiera de estos derechos, puedes contactarnos a través de:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Correo electrónico: [PENDIENTE: Insertar email de contacto]</li>
                <li>• Dirección postal: [PENDIENTE: Insertar dirección postal]</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Deberás acreditar tu identidad mediante DNI o documento equivalente. Responderemos a tu solicitud
                en el plazo máximo de 1 mes desde la recepción, pudiendo prorrogarse 2 meses más en caso de
                solicitudes complejas.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-red-900 mb-2">Derecho a Reclamar ante la Autoridad de Control</h3>
              <p className="text-sm text-red-800 mb-3">
                Si consideras que no hemos atendido correctamente tus derechos, puedes presentar una reclamación
                ante la Agencia Española de Protección de Datos (AEPD):
              </p>
              <div className="bg-white rounded p-3 text-sm">
                <p><strong>Agencia Española de Protección de Datos (AEPD)</strong></p>
                <p>Dirección: C/ Jorge Juan, 6, 28001 Madrid</p>
                <p>Teléfono: 901 100 099 / 912 663 517</p>
                <p>Web: <a href="https://www.aepd.es" className="text-azul underline hover:text-albero" target="_blank" rel="noopener noreferrer">www.aepd.es</a></p>
                <p>Sede electrónica: <a href="https://sedeagpd.gob.es" className="text-azul underline hover:text-albero" target="_blank" rel="noopener noreferrer">sedeagpd.gob.es</a></p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6: MEDIDAS DE SEGURIDAD */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              6. Medidas de Seguridad
            </h2>
            <p>
              Hemos implementado medidas técnicas y organizativas apropiadas para proteger tus datos personales
              contra acceso no autorizado, pérdida, destrucción o alteración, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado de datos en tránsito (HTTPS/SSL)</li>
              <li>Cifrado de datos en reposo en las bases de datos</li>
              <li>Controles de acceso restringido a los datos personales</li>
              <li>Auditorías de seguridad periódicas</li>
              <li>Políticas de seguridad y protección de datos para empleados y colaboradores</li>
              <li>Copias de seguridad regulares</li>
            </ul>
          </section>

          {/* SECCIÓN 7: OBLIGACIÓN DE FACILITAR DATOS */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              7. Carácter Obligatorio de Facilitar Datos (Art. 13.2.e RGPD)
            </h2>
            <p>
              La comunicación de tus datos personales es:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Voluntaria</strong> en el sentido de que no existe obligación legal o contractual de proporcionarlos
              </li>
              <li>
                <strong>Necesaria</strong> para poder gestionar tu inscripción en la lista de espera y enviarte el código
                de acceso anticipado
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Consecuencias de no facilitar los datos:</strong> Si no proporcionas los datos solicitados
                (nombre y email), no podremos inscribirte en la lista de espera ni enviarte el código de acceso anticipado.
              </p>
            </div>
          </section>

          {/* SECCIÓN 8: COOKIES */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p>
              Este sitio web utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento
              del formulario de registro y la gestión de sesiones. No utilizamos cookies de análisis, publicidad
              o seguimiento de terceros.
            </p>
            <p>
              Para más información, consulta nuestra{' '}
              <Link href="/legal#cookies" className="text-azul underline hover:text-albero">
                Política de Cookies
              </Link>.
            </p>
          </section>

          {/* SECCIÓN 9: MODIFICACIONES */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              9. Modificaciones de la Política de Privacidad
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras
              prácticas, tecnología, requisitos legales u otros factores.
            </p>
            <p>
              Te notificaremos cualquier cambio significativo por correo electrónico o mediante un aviso destacado
              en nuestra página web. Te recomendamos revisar esta política periódicamente.
            </p>
            <p>
              La versión actualizada será efectiva desde su publicación, salvo que se indique lo contrario.
            </p>
          </section>

          {/* SECCIÓN 10: CONTACTO */}
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              10. Contacto y Consultas
            </h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad, sobre cómo tratamos tus datos personales,
              o deseas ejercer tus derechos, puedes contactarnos en:
            </p>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-azul/10">
              <ul className="space-y-2">
                <li><strong>Correo electrónico:</strong> [PENDIENTE: Insertar email de contacto]</li>
                <li><strong>Dirección postal:</strong> [PENDIENTE: Insertar dirección postal]</li>
                <li><strong>Teléfono:</strong> [PENDIENTE: Insertar teléfono]</li>
              </ul>
            </div>
          </section>

          <div className="mt-16 p-6 bg-albero/10 border border-albero/30 rounded-lg">
            <p className="text-sm text-azul">
              <strong>Refugio en la Palabra</strong> se compromete a proteger tu privacidad y
              cumplir con todas las regulaciones aplicables de protección de datos, incluyendo
              el RGPD (UE) y otras leyes locales de privacidad.
            </p>
          </div>
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
