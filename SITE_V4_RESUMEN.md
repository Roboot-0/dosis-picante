# DOSIS — site-v4 · Resumen de cambios

Evolución de v3 (página única con scroll) a v4 (múltiples páginas con rutas separadas).
Misma estética, mismos componentes, misma funcionalidad de checkout — pero ahora cada sección vive en su propia URL.

## 1. Arquitectura multi-página

**Antes (v3):** Todo en una sola página con scroll largo.
**Ahora (v4):** Cada sección es una página independiente con su propia URL.

| Ruta | Contenido | SEO |
|------|-----------|-----|
| `/` | Hero + Usos (fotos de comida) + CTA Final | Título principal de la marca |
| `/salsas` | Catálogo completo + Usos + Sección Pedidos + CTA | "Salsas Picantes Artesanales" |
| `/historia` | Origen + Proceso de fermentación + CTA | "Nuestra Historia" |
| `/ciencia` | Capsaicina + Escala Scoville + CTA | "La Ciencia del Picante" |
| `/faq` | Preguntas frecuentes + CTA | "Preguntas Frecuentes" |

## 2. Layout compartido

El `layout.tsx` ahora incluye Nav, Footer y el modal de checkout (Tienda) de forma global.
Esto significa que:

- La navegación está en todas las páginas automáticamente
- El botón "Pedir" del Nav abre el checkout desde cualquier página
- El Footer con links de redes está en todas las páginas
- No hace falta repetir estos componentes en cada ruta

## 3. Navegación actualizada

**Nav.tsx:**
- Usa `Link` de Next.js en vez de anchors (`#historia` → `/historia`)
- Resalta la página activa en rojo (usa `usePathname()`)
- El menú móvil se cierra automáticamente al cambiar de página

**Footer.tsx:**
- Los links del footer también usan `Link` para navegación interna
- Logo "DOSIS" lleva a la home

**Hero.tsx:**
- El botón "Descubrir" ahora lleva a `/salsas` en vez de `#historia`

## 4. Tienda (checkout) separada

El componente Tienda se dividió en dos partes:
- `Tienda` (default export): Solo el modal de checkout — se monta en el layout global
- `TiendaSeccion` (named export): La sección visual con precios y CTAs — se usa en `/salsas`

El modal sigue escuchando el evento `open-tienda` desde cualquier página.

## 5. SEO mejorado

- Cada página tiene su propio `title` y `description` optimizados
- `alternates.canonical` configurado por página
- El layout usa `title.template` para que cada página muestre: "Título | Dosis Picante"
- `sitemap.ts` actualizado con las 5 rutas y sus prioridades
- Schema.org FAQPage ahora apunta a `/faq#faq`

## 6. Lo que NO cambió

- Estilos (globals.css, Tailwind config) — idénticos a v3
- Checkout completo (Tienda modal con 4-5 pasos) — idéntico
- API de pedidos (`/api/pedido`) — idéntica
- API tasa BCV (`/api/tasa-bcv`) — idéntica
- Airtable integration (`lib/airtable.ts`) — idéntica
- Todas las imágenes (`public/images/`) — copiadas de v3
- `.env.local` — copiado de v3
- Google Analytics 4 — mismo ID
- Datos de Pago Móvil — mismos

## 7. Cómo probar

Abre PowerShell en la carpeta del proyecto:

```
cd C:\Users\...\Desktop\claude-webkit-main\site-v4
```

Doble click en `ARRANCAR.bat` o ejecuta manualmente:

```
npm install
npm run dev
```

Abre http://localhost:3000 y revisa:

1. **Home** (`/`) — Hero con "DOSIS" grande + fotos de comida + CTA final
2. **Salsas** (`/salsas`) — Catálogo completo, Kit DOSIS, sección pedidos
3. **Historia** (`/historia`) — Origen en Caracas + proceso de fermentación
4. **Ciencia** (`/ciencia`) — Capsaicina + escala Scoville + barras de intensidad
5. **FAQ** (`/faq`) — 10 preguntas con acordeón
6. **Nav** — Links activos en rojo, "Pedir" abre modal desde cualquier página
7. **Modal checkout** — Funciona igual que v3 (carrito → datos → pago → comprobante → confirmación)
8. **Móvil** — Nav hamburguesa, todas las páginas responsive

## 8. Estructura de archivos

```
site-v4/
├── ARRANCAR.bat
├── package.json
├── .env.local
├── public/images/          ← mismas imágenes de v3
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← Nav + Footer + Tienda modal (global)
│   │   ├── page.tsx        ← Home: Hero + Usos + CTA
│   │   ├── salsas/page.tsx ← Productos + Usos + TiendaSeccion + CTA
│   │   ├── historia/page.tsx
│   │   ├── ciencia/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── api/pedido/     ← API de checkout (sin cambios)
│   │   ├── api/tasa-bcv/   ← API tasa BCV (sin cambios)
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── manifest.ts
│   ├── components/         ← todos los componentes visuales
│   ├── data/faqs.ts
│   └── lib/airtable.ts
```
