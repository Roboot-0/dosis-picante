/**
 * Preguntas frecuentes de DOSIS.
 *
 * Fuente única de verdad. La importa:
 *  - `components/FAQ.tsx` para renderizar el acordeón
 *  - `app/layout.tsx` para generar el schema.org FAQPage (SEO / rich results)
 */

export type FAQItem = {
  q: string;
  a: string;
};

export const faqs: FAQItem[] = [
  {
    q: "¿Cuánto dura una botella?",
    a: "Depende de qué tan picante te gusten las cosas. Una botella de 30 ml tiene aproximadamente 600 gotas. Para un consumo normal, dura entre 2 y 4 semanas.",
  },
  {
    q: "¿Necesita refrigeración?",
    a: "No es obligatoria. Puedes mantenerla a temperatura ambiente, en un lugar fresco y seco. Refrigerada conserva mejor el aroma y los matices del sabor.",
  },
  {
    q: "¿Hacen envíos a toda Venezuela?",
    a: "Sí. En Caracas coordinamos la entrega directamente contigo según tu zona. Al resto del país enviamos por Zoom, Domesa o MRW, con el costo del envío por cuenta del cliente. En ambos casos te contactamos por WhatsApp para confirmar los detalles.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Pago Móvil para cualquier parte del país, y efectivo en dólares contra entrega solo para pedidos en Caracas. Sin complicaciones.",
  },
  {
    q: "¿SOBREDOSIS es realmente tan picante como dicen?",
    a: "Sí — ~1.200.000 SHU combinando Carolina Reaper y Trinidad Scorpion, dos de los chiles más picantes del planeta. No es para aprender: es para quien ya disfruta el picante y quiere ir un paso más lejos. Úsala en gotas, no en chorros. Atrévete a probarla y nos cuentas.",
  },
  {
    q: "¿Tienen conservantes o colorantes?",
    a: "Ninguno. DOSIS es 100% natural. La fermentación probiótica preserva el producto de forma natural y solo se agrega vinagre para ajustar el pH. Nada más.",
  },
  {
    q: "¿Cuál me recomiendan para empezar?",
    a: "Las tres. Cada una tiene su momento: MICRODOSIS va perfecta con ceviches, arepas rellenas y pollo a la plancha — sabor sin golpe. AHUMADOSIS se luce en parrillas, empanadas y pasta — aporta cuerpo y humo. SOBREDOSIS es para usar en gotas: una en una sopa, un sancocho o un chile con carne y transforma el plato. Por eso existe el Kit DOSIS: te llevas las tres y descubres cuál te hace sentido en cada ocasión.",
  },
  {
    q: "¿Pica mucho?",
    a: "Depende de ti. MICRODOSIS (~40.000 SHU) es unas 8 veces más picante que el Tabasco clásico: llega con sabor, no con golpe. AHUMADOSIS (~100.000 SHU) es para quien ya disfruta el calor. SOBREDOSIS (~1.200.000 SHU), solo si sabes muy bien lo que haces.",
  },
  {
    q: "¿Cómo funciona el pago por Pago Móvil?",
    a: "Al finalizar tu pedido te mostramos los datos de Pago Móvil (teléfono, cédula y nombre) y el monto exacto en bolívares a la tasa BCV del día. Haces el pago desde tu banco, subes la captura del comprobante en el mismo checkout y te confirmamos el envío en menos de 24 horas.",
  },
  {
    q: "¿Es apta para veganos y personas celíacas?",
    a: "Sí. DOSIS es 100% vegetal y no contiene gluten: solo chiles, ají dulce, vinagre y sal. Apta para veganos, vegetarianos y celíacos. Sin lácteos, sin conservantes, sin colorantes.",
  },
];
