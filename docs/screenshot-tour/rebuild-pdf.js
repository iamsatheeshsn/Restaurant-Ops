/**
 * Rebuild PDF from existing shots with:
 * - No cover page
 * - Backend (admin) screens first, then frontend (storefront)
 * - Full-bleed pages (no header/footer/margins)
 * Re-captures menu pages with viewport-fit so "Our Premium Menu" fills the page.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const BASE = process.env.APP_URL || 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, 'shots');
const PDF_PATH = path.join(__dirname, '..', 'Restaurant_Ops_Live_UI_Walkthrough.pdf');
const VIEWPORT = { width: 1684, height: 1191 };
const PAGE_W = 841.89;
const PAGE_H = 595.28;

const MENU_URLS = [
  { url: '/r/tastyc-coffee-house/menu', file: '00-sf-tastyc-menu' },
  { url: '/r/spice-haven-kitchen/menu', file: '00-sf-spice-menu' },
  { url: '/r/ocean-bistro/menu', file: '00-sf-ocean-menu' },
  { url: '/r/green-leaf-cafe/menu', file: '00-sf-green-menu' },
];

async function fitContentToViewport(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    body.style.transform = '';
    body.style.width = '';
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    const sw = Math.max(html.scrollWidth, body.scrollWidth, window.innerWidth);
    const sh = Math.max(html.scrollHeight, body.scrollHeight, window.innerHeight);
    const scale = Math.min(window.innerWidth / sw, window.innerHeight / sh, 1);
    if (scale < 0.999) {
      body.style.transformOrigin = '0 0';
      body.style.transform = `scale(${scale})`;
      body.style.width = `${100 / scale}%`;
    }
  });
  await page.waitForTimeout(250);
}

async function recaptureMenus() {
  console.log('=== Re-capturing Premium Menu pages (fit to viewport) ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const item of MENU_URLS) {
    await page.goto(`${BASE}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 });
    } catch {
      /* ignore */
    }
    await page.waitForTimeout(1200);
    await fitContentToViewport(page);
    const file = path.join(OUT_DIR, `${item.file}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85, fullPage: false });
    console.log(`  ✓ ${item.file}`);
  }
  // Also refresh customer menu shots if present
  const custMenus = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.startsWith('cust-') && f.includes('-menu') && f.endsWith('.jpg'));
  for (const f of custMenus) {
    // Map brand from filename: cust-spice-haven-menu.jpg
    const brand = f.replace(/^cust-/, '').replace(/-menu\.jpg$/, '');
    const slugMap = {
      'tastyc-coffee-house': 'tastyc-coffee-house',
      'spice-haven': 'spice-haven-kitchen',
      'ocean-bistro': 'ocean-bistro',
      'green-leaf-cafe': 'green-leaf-cafe',
    };
    const slug = slugMap[brand];
    if (!slug) continue;
    await page.goto(`${BASE}/r/${slug}/menu`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 });
    } catch {
      /* ignore */
    }
    await page.waitForTimeout(1000);
    await fitContentToViewport(page);
    await page.screenshot({
      path: path.join(OUT_DIR, f),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log(`  ✓ ${f}`);
  }
  await browser.close();
}

function titleFromFile(name) {
  return name.replace(/\.jpg$/i, '').replace(/-/g, ' ');
}

function collectPages() {
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.toLowerCase().endsWith('.jpg'));

  const isBackend = (f) =>
    f === '00-admin-login.jpg' || f.startsWith('admin-');

  const backend = files
    .filter(isBackend)
    .sort((a, b) => {
      if (a === '00-admin-login.jpg') return -1;
      if (b === '00-admin-login.jpg') return 1;
      return a.localeCompare(b);
    });

  const frontend = files
    .filter((f) => !isBackend(f))
    .sort((a, b) => a.localeCompare(b));

  console.log(`Backend pages: ${backend.length}, Frontend pages: ${frontend.length}`);

  return [...backend, ...frontend].map((f) => ({
    file: path.join(OUT_DIR, f),
    title: titleFromFile(f),
  }));
}

async function buildPdf(pages) {
  console.log(`=== Building full-bleed PDF (${pages.length} pages, no cover) ===`);
  const pdf = await PDFDocument.create();
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

  for (const item of pages) {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    if (!item.file || !fs.existsSync(item.file)) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_W,
        height: PAGE_H,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText('Missing screenshot', {
        x: 40,
        y: PAGE_H / 2,
        size: 14,
        font: fontReg,
        color: rgb(1, 0.4, 0.4),
      });
      continue;
    }
    const image = await pdf.embedJpg(fs.readFileSync(item.file));
    page.drawImage(image, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  }

  const out = await pdf.save();
  fs.writeFileSync(PDF_PATH, out);
  console.log(`PDF written: ${PDF_PATH} (${Math.round(out.length / 1024)} KB)`);
}

async function main() {
  await recaptureMenus();
  const pages = collectPages();
  await buildPdf(pages);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
