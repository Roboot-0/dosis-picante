/**
 * Optimiza imágenes grandes del /public/images/ en sitio.
 * - PNGs de producto: mantiene transparencia, baja profundidad + quantiza
 * - Reemplaza el archivo original si la versión optimizada pesa menos
 *
 * Uso: `node scripts/optimize-images.js`
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public", "images");

const PRODUCTS = ["microdosis.png", "ahumadosis.png", "sobredosis.png"];
const JPEGS = ["capsaicina.jpeg"];

async function optimizePNG(file) {
  const input = path.join(ROOT, file);
  if (!fs.existsSync(input)) return;
  const before = fs.statSync(input).size;
  const tmp = input + ".tmp";
  // Producto: foto de botella sobre fondo; 1600px máx, compresión fuerte
  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 82, palette: true })
    .toFile(tmp);
  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, input);
    console.log(
      `✓ ${file}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(
        0,
      )}KB (-${(((before - after) / before) * 100).toFixed(0)}%)`,
    );
  } else {
    fs.unlinkSync(tmp);
    console.log(`= ${file}: sin mejora (${(before / 1024).toFixed(0)}KB)`);
  }
}

async function optimizeJPEG(file) {
  const input = path.join(ROOT, file);
  if (!fs.existsSync(input)) return;
  const before = fs.statSync(input).size;
  const tmp = input + ".tmp";
  await sharp(input)
    .resize({ width: 1800, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(tmp);
  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, input);
    console.log(
      `✓ ${file}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(
        0,
      )}KB (-${(((before - after) / before) * 100).toFixed(0)}%)`,
    );
  } else {
    fs.unlinkSync(tmp);
    console.log(`= ${file}: sin mejora (${(before / 1024).toFixed(0)}KB)`);
  }
}

(async () => {
  console.log("Optimizando imágenes…\n");
  for (const f of PRODUCTS) await optimizePNG(f);
  for (const f of JPEGS) await optimizeJPEG(f);
  console.log("\nListo.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
