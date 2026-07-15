/**
 * Live UI screenshot capture → fit-to-page A4 landscape PDF.
 * Run: node capture.js
 * Requires frontend :5173 and backend :5000.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const BASE = process.env.APP_URL || 'http://localhost:5173';
const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const PASS = 'password123';
const OUT_DIR = path.join(__dirname, 'shots');
const PDF_PATH = path.join(__dirname, '..', 'Restaurant_Ops_Live_UI_Walkthrough.pdf');
// Match A4 landscape aspect so screenshots fill the PDF page with no letterboxing.
const VIEWPORT = { width: 1684, height: 1191 };
const WAIT_MS = 900;
const PAGE_W = 841.89;
const PAGE_H = 595.28;

/** Resolved from live DB / known seed. */
const TENANTS = {
  Platform: null,
  'Tastyc Coffee House': 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333',
  'Spice Haven': '1986a50c-b166-4771-87df-3d37f61d66a2',
  'Ocean Bistro': '73abee05-a369-4ce7-af7d-cff66ed7ecbe',
  'Green Leaf Cafe': '60cfbbf7-2347-4e98-81cf-c05324ab5dc7',
};

/** Routes each admin role can open (mirrors frontend/src/config/rbac.ts). */
const ROLE_ROUTES = {
  SUPER_ADMIN: [
    '/admin',
    '/admin/platform/tenants',
    '/admin/platform/billing',
    '/admin/platform/system',
    '/admin/platform/integrations',
    '/admin/platform/support',
    '/admin/audit',
    '/admin/roles',
    '/admin/settings',
  ],
  OWNER: [
    '/admin',
    '/admin/finance',
    '/admin/approvals',
    '/admin/orders',
    '/admin/cash',
    '/admin/crm',
    '/admin/delivery',
    '/admin/enterprise',
    '/admin/menu',
    '/admin/inventory',
    '/admin/transfers',
    '/admin/waste',
    '/admin/attendance',
    '/admin/scheduling',
    '/admin/hr',
    '/admin/marketing',
    '/admin/expenses',
    '/admin/org-audit',
    '/admin/franchise',
    '/admin/master-data',
    '/admin/roles',
    '/admin/settings',
  ],
  AREA_MANAGER: [
    '/admin',
    '/admin/finance',
    '/admin/approvals',
    '/admin/orders',
    '/admin/crm',
    '/admin/delivery',
    '/admin/enterprise',
    '/admin/menu',
    '/admin/inventory',
    '/admin/transfers',
    '/admin/waste',
    '/admin/attendance',
    '/admin/scheduling',
    '/admin/franchise',
  ],
  BRANCH_MANAGER: [
    '/admin',
    '/admin/finance',
    '/admin/approvals',
    '/admin/orders',
    '/admin/cash',
    '/admin/crm',
    '/admin/delivery',
    '/admin/enterprise',
    '/admin/menu',
    '/admin/inventory',
    '/admin/transfers',
    '/admin/waste',
    '/admin/attendance',
    '/admin/scheduling',
    '/admin/expenses',
    '/admin/master-data',
    '/admin/roles',
  ],
  KITCHEN_MANAGER: [
    '/admin',
    '/admin/orders',
    '/admin/enterprise',
    '/admin/menu',
    '/admin/inventory',
    '/admin/transfers',
    '/admin/waste',
  ],
  CHEF: ['/admin', '/admin/orders', '/admin/waste'],
  SOUS_CHEF: ['/admin', '/admin/orders', '/admin/waste'],
  KITCHEN_STAFF: ['/admin', '/admin/orders'],
  WAITER: ['/admin', '/admin/orders', '/admin/crm'],
  CASHIER: ['/admin', '/admin/orders', '/admin/cash', '/admin/crm'],
  INVENTORY_MANAGER: ['/admin', '/admin/inventory', '/admin/transfers', '/admin/waste'],
  PURCHASE_MANAGER: ['/admin', '/admin/approvals', '/admin/inventory'],
  DELIVERY_MANAGER: ['/admin', '/admin/orders', '/admin/delivery'],
  DELIVERY_STAFF: ['/admin', '/admin/orders', '/admin/delivery'],
  HR_MANAGER: [
    '/admin',
    '/admin/attendance',
    '/admin/scheduling',
    '/admin/hr',
    '/admin/master-data',
    '/admin/roles',
  ],
  ACCOUNTANT: ['/admin', '/admin/finance', '/admin/expenses'],
  MARKETING_MANAGER: ['/admin', '/admin/crm', '/admin/marketing'],
  SYSTEM_AUDITOR: ['/admin', '/admin/menu', '/admin/attendance', '/admin/org-audit'],
};

const ROUTE_LABELS = {
  '/admin': 'Dashboard',
  '/admin/finance': 'Finance & P&L',
  '/admin/approvals': 'Approvals',
  '/admin/platform/tenants': 'Platform — Tenants',
  '/admin/platform/billing': 'Platform — Billing & Plans',
  '/admin/platform/system': 'Platform — System & Analytics',
  '/admin/platform/integrations': 'Platform — Integrations & Tax',
  '/admin/platform/support': 'Platform — Support Tickets',
  '/admin/audit': 'Platform Audit',
  '/admin/orders': 'KDS (Orders)',
  '/admin/cash': 'Cash Drawer',
  '/admin/crm': 'Reservations & CRM',
  '/admin/delivery': 'Delivery Hub',
  '/admin/enterprise': 'Catering & Production',
  '/admin/menu': 'Menu Manager',
  '/admin/inventory': 'Inventory & POs',
  '/admin/transfers': 'Stock Transfers',
  '/admin/waste': 'Waste Tracker',
  '/admin/attendance': 'Attendance Shifts',
  '/admin/scheduling': 'Staff Scheduling',
  '/admin/hr': 'HR & Leave',
  '/admin/marketing': 'Marketing Campaigns',
  '/admin/expenses': 'Expenses',
  '/admin/org-audit': 'Audit Logs',
  '/admin/franchise': 'Branches / Franchise',
  '/admin/master-data': 'Master References',
  '/admin/roles': 'Roles & Permissions',
  '/admin/settings': 'System Settings',
};

/** Admin staff accounts to walk through. */
const ADMIN_ACCOUNTS = [
  { email: 'superadmin@restaurantops.com', role: 'SUPER_ADMIN', brand: 'Platform' },
  { email: 'owner@tastyc.com', role: 'OWNER', brand: 'Tastyc Coffee House' },
  { email: 'areamanager@tastyc.com', role: 'AREA_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'manager@tastyc.com', role: 'BRANCH_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'kitchenmanager@tastyc.com', role: 'KITCHEN_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'chef@tastyc.com', role: 'CHEF', brand: 'Tastyc Coffee House' },
  { email: 'souschef@tastyc.com', role: 'SOUS_CHEF', brand: 'Tastyc Coffee House' },
  { email: 'kitchenstaff@tastyc.com', role: 'KITCHEN_STAFF', brand: 'Tastyc Coffee House' },
  { email: 'waiter@tastyc.com', role: 'WAITER', brand: 'Tastyc Coffee House' },
  { email: 'cashier@tastyc.com', role: 'CASHIER', brand: 'Tastyc Coffee House' },
  { email: 'inventory@tastyc.com', role: 'INVENTORY_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'purchase@tastyc.com', role: 'PURCHASE_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'deliverymanager@tastyc.com', role: 'DELIVERY_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'delivery@tastyc.com', role: 'DELIVERY_STAFF', brand: 'Tastyc Coffee House' },
  { email: 'hr@tastyc.com', role: 'HR_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'accountant@tastyc.com', role: 'ACCOUNTANT', brand: 'Tastyc Coffee House' },
  { email: 'marketing@tastyc.com', role: 'MARKETING_MANAGER', brand: 'Tastyc Coffee House' },
  { email: 'auditor@tastyc.com', role: 'SYSTEM_AUDITOR', brand: 'Tastyc Coffee House' },
  // Multi-tenant owners + sample roles
  { email: 'owner@spicehaven.com', role: 'OWNER', brand: 'Spice Haven', routes: ['/admin', '/admin/orders', '/admin/menu', '/admin/settings'] },
  { email: 'manager@spicehaven.com', role: 'BRANCH_MANAGER', brand: 'Spice Haven', routes: ['/admin', '/admin/orders', '/admin/cash'] },
  { email: 'chef@spicehaven.com', role: 'CHEF', brand: 'Spice Haven' },
  { email: 'cashier@spicehaven.com', role: 'CASHIER', brand: 'Spice Haven' },
  { email: 'waiter@spicehaven.com', role: 'WAITER', brand: 'Spice Haven' },
  { email: 'owner@oceanbistro.com', role: 'OWNER', brand: 'Ocean Bistro', routes: ['/admin', '/admin/orders', '/admin/menu', '/admin/settings'] },
  { email: 'manager@oceanbistro.com', role: 'BRANCH_MANAGER', brand: 'Ocean Bistro', routes: ['/admin', '/admin/orders'] },
  { email: 'chef@oceanbistro.com', role: 'CHEF', brand: 'Ocean Bistro' },
  { email: 'cashier@oceanbistro.com', role: 'CASHIER', brand: 'Ocean Bistro' },
  { email: 'owner@greenleafcafe.co.uk', role: 'OWNER', brand: 'Green Leaf Cafe', routes: ['/admin', '/admin/orders', '/admin/menu', '/admin/settings'] },
  { email: 'manager@greenleafcafe.co.uk', role: 'BRANCH_MANAGER', brand: 'Green Leaf Cafe', routes: ['/admin', '/admin/orders'] },
  { email: 'chef@greenleafcafe.co.uk', role: 'CHEF', brand: 'Green Leaf Cafe' },
  { email: 'cashier@greenleafcafe.co.uk', role: 'CASHIER', brand: 'Green Leaf Cafe' },
];

/** Back-office / admin screenshots that lead the PDF (before storefront). */
const BACKEND_INTRO_SHOTS = [
  { url: '/admin/login', title: 'Admin Login — Sign In Panel', file: '00-admin-login' },
];

/** Customer-facing storefront (frontend) — captured after all admin roles. */
const FRONTEND_SHOTS = [
  { url: '/', title: 'Public — Restaurant Directory', file: '00-directory' },
  { url: '/r/tastyc-coffee-house', title: 'Storefront — Tastyc Coffee House (Home)', file: '00-sf-tastyc-home' },
  { url: '/r/tastyc-coffee-house/menu', title: 'Storefront — Tastyc Menu', file: '00-sf-tastyc-menu' },
  { url: '/r/tastyc-coffee-house/login', title: 'Customer Login — Tastyc', file: '00-sf-tastyc-login' },
  { url: '/r/tastyc-coffee-house/reservations', title: 'Storefront — Reservations', file: '00-sf-tastyc-reservations' },
  { url: '/r/tastyc-coffee-house/loyalty', title: 'Storefront — Loyalty Lounge', file: '00-sf-tastyc-loyalty' },
  { url: '/r/tastyc-coffee-house/supplier/portal', title: 'Supplier Portal — Login', file: '00-sf-tastyc-supplier' },
  { url: '/r/spice-haven-kitchen', title: 'Storefront — Spice Haven (Home)', file: '00-sf-spice-home' },
  { url: '/r/spice-haven-kitchen/menu', title: 'Storefront — Spice Haven Menu', file: '00-sf-spice-menu' },
  { url: '/r/ocean-bistro', title: 'Storefront — Ocean Bistro (Home)', file: '00-sf-ocean-home' },
  { url: '/r/ocean-bistro/menu', title: 'Storefront — Ocean Bistro Menu', file: '00-sf-ocean-menu' },
  { url: '/r/green-leaf-cafe', title: 'Storefront — Green Leaf Cafe (Home)', file: '00-sf-green-home' },
  { url: '/r/green-leaf-cafe/menu', title: 'Storefront — Green Leaf Cafe Menu', file: '00-sf-green-menu' },
];

const CUSTOMER_ACCOUNTS = [
  {
    email: 'customer@tastyc.com',
    slug: 'tastyc-coffee-house',
    brand: 'Tastyc Coffee House',
    after: ['/menu', '/loyalty', '/reservations'],
  },
  {
    email: 'customer@spicehaven.com',
    slug: 'spice-haven-kitchen',
    brand: 'Spice Haven',
    after: ['/menu'],
  },
  {
    email: 'customer@oceanbistro.com',
    slug: 'ocean-bistro',
    brand: 'Ocean Bistro',
    after: ['/menu'],
  },
  {
    email: 'customer@greenleafcafe.co.uk',
    slug: 'green-leaf-cafe',
    brand: 'Green Leaf Cafe',
    after: ['/menu'],
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function clearSession(page, tenantId = null) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate((tid) => {
    localStorage.clear();
    sessionStorage.clear();
    if (tid) localStorage.setItem('tastyc_tenant_id', tid);
  }, tenantId);
}

async function waitSettled(page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 8000 });
  } catch {
    /* ignore */
  }
  await page.waitForTimeout(WAIT_MS);
}

/**
 * Shrink UI into the viewport when it overflows (esp. horizontal clip on admin).
 * Uses CSS zoom so layout reflows. Tall marketing pages are NOT squashed into a
 * tiny column (that caused black side bars) — only slight vertical overflow is zoomed.
 */
async function fitContentToViewport(page) {
  await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;

    body.style.transform = '';
    body.style.width = '';
    body.style.height = '';
    body.style.zoom = '1';

    let style = document.getElementById('__pdf_capture_style');
    if (!style) {
      style = document.createElement('style');
      style.id = '__pdf_capture_style';
      document.head.appendChild(style);
    }
    style.textContent = `
      html, body { overflow: hidden !important; max-width: 100vw !important; }
      * { scrollbar-width: none !important; }
      *::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
    `;

    const measure = () => ({
      sw: Math.max(html.scrollWidth, body.scrollWidth, html.clientWidth),
      sh: Math.max(html.scrollHeight, body.scrollHeight, html.clientHeight),
      iw: window.innerWidth,
      ih: window.innerHeight,
    });

    const needsZoom = () => {
      const { sw, sh, iw, ih } = measure();
      const hOverflow = sw > iw + 4;
      // Only zoom for mild vertical overflow so long pages stay full-width
      const vOverflow = sh > ih + 4 && sh / ih <= 1.45;
      return hOverflow || vOverflow;
    };

    let zoom = 1;
    for (let i = 0; i < 30 && needsZoom() && zoom > 0.42; i++) {
      zoom = Math.round((zoom - 0.035) * 1000) / 1000;
      body.style.zoom = String(zoom);
    }

    // Hard guarantee: no horizontal clipping
    const { sw, iw } = measure();
    if (sw > iw + 4) {
      zoom = Math.max(0.4, zoom * (iw / sw));
      body.style.zoom = String(zoom);
    }
  });
  await page.waitForTimeout(350);
}

async function shot(page, fileBase, title, pages, _opts = {}) {
  await fitContentToViewport(page);
  const file = path.join(OUT_DIR, `${fileBase}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 84, fullPage: false });
  pages.push({ file, title });
  console.log(`  ✓ ${title}`);
  return file;
}

async function adminLogin(page, email, brand) {
  const tenantId = TENANTS[brand] ?? null;
  await clearSession(page, tenantId);
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitSettled(page);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASS);
}

async function submitAdminLogin(page) {
  await page.click('button[type="submit"]');
  const deadline = Date.now() + 35000;
  while (Date.now() < deadline) {
    const token = await page.evaluate(() => localStorage.getItem('tastyc_token'));
    if (token) break;
    const err = await page
      .locator('.bg-red-950\\/25 p, .text-red-400')
      .first()
      .textContent()
      .catch(() => '');
    if (err && err.trim().length > 3) {
      throw new Error(`Login error: ${err.trim().slice(0, 160)}`);
    }
    await page.waitForTimeout(250);
  }
  const token = await page.evaluate(() => localStorage.getItem('tastyc_token'));
  if (!token) {
    throw new Error('Login did not store auth token');
  }
  await page.waitForURL((url) => url.pathname.startsWith('/admin') && !url.pathname.includes('/login'), {
    timeout: 20000,
  });
  await waitSettled(page);
  const url = page.url();
  if (!url.includes('/admin') || url.includes('/admin/login')) {
    throw new Error(`Login did not land on admin panel: ${url}`);
  }
}

async function captureBackendIntro(page, pages) {
  console.log('\n=== Backend — Admin login ===');
  await clearSession(page, null);
  for (const item of BACKEND_INTRO_SHOTS) {
    await page.goto(`${BASE}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitSettled(page);
    await shot(page, item.file, item.title, pages);
  }
}

async function captureFrontend(page, pages) {
  console.log('\n=== Frontend — Public & storefront screens ===');
  await clearSession(page, null);
  for (const item of FRONTEND_SHOTS) {
    await page.goto(`${BASE}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitSettled(page);
    await shot(page, item.file, item.title, pages);
  }
}

async function captureAdminAccounts(page, pages) {
  for (const acct of ADMIN_ACCOUNTS) {
    const routes = acct.routes || ROLE_ROUTES[acct.role] || ['/admin'];
    console.log(`\n=== ${acct.role} · ${acct.email} (${acct.brand}) ===`);
    const prefix = `admin-${slugify(acct.brand)}-${slugify(acct.role)}`;

    try {
      await adminLogin(page, acct.email, acct.brand);
      await shot(
        page,
        `${prefix}-login`,
        `Login — ${acct.role} · ${acct.email}`,
        pages
      );
      await submitAdminLogin(page);

      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const label = ROUTE_LABELS[route] || route;
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await waitSettled(page);
        // Skip if redirected away (permission deny)
        if (page.url().includes('/admin/login') || !page.url().includes('/admin')) {
          console.log(`  ⚠ skipped ${route} (redirect)`);
          continue;
        }
        await shot(
          page,
          `${prefix}-${String(i).padStart(2, '0')}-${slugify(label)}`,
          `${acct.role} · ${acct.brand} — ${label}`,
          pages
        );
      }
    } catch (err) {
      console.error(`  ✗ Failed ${acct.email}: ${err.message}`);
      pages.push({
        file: null,
        title: `ERROR — ${acct.role} · ${acct.email}: ${err.message}`,
        error: true,
      });
    }
  }
}

async function captureCustomers(page, pages) {
  console.log('\n=== Customer storefront logins ===');
  for (const cust of CUSTOMER_ACCOUNTS) {
    const prefix = `cust-${slugify(cust.brand)}`;
    console.log(`\n=== CUSTOMER · ${cust.email} (${cust.brand}) ===`);
    try {
      await clearSession(page, TENANTS[cust.brand] || null);
      const loginUrl = `${BASE}/r/${cust.slug}/login`;
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitSettled(page);
      await page.fill('input[type="email"]', cust.email);
      await page.fill('input[type="password"]', PASS);
      await shot(page, `${prefix}-login`, `Customer Login — ${cust.brand} · ${cust.email}`, pages);
      await Promise.all([
        page.waitForURL(new RegExp(`/r/${cust.slug}`), { timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);
      await waitSettled(page);

      for (const rel of cust.after) {
        const url = `${BASE}/r/${cust.slug}${rel}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await waitSettled(page);
        await shot(
          page,
          `${prefix}-${slugify(rel)}`,
          `Customer · ${cust.brand} — ${rel.replace('/', '') || 'home'}`,
          pages
        );
      }
    } catch (err) {
      console.error(`  ✗ Failed customer ${cust.email}: ${err.message}`);
    }
  }
}

async function captureSupplier(page, pages) {
  console.log('\n=== Supplier portal ===');
  try {
    await clearSession(page, TENANTS['Tastyc Coffee House']);
    await page.goto(`${BASE}/r/tastyc-coffee-house/supplier/portal`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await waitSettled(page);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count()) {
      await emailInput.fill('dave@nycroasters.com');
      await shot(
        page,
        'supplier-login-filled',
        'Supplier Portal — dave@nycroasters.com (ready to login)',
        pages
      );
      const btn = page.locator('button[type="submit"]').first();
      if (await btn.count()) {
        await btn.click();
        await waitSettled(page);
        await shot(page, 'supplier-after-login', 'Supplier Portal — After email submit', pages);
      }
    }
  } catch (err) {
    console.error(`  ✗ Supplier: ${err.message}`);
  }
}

async function buildPdf(pages) {
  console.log(`\n=== Building PDF (${pages.length} pages) ===`);
  const pdf = await PDFDocument.create();
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

  for (const item of pages) {
    const page = pdf.addPage([PAGE_W, PAGE_H]);

    if (item.error || !item.file || !fs.existsSync(item.file)) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_W,
        height: PAGE_H,
        color: rgb(0.12, 0.12, 0.12),
      });
      page.drawText((item.title || 'Screenshot unavailable').slice(0, 100), {
        x: 40,
        y: PAGE_H / 2,
        size: 12,
        font: fontReg,
        color: rgb(0.9, 0.4, 0.4),
      });
      continue;
    }

    const bytes = fs.readFileSync(item.file);
    const image = await pdf.embedJpg(bytes);
    // Full bleed — no header/footer/margins; fill entire page.
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: PAGE_W,
      height: PAGE_H,
    });
  }

  const out = await pdf.save();
  fs.writeFileSync(PDF_PATH, out);
  console.log(`\nPDF written: ${PDF_PATH} (${Math.round(out.length / 1024)} KB)`);
}

async function main() {
  ensureDir(OUT_DIR);
  // Clean previous shots
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.jpg') || f.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, f));
  }

  console.log(`Base URL: ${BASE}`);
  console.log(`Viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const pages = [];

  try {
    // Backend (admin / back-office) first, then frontend (storefront / customers).
    await captureBackendIntro(page, pages);
    await captureAdminAccounts(page, pages);
    await captureFrontend(page, pages);
    await captureCustomers(page, pages);
    await captureSupplier(page, pages);
  } finally {
    await browser.close();
  }

  await buildPdf(pages);
  console.log(`Total screenshot pages (excl. cover): ${pages.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
