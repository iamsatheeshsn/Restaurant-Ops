/**
 * Seed additional restaurant tenants with operational demo data.
 * Idempotent: skips a tenant if one with the same companyName already exists.
 *
 * Usage: npm run prisma:seed-tenants
 */
import { PrismaClient, SubscriptionTier, TenantStatus, CampaignStatus, ExpenseStatus, IngredientUnit } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS, SYSTEM_ROLES } from '../src/config/rbac';

const prisma = new PrismaClient();

const TENANT_ROLES = SYSTEM_ROLES.filter((name) => name !== 'SUPER_ADMIN');

type TenantBlueprint = {
  name: string;
  companyName: string;
  slug: string;
  status: TenantStatus;
  planTier: SubscriptionTier;
  currency: string;
  timezone: string;
  domain: string;
  branches: Array<{
    name: string;
    address: string;
    phone: string;
    email: string;
    floors: string[];
    kitchenSections: string[];
  }>;
  categories: Array<{
    name: string;
    items: Array<{ name: string; description: string; price: number; imageUrl: string }>;
  }>;
  ingredients: Array<{ name: string; unit: IngredientUnit; stockLevel: number; lowStockThreshold: number }>;
  suppliers: Array<{ name: string; contactName: string; phone: string; email: string }>;
  staff: Array<{ emailLocal: string; name: string; role: string; bindBranch: boolean }>;
};

const TENANTS: TenantBlueprint[] = [
  {
    name: 'Spice Haven Kitchen',
    companyName: 'Spice Haven Hospitality Pvt Ltd',
    slug: 'spice-haven',
    status: TenantStatus.ACTIVE,
    planTier: SubscriptionTier.GROWTH,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    domain: 'spicehaven.com',
    branches: [
      {
        name: 'Spice Haven - Indiranagar',
        address: '12th Main, Indiranagar, Bengaluru 560038',
        phone: '+918012345001',
        email: 'indiranagar@spicehaven.com',
        floors: ['Dining Hall', 'Private Dining'],
        kitchenSections: ['Tandoor', 'Curry Station', 'Dessert'],
      },
      {
        name: 'Spice Haven - Koramangala',
        address: '80 Feet Road, Koramangala, Bengaluru 560034',
        phone: '+918012345002',
        email: 'koramangala@spicehaven.com',
        floors: ['Main Floor'],
        kitchenSections: ['Hot Line', 'Grill'],
      },
    ],
    categories: [
      {
        name: 'Starters',
        items: [
          {
            name: 'Paneer Tikka',
            description: 'Charcoal-grilled cottage cheese with mint chutney.',
            price: 280,
            imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Chicken Seekh Kebab',
            description: 'Minced chicken skewers with garam masala.',
            price: 320,
            imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f1?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
      {
        name: 'Mains',
        items: [
          {
            name: 'Butter Chicken',
            description: 'Tomato-butter gravy with tender chicken.',
            price: 420,
            imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae958?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Dal Makhani',
            description: 'Slow-cooked black lentils with cream.',
            price: 260,
            imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
      {
        name: 'Breads & Rice',
        items: [
          {
            name: 'Garlic Naan',
            description: 'Tandoor-baked flatbread with garlic butter.',
            price: 80,
            imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Jeera Rice',
            description: 'Basmati rice tempered with cumin.',
            price: 150,
            imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
    ],
    ingredients: [
      { name: 'Basmati Rice', unit: IngredientUnit.KG, stockLevel: 80, lowStockThreshold: 15 },
      { name: 'Paneer', unit: IngredientUnit.KG, stockLevel: 25, lowStockThreshold: 5 },
      { name: 'Chicken (boneless)', unit: IngredientUnit.KG, stockLevel: 40, lowStockThreshold: 10 },
      { name: 'Ghee', unit: IngredientUnit.LITER, stockLevel: 12, lowStockThreshold: 3 },
    ],
    suppliers: [
      {
        name: 'Bengaluru Fresh Meats',
        contactName: 'Ravi Kumar',
        phone: '+918098760011',
        email: 'ravi@bfmeats.in',
      },
      {
        name: 'Spice Route Traders',
        contactName: 'Meera Shah',
        phone: '+918098760022',
        email: 'meera@spiceroute.in',
      },
    ],
    staff: [
      { emailLocal: 'owner', name: 'Ananya Reddy (Owner)', role: 'OWNER', bindBranch: false },
      { emailLocal: 'manager', name: 'Vikram Iyer (Branch Manager)', role: 'BRANCH_MANAGER', bindBranch: true },
      { emailLocal: 'chef', name: 'Chef Arjun Malhotra', role: 'CHEF', bindBranch: true },
      { emailLocal: 'cashier', name: 'Cashier Priya Nair', role: 'CASHIER', bindBranch: true },
      { emailLocal: 'waiter', name: 'Server Rohan Das', role: 'WAITER', bindBranch: true },
      { emailLocal: 'customer', name: 'Kabir Mehta (Customer)', role: 'CUSTOMER', bindBranch: false },
    ],
  },
  {
    name: 'Ocean Bistro',
    companyName: 'Ocean Bistro Seafood LLC',
    slug: 'ocean-bistro',
    status: TenantStatus.ACTIVE,
    planTier: SubscriptionTier.ENTERPRISE,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    domain: 'oceanbistro.com',
    branches: [
      {
        name: 'Ocean Bistro - Santa Monica',
        address: '1440 Ocean Ave, Santa Monica, CA 90401',
        phone: '+13105550110',
        email: 'santamonica@oceanbistro.com',
        floors: ['Ocean View', 'Bar Lounge'],
        kitchenSections: ['Seafood Grill', 'Cold Prep', 'Pastry'],
      },
    ],
    categories: [
      {
        name: 'Raw Bar',
        items: [
          {
            name: 'Oysters on the Half Shell',
            description: 'Half dozen Pacific oysters with mignonette.',
            price: 24,
            imageUrl: 'https://images.unsplash.com/photo-1604908819870-efb1e0b9c0f8?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Tuna Tartare',
            description: 'Yellowfin tuna, avocado, sesame, citrus.',
            price: 18,
            imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
      {
        name: 'Grill',
        items: [
          {
            name: 'Grilled Salmon',
            description: 'Atlantic salmon, lemon butter, seasonal vegetables.',
            price: 32,
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Lobster Roll',
            description: 'Warm buttered lobster on toasted brioche.',
            price: 36,
            imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
      {
        name: 'Desserts',
        items: [
          {
            name: 'Key Lime Pie',
            description: 'Classic Florida-style pie with whipped cream.',
            price: 11,
            imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d5b1b0?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
    ],
    ingredients: [
      { name: 'Atlantic Salmon', unit: IngredientUnit.KG, stockLevel: 30, lowStockThreshold: 8 },
      { name: 'Pacific Oysters', unit: IngredientUnit.KG, stockLevel: 20, lowStockThreshold: 5 },
      { name: 'Lemon Butter', unit: IngredientUnit.LITER, stockLevel: 8, lowStockThreshold: 2 },
      { name: 'Brioche Buns', unit: IngredientUnit.PCS, stockLevel: 120, lowStockThreshold: 30 },
    ],
    suppliers: [
      {
        name: 'Pacific Catch Distributors',
        contactName: 'Elena Vargas',
        phone: '+13105550990',
        email: 'elena@pacificcatch.com',
      },
    ],
    staff: [
      { emailLocal: 'owner', name: 'Marcus Chen (Owner)', role: 'OWNER', bindBranch: false },
      { emailLocal: 'manager', name: 'Sofia Alvarez (Manager)', role: 'BRANCH_MANAGER', bindBranch: true },
      { emailLocal: 'chef', name: 'Chef Luca Romano', role: 'CHEF', bindBranch: true },
      { emailLocal: 'cashier', name: 'Cashier Mia Park', role: 'CASHIER', bindBranch: true },
      { emailLocal: 'customer', name: 'Jordan Lee (Customer)', role: 'CUSTOMER', bindBranch: false },
    ],
  },
  {
    name: 'Green Leaf Cafe',
    companyName: 'Green Leaf Wellness Cafes Ltd',
    slug: 'green-leaf',
    status: TenantStatus.TRIAL,
    planTier: SubscriptionTier.STARTER,
    currency: 'GBP',
    timezone: 'Europe/London',
    domain: 'greenleafcafe.co.uk',
    branches: [
      {
        name: 'Green Leaf - Shoreditch',
        address: '88 Brick Lane, London E1 6RL',
        phone: '+442079460123',
        email: 'shoreditch@greenleafcafe.co.uk',
        floors: ['Ground Floor', 'Mezzanine'],
        kitchenSections: ['Cold Kitchen', 'Juice Bar'],
      },
    ],
    categories: [
      {
        name: 'Bowls',
        items: [
          {
            name: 'Buddha Bowl',
            description: 'Quinoa, roasted veg, tahini, seeds.',
            price: 12.5,
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Acai Smoothie Bowl',
            description: 'Acai, banana, granola, berries.',
            price: 9.5,
            imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
      {
        name: 'Juices',
        items: [
          {
            name: 'Green Detox Juice',
            description: 'Kale, apple, ginger, cucumber.',
            price: 5.5,
            imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=600',
          },
          {
            name: 'Turmeric Latte',
            description: 'Golden milk with oat milk and honey.',
            price: 4.2,
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600',
          },
        ],
      },
    ],
    ingredients: [
      { name: 'Quinoa', unit: IngredientUnit.KG, stockLevel: 18, lowStockThreshold: 4 },
      { name: 'Kale', unit: IngredientUnit.KG, stockLevel: 10, lowStockThreshold: 3 },
      { name: 'Oat Milk', unit: IngredientUnit.LITER, stockLevel: 40, lowStockThreshold: 10 },
      { name: 'Acai Puree', unit: IngredientUnit.KG, stockLevel: 6, lowStockThreshold: 2 },
    ],
    suppliers: [
      {
        name: 'London Organic Produce',
        contactName: 'Hannah Brooks',
        phone: '+442079460999',
        email: 'hannah@londonorganic.co.uk',
      },
    ],
    staff: [
      { emailLocal: 'owner', name: 'Olivia Hart (Owner)', role: 'OWNER', bindBranch: false },
      { emailLocal: 'manager', name: 'Noah Patel (Manager)', role: 'BRANCH_MANAGER', bindBranch: true },
      { emailLocal: 'chef', name: 'Chef Isla Quinn', role: 'CHEF', bindBranch: true },
      { emailLocal: 'cashier', name: 'Cashier Theo Grant', role: 'CASHIER', bindBranch: true },
      { emailLocal: 'customer', name: 'Amelia Wright (Customer)', role: 'CUSTOMER', bindBranch: false },
    ],
  },
];

async function ensurePermissions() {
  const permissionsMap = new Map<string, string>();
  const existing = await prisma.permission.findMany();
  for (const p of existing) permissionsMap.set(p.scope, p.id);
  return permissionsMap;
}

async function seedTenant(bp: TenantBlueprint, permissionsMap: Map<string, string>, passwordHash: string) {
  const existing = await prisma.tenant.findFirst({
    where: { companyName: bp.companyName, deletedAt: null },
  });
  if (existing) {
    console.log(`⏭  Skipping ${bp.name} (already exists)`);
    return existing;
  }

  console.log(`\n▶ Seeding tenant: ${bp.name}`);

  const tenant = await prisma.tenant.create({
    data: {
      name: bp.name,
      companyName: bp.companyName,
      slug: bp.slug,
      status: bp.status,
    },
  });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      currency: bp.currency,
      timezone: bp.timezone,
      lowStockNotification: true,
      appName: bp.name,
      homeBannerTitle: bp.name,
      homeBannerSubtitle: `Welcome to ${bp.name} — order online and book a table.`,
      coffeeHouseCaption: `${bp.name} · Digital storefront`,
      highlightsTitle: `Why ${bp.name}`,
      highlightsDescription: 'Guest experience',
      platformHighlights: 'Fresh ingredients, Warm hospitality, Fast digital ordering',
      hoursOfService: 'Monday - Sunday: 10:00 AM - 10:00 PM',
      findUsAddress: bp.branches[0]?.address || '',
      findUsPhone: bp.branches[0]?.phone || '',
      findUsEmail: bp.branches[0]?.email || `hello@${bp.domain}`,
      footerContent: `© ${new Date().getFullYear()} ${bp.name}. Powered by Tastyc.`,
    },
  });

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const limits =
    bp.planTier === SubscriptionTier.ENTERPRISE
      ? { maxBranches: 100, maxEmployees: 500 }
      : bp.planTier === SubscriptionTier.GROWTH
        ? { maxBranches: 5, maxEmployees: 50 }
        : { maxBranches: 1, maxEmployees: 10 };

  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planTier: bp.planTier,
      status: bp.status === TenantStatus.TRIAL ? 'TRIALING' : 'ACTIVE',
      trialStart: bp.status === TenantStatus.TRIAL ? now : null,
      trialEnd: bp.status === TenantStatus.TRIAL ? periodEnd : null,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      maxBranches: limits.maxBranches,
      maxEmployees: limits.maxEmployees,
    },
  });

  const rolesMap = new Map<string, string>();
  for (const name of TENANT_ROLES) {
    const role = await prisma.role.create({
      data: { tenantId: tenant.id, name, isSystem: true },
    });
    rolesMap.set(name, role.id);
    const scopes = ROLE_PERMISSIONS[name] || [];
    const rows = scopes
      .map((scope) => permissionsMap.get(scope))
      .filter(Boolean)
      .map((permissionId) => ({ roleId: role.id, permissionId: permissionId! }));
    if (rows.length) {
      await prisma.rolePermission.createMany({ data: rows });
    }
  }

  const createdBranches: { id: string; name: string }[] = [];
  for (const b of bp.branches) {
    const branch = await prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        email: b.email,
      },
    });
    createdBranches.push(branch);

    for (const [idx, floorName] of b.floors.entries()) {
      const floor = await prisma.floor.create({
        data: { tenantId: tenant.id, branchId: branch.id, name: floorName },
      });
      const tableCount = idx === 0 ? 4 : 2;
      for (let n = 1; n <= tableCount; n++) {
        const number = `${floorName.slice(0, 1).toUpperCase()}${String(n).padStart(2, '0')}`;
        await prisma.table.create({
          data: {
            tenantId: tenant.id,
            floorId: floor.id,
            number,
            seatingCapacity: n % 2 === 0 ? 4 : 2,
            qrToken: `qr-${tenant.id.slice(0, 8)}-${branch.id.slice(0, 6)}-${number}`.toLowerCase(),
          },
        });
      }
    }

    for (const section of b.kitchenSections) {
      await prisma.kitchenSection.create({
        data: { tenantId: tenant.id, branchId: branch.id, name: section },
      });
    }
  }

  const primaryBranchId = createdBranches[0]?.id ?? null;

  for (const u of bp.staff) {
    const roleId = rolesMap.get(u.role);
    if (!roleId) continue;
    const email = `${u.emailLocal}@${bp.domain}`;
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name: u.name,
        passwordHash,
        phone: '+10000000000',
        roleId,
        branchId: u.bindBranch ? primaryBranchId : null,
      },
    });
  }

  for (const cat of bp.categories) {
    const category = await prisma.menuCategory.create({
      data: { tenantId: tenant.id, name: cat.name },
    });
    for (const item of cat.items) {
      await prisma.menuItem.create({
        data: {
          tenantId: tenant.id,
          categoryId: category.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: true,
        },
      });
    }
  }

  for (const ing of bp.ingredients) {
    await prisma.ingredient.create({
      data: {
        tenantId: tenant.id,
        name: ing.name,
        unit: ing.unit,
        stockLevel: ing.stockLevel,
        lowStockThreshold: ing.lowStockThreshold,
      },
    });
  }

  for (const s of bp.suppliers) {
    await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        contactName: s.contactName,
        phone: s.phone,
        email: s.email,
      },
    });
  }

  // Sample ops rows so platform/ops screens are not empty for new tenants
  const owner = await prisma.user.findFirst({
    where: { tenantId: tenant.id, role: { name: 'OWNER' }, deletedAt: null },
  });
  if (owner) {
    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        branchId: primaryBranchId,
        amount: bp.currency === 'INR' ? 15000 : bp.currency === 'GBP' ? 420 : 850,
        category: 'Utilities',
        description: 'Monthly utilities — demo seed',
        status: ExpenseStatus.APPROVED,
        createdById: owner.id,
        approvedById: owner.id,
      },
    });
    await prisma.marketingCampaign.create({
      data: {
        tenantId: tenant.id,
        name: `${bp.name} Launch Promo`,
        channel: 'EMAIL',
        status: CampaignStatus.SCHEDULED,
        audience: 'All customers',
        content: `Welcome offer for ${bp.name} guests — 10% off your first visit.`,
        scheduledAt: now,
      },
    });
  }

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      amount: bp.planTier === 'ENTERPRISE' ? 349 : bp.planTier === 'GROWTH' ? 129 : 49,
      currency: 'USD',
      status: bp.status === TenantStatus.TRIAL ? 'DRAFT' : 'OPEN',
      dueDate: periodEnd,
      description: `${bp.planTier} plan — ${bp.name}`,
    },
  });

  await prisma.supportTicket.create({
    data: {
      tenantId: tenant.id,
      subject: `Onboarding checklist — ${bp.name}`,
      description: 'Tenant seeded for platform demo. Confirm billing and feature flags.',
      status: 'OPEN',
      priority: 'MEDIUM',
      requesterEmail: `owner@${bp.domain}`,
      assigneeName: 'Platform Support',
    },
  });

  console.log(
    `  ✓ ${bp.name}: ${createdBranches.length} branch(es), ${bp.staff.length} users, menu + inventory + ops samples`
  );
  return tenant;
}

async function main() {
  console.log('Seeding additional restaurant tenants...');

  const permissionsMap = await ensurePermissions();
  if (permissionsMap.size === 0) {
    throw new Error('No permissions found. Run prisma:sync-rbac or prisma:seed first.');
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const created: string[] = [];

  for (const bp of TENANTS) {
    const tenant = await seedTenant(bp, permissionsMap, passwordHash);
    if (tenant) created.push(tenant.name);
  }

  console.log('\nDone.');
  console.log('Demo password for all staff: password123');
  console.log('Examples:');
  console.log('  owner@spicehaven.com');
  console.log('  owner@oceanbistro.com');
  console.log('  owner@greenleafcafe.co.uk');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
