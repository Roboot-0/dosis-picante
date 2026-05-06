/**
 * analytics.ts — wrapper ligero sobre GA4 (gtag).
 * Todas las funciones son no-ops seguros si gtag no está disponible.
 * GA4 Measurement ID: G-2XXQ2DYT9M (ya cargado en layout.tsx).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

/** Evento genérico */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  gtag("event", eventName, params ?? {});
}

// ─── Eventos del checkout ────────────────────────────────────────────────────

/** Paso 1: usuario abre el modal de checkout */
export function trackCheckoutStarted(cartTotal: number) {
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: cartTotal,
  });
  gtag("event", "checkout_started", { value: cartTotal });
}

/** Paso 2: usuario completó sus datos de entrega */
export function trackFormCompleted(deliveryType: string) {
  gtag("event", "checkout_form_completed", { delivery_type: deliveryType });
}

/** Paso 3: usuario seleccionó método de pago */
export function trackPaymentSelected(method: string) {
  gtag("event", "add_payment_info", { payment_type: method });
  gtag("event", "checkout_payment_selected", { payment_method: method });
}

/** Paso 4: usuario subió el comprobante */
export function trackComprobanteUploaded(method: string) {
  gtag("event", "checkout_comprobante_uploaded", { payment_method: method });
}

/** Compra completada */
export function trackPurchase(params: {
  idPedido: string;
  total: number;
  items: Array<{ id: string; nombre: string; qty: number; precio: number }>;
}) {
  gtag("event", "purchase", {
    transaction_id: params.idPedido,
    currency: "USD",
    value: params.total,
    items: params.items.map((i) => ({
      item_id: i.id,
      item_name: i.nombre,
      quantity: i.qty,
      price: i.precio,
    })),
  });
}

/** Cupón aplicado */
export function trackCouponApplied(code: string, discount: number) {
  gtag("event", "coupon_applied", { coupon_code: code, discount_value: discount });
}

/** Captura de email (suscripción) */
export function trackEmailCapture(source: string) {
  gtag("event", "generate_lead", { source });
  gtag("event", "email_capture", { source });
}

/** Checkout abandonado (evento fired en window unload cuando hay email pero no compra) */
export function trackCheckoutAbandoned(step: number) {
  gtag("event", "checkout_abandoned", { last_step: step });
}
