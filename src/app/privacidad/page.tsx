import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo DOSIS Picante maneja y protege tus datos personales cuando haces un pedido.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default function Privacidad() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-[#e5e0d8] px-6 py-24 max-w-3xl mx-auto">
      <h1
        className="font-bebas text-5xl tracking-widest text-red-600 mb-2"
        style={{ fontFamily: "var(--font-bebas)" }}
      >
        POLÍTICA DE PRIVACIDAD
      </h1>
      <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-12">
        Última actualización: mayo 2026
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-stone-400">

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            1. Responsable del tratamiento
          </h2>
          <p>
            DOSIS Picante, con sede en Caracas, Venezuela. Contacto:{" "}
            <a href="mailto:dosispicante@gmail.com" className="text-red-500 hover:text-red-400">
              dosispicante@gmail.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            2. Datos que recopilamos
          </h2>
          <p>
            Cuando realizas un pedido, recopilamos: nombre completo, número de teléfono, dirección
            de entrega, ciudad, y — opcionalmente — dirección de correo electrónico. No almacenamos
            datos de tarjetas de crédito ni información bancaria.
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            3. Finalidad y base legal
          </h2>
          <p>
            Usamos tus datos únicamente para procesar y entregar tu pedido, enviarte la confirmación
            por correo (si lo proporcionaste) y coordinar la entrega por WhatsApp. La base legal es
            la ejecución del contrato de compraventa.
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            4. Almacenamiento y seguridad
          </h2>
          <p>
            Los pedidos se registran en Airtable (infraestructura en EE. UU.) y los correos de
            confirmación se envían a través de Resend. Ambos servicios cumplen estándares de
            seguridad industry-standard. No compartimos tus datos con terceros salvo los estrictamente
            necesarios para completar tu pedido (transportistas locales).
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            5. Conservación
          </h2>
          <p>
            Conservamos los datos de pedido durante 2 años por razones contables y para atender
            posibles reclamaciones, tras lo cual se eliminan.
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            6. Tus derechos
          </h2>
          <p>
            Puedes solicitar acceso, rectificación o eliminación de tus datos escribiéndonos a{" "}
            <a href="mailto:dosispicante@gmail.com" className="text-red-500 hover:text-red-400">
              dosispicante@gmail.com
            </a>
            . Responderemos en un plazo máximo de 30 días.
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            7. Cookies y analítica
          </h2>
          <p>
            Usamos Google Analytics 4 para medir el tráfico del sitio de forma anónima. GA4 puede
            almacenar cookies de medición en tu navegador. Puedes desactivarlas desde la configuración
            de tu browser o usando la extensión oficial de Google Analytics Opt-out.
          </p>
        </div>

        <div>
          <h2 className="text-white text-base font-semibold mb-3 tracking-wide">
            8. Cambios a esta política
          </h2>
          <p>
            Podemos actualizar esta política en cualquier momento. La fecha de última actualización
            siempre aparecerá al inicio de esta página.
          </p>
        </div>

      </div>
    </section>
  );
}
