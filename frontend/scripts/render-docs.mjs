import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = resolve(__dirname, '../../docs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
});

async function load(file, w, h) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(DOCS, file)).href, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(1200);
  return page;
}

// ── Documento (A4 multipágina) ──
{
  const page = await load('DOCUMENTO-DISENO.html', 794, 1123);
  await page.pdf({ path: resolve(DOCS, 'DOCUMENTO-DISENO.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  // preview de las 2 primeras páginas
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.4 });
  await page.screenshot({ path: resolve(DOCS, 'preview-doc.png'), clip: { x: 0, y: 0, width: 794, height: 1123 * 2 + 30 } });
  console.log('✓ DOCUMENTO-DISENO.pdf + preview');
  await page.close();
}

// ── Poster (B2 500x700mm) ──
{
  const page = await load('POSTER-B2.html', 1890, 2646);
  await page.pdf({ path: resolve(DOCS, 'POSTER-B2.pdf'), width: '500mm', height: '700mm', printBackground: true, pageRanges: '1' });
  await page.screenshot({ path: resolve(DOCS, 'preview-poster.png'), fullPage: false });
  console.log('✓ POSTER-B2.pdf + preview');
  await page.close();
}

await browser.close();
console.log('Listo →', DOCS);
