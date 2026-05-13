/**
 * Smoke test — verifica que los endpoints del sitio responden.
 *
 * Requiere que el sitio esté corriendo en localhost:3000.
 * Uso: `node scripts/smoke-test.js`
 */

const BASE = "http://localhost:3000";

const tests = [
  {
    name: "Página principal (HTML)",
    url: `${BASE}/`,
    expect: { status: 200, bodyIncludes: "DOSIS" },
  },
  {
    name: "API tasa BCV",
    url: `${BASE}/api/tasa-bcv`,
    expect: { status: 200, json: true, field: "tasa" },
  },
  {
    name: "API pedido (sin body = error controlado)",
    url: `${BASE}/api/pedido`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    expect: { status: 400 },
  },
];

async function run() {
  console.log("🔥 Smoke test DOSIS — site-v3\n");
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const opts = { method: t.method || "GET" };
      if (t.headers) opts.headers = t.headers;
      if (t.body) opts.body = t.body;

      const res = await fetch(t.url, opts);
      const ok = res.status === t.expect.status;

      if (!ok) {
        console.log(`  ✗ ${t.name} — esperaba ${t.expect.status}, recibió ${res.status}`);
        failed++;
        continue;
      }

      if (t.expect.bodyIncludes) {
        const text = await res.text();
        if (!text.includes(t.expect.bodyIncludes)) {
          console.log(`  ✗ ${t.name} — falta "${t.expect.bodyIncludes}" en el HTML`);
          failed++;
          continue;
        }
      }

      if (t.expect.json) {
        const data = await res.json();
        if (t.expect.field && !(t.expect.field in data)) {
          console.log(`  ✗ ${t.name} — falta campo "${t.expect.field}" en JSON`);
          failed++;
          continue;
        }
      }

      console.log(`  ✓ ${t.name}`);
      passed++;
    } catch (err) {
      console.log(`  ✗ ${t.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} pasaron, ${failed} fallaron de ${tests.length} total.`);
  if (failed > 0) process.exit(1);
}

run();
