import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PERMISSIONS, ROLE_PERMISSIONS, SYSTEM_ROLES } from '../src/config/rbac';
import { seedPlatformData } from './seed-platform';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full SaaS B2B database seeding...');

  // 1. Create Granular System Permissions (SaaS role catalog)
  console.log('Writing system permissions...');
  const permissionsMap = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { scope: perm.scope },
      update: { description: perm.description },
      create: { scope: perm.scope, description: perm.description }
    });
    permissionsMap.set(perm.scope, record.id);
  }



  // Create Default Restaurant Tenant: "Tastyc Coffee House"
  console.log('Writing default tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Tastyc Coffee House',
      companyName: 'Tastyc Operations Ltd.',
      slug: 'tastyc-coffee-house',
      status: 'ACTIVE'
    }
  });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      currency: 'USD',
      timezone: 'America/New_York',
      lowStockNotification: true,
      highlightsTitle: 'Engineered For Excellence',
      highlightsDescription: 'Platform Highlights',
      findUsMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1837926296316!2d-73.98542768459375!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c1054973%3A0x727e4e1671239855!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1652399238384!5m2!1sen!2sus'
    }
  });

  // 3. Create Tenant Default Roles (restaurant matrix — SUPER_ADMIN is global)
  console.log('Writing roles...');
  const rolesMap = new Map<string, any>();
  const tenantRoles = SYSTEM_ROLES.filter((name) => name !== 'SUPER_ADMIN');

  const globalSuperRole = await prisma.role.create({
    data: {
      tenantId: null,
      name: 'SUPER_ADMIN',
      isSystem: true,
    },
  });
  rolesMap.set('SUPER_ADMIN', globalSuperRole);

  for (const name of tenantRoles) {
    const roleRecord = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: name,
        isSystem: true
      }
    });
    rolesMap.set(name, roleRecord);
  }

  // 4. Bind Permissions to Roles (RolePermission mapping)
  console.log('Binding permissions to roles...');
  for (const [roleName, scopes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = rolesMap.get(roleName);
    if (!role) continue;
    const rows = scopes
      .map((scope) => permissionsMap.get(scope))
      .filter(Boolean)
      .map((permissionId) => ({
        roleId: role.id,
        permissionId: permissionId as string
      }));
    if (rows.length) {
      await prisma.rolePermission.createMany({ data: rows });
    }
  }

  // 5. Create Default Branch
  console.log('Writing default branch...');
  const branch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Tastyc Coffee House - Manhattan',
      address: '120 Broadway, New York, NY 10271',
      phone: '+12125550199',
      email: 'manhattan@tastyc.com'
    }
  });

  // 6. Create Seating Floors & Tables
  console.log('Writing floors & tables...');
  const floor1 = await prisma.floor.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Main Hall'
    }
  });

  const floor2 = await prisma.floor.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Outdoor Patio'
    }
  });

  const tablesData = [
    { floorId: floor1.id, number: 'T01', capacity: 2, qr: 'qr-t01' },
    { floorId: floor1.id, number: 'T02', capacity: 4, qr: 'qr-t02' },
    { floorId: floor1.id, number: 'T03', capacity: 4, qr: 'qr-t03' },
    { floorId: floor2.id, number: 'P01', capacity: 2, qr: 'qr-p01' },
    { floorId: floor2.id, number: 'P02', capacity: 4, qr: 'qr-p02' }
  ];

  for (const t of tablesData) {
    await prisma.table.create({
      data: {
        tenantId: tenant.id,
        floorId: t.floorId,
        number: t.number,
        seatingCapacity: t.capacity,
        qrToken: t.qr
      }
    });
  }

  // 7. Create Users for all 10 Role Types
  console.log('Writing users for all role types...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersToSeed = [
    {
      email: 'superadmin@restaurantops.com',
      name: 'Platform Super Admin',
      role: 'SUPER_ADMIN',
      bindBranch: false
    },
    {
      email: 'owner@tastyc.com',
      name: 'Elena Rostova (Owner)',
      role: 'OWNER',
      bindBranch: false
    },
    {
      email: 'areamanager@tastyc.com',
      name: 'Area Manager Priya',
      role: 'AREA_MANAGER',
      bindBranch: false
    },
    {
      email: 'manager@tastyc.com',
      name: 'Branch Manager Dave',
      role: 'BRANCH_MANAGER',
      bindBranch: true
    },
    {
      email: 'kitchenmanager@tastyc.com',
      name: 'Kitchen Manager Sarah',
      role: 'KITCHEN_MANAGER',
      bindBranch: true
    },
    {
      email: 'chef@tastyc.com',
      name: 'Head Chef Marcus',
      role: 'CHEF',
      bindBranch: true
    },
    {
      email: 'souschef@tastyc.com',
      name: 'Sous Chef Leon',
      role: 'SOUS_CHEF',
      bindBranch: true
    },
    {
      email: 'kitchenstaff@tastyc.com',
      name: 'Kitchen Prep Anna',
      role: 'KITCHEN_STAFF',
      bindBranch: true
    },
    {
      email: 'cashier@tastyc.com',
      name: 'Cashier Emma',
      role: 'CASHIER',
      bindBranch: true
    },
    {
      email: 'inventory@tastyc.com',
      name: 'Inventory Manager Carl',
      role: 'INVENTORY_MANAGER',
      bindBranch: true
    },
    {
      email: 'purchase@tastyc.com',
      name: 'Purchase Officer Peter',
      role: 'PURCHASE_MANAGER',
      bindBranch: true
    },
    {
      email: 'deliverymanager@tastyc.com',
      name: 'Logistics Manager Dan',
      role: 'DELIVERY_MANAGER',
      bindBranch: true
    },
    {
      email: 'delivery@tastyc.com',
      name: 'Delivery Driver Ryan',
      role: 'DELIVERY_STAFF',
      bindBranch: true
    },
    {
      email: 'hr@tastyc.com',
      name: 'HR Officer Helen',
      role: 'HR_MANAGER',
      bindBranch: true
    },
    {
      email: 'accountant@tastyc.com',
      name: 'Accountant Arthur',
      role: 'ACCOUNTANT',
      bindBranch: true
    },
    {
      email: 'marketing@tastyc.com',
      name: 'Marketing Exec Mary',
      role: 'MARKETING_MANAGER',
      bindBranch: true
    },
    {
      email: 'auditor@tastyc.com',
      name: 'Compliance Auditor Alan',
      role: 'SYSTEM_AUDITOR',
      bindBranch: true
    },
    {
      email: 'waiter@tastyc.com',
      name: 'Server Toby',
      role: 'WAITER',
      bindBranch: true
    },
    {
      email: 'customer@tastyc.com',
      name: 'Alice Johnson (Customer)',
      role: 'CUSTOMER',
      bindBranch: false
    }
  ];

  for (const u of usersToSeed) {
    const isGlobalSuperAdmin = u.role === 'SUPER_ADMIN';
    await prisma.user.create({
      data: {
        tenantId: isGlobalSuperAdmin ? null : tenant.id,
        email: u.email,
        passwordHash: hashedPassword,
        name: u.name,
        phone: '+15550002222',
        roleId: rolesMap.get(u.role).id,
        branchId: isGlobalSuperAdmin ? null : (u.bindBranch ? branch.id : null)
      }
    });
  }

  // 8. Create Raw Ingredients
  console.log('Writing ingredients...');
  const beans = await prisma.ingredient.create({
    data: {
      tenantId: tenant.id,
      name: 'Coffee Beans (Arabica)',
      unit: 'KG',
      stockLevel: 50.000,
      lowStockThreshold: 10.000
    }
  });

  const milk = await prisma.ingredient.create({
    data: {
      tenantId: tenant.id,
      name: 'Whole Milk',
      unit: 'LITER',
      stockLevel: 45.000,
      lowStockThreshold: 15.000
    }
  });

  const syrup = await prisma.ingredient.create({
    data: {
      tenantId: tenant.id,
      name: 'Caramel Syrup',
      unit: 'LITER',
      stockLevel: 12.000,
      lowStockThreshold: 4.000
    }
  });

  const chocolate = await prisma.ingredient.create({
    data: {
      tenantId: tenant.id,
      name: 'Chocolate Fudge Chips',
      unit: 'KG',
      stockLevel: 8.000,
      lowStockThreshold: 2.000
    }
  });

  // 9. Create Menu Categories & Items with Valid High-Res Images
  console.log('Writing menu categories and items with valid images...');
  
  const hotDrinks = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Hot Coffee' }
  });

  const coldDrinks = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Iced Coffee & Teas' }
  });

  const bakery = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Artisan Bakery' }
  });

  const mains = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Gourmet Mains' }
  });

  // Hot Coffee Items (6 items)
  const espresso = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Espresso Solo',
      description: 'Single origin rich, dark pulled espresso shot with hazelnut crema.',
      price: 2.50,
      imageUrl: 'https://images.unsplash.com/photo-1510707577719-0d7eed55042a?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const cappuccino = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Traditional Cappuccino',
      description: 'Double espresso pulled over steamed whole milk and deep velvety foam layers.',
      price: 3.90,
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const latte = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Caramel Latte',
      description: 'Velvety espresso combined with steamed milk and sweet, rich caramel syrup.',
      price: 4.50,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const flatWhite = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Classic Flat White',
      description: 'Smooth microfoam poured over a double shot of rich espresso blend.',
      price: 4.00,
      imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const americano = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Americano Classic',
      description: 'Double espresso shots diluted with clean hot water for a smooth body.',
      price: 3.00,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const mocha = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: hotDrinks.id,
      name: 'Mocha Delight',
      description: 'Rich dark chocolate syrup mixed with double espresso and velvety steamed milk.',
      price: 4.80,
      imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  // Iced Coffee & Teas (6 items)
  const coldBrew = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Cold Brew Velvet',
      description: '24-hour slow-steeped craft cold brew topped with heavy sweet cream vanilla pour.',
      price: 4.80,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const icedMacchiato = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Iced Caramel Macchiato',
      description: 'Espresso poured over milk, vanilla syrup, and ice, finished with caramel drizzle.',
      price: 4.95,
      imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const matchaLatte = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Matcha Green Tea Latte',
      description: 'Stone-ground Uji matcha whisked with milk over ice for an earthy refreshment.',
      price: 5.10,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const passionTea = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Iced Passionfruit Tea',
      description: 'Brewed herbal hibiscus and passionfruit tea shaken with ice and organic honey.',
      price: 4.20,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const nitroBrew = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Nitro Cold Brew',
      description: 'Slow-steeped cold brew infused with nitrogen for a velvety cascaded head.',
      price: 5.25,
      imageUrl: 'https://images.unsplash.com/photo-1568644392525-be9e1cd459de?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const chaiLatte = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: coldDrinks.id,
      name: 'Iced Chai Latte',
      description: 'Sweet, spiced black tea concentrate mixed with chilled milk and ice cubes.',
      price: 4.70,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  // Artisan Bakery (5 items)
  const croissant = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: bakery.id,
      name: 'Artisan Butter Croissant',
      description: 'Flaky, buttery French golden croissant baked fresh at sunrise.',
      price: 3.50,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const muffin = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: bakery.id,
      name: 'Chocolate Fudge Muffin',
      description: 'Decadent chocolate muffin loaded with rich molten fudge baking chips.',
      price: 3.80,
      imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const cinnamonRoll = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: bakery.id,
      name: 'Cinnamon Roll Supreme',
      description: 'Warm glazed roll loaded with sweet brown sugar cinnamon layers.',
      price: 4.10,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const scone = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: bakery.id,
      name: 'Blueberry Scone',
      description: 'Traditional English cream scone folded with plump organic blueberries.',
      price: 3.60,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const almondCroissant = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: bakery.id,
      name: 'Almond Croissant',
      description: 'Double baked butter croissant filled with marzipan cream and sliced almonds.',
      price: 4.25,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  // Gourmet Mains (4 items)
  const avoToast = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: mains.id,
      name: 'Avocado Toast Artisan',
      description: 'Sourdough toast topped with fresh mashed avocado, feta cheese, and cherry tomatoes.',
      price: 8.50,
      imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const salmonBagel = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: mains.id,
      name: 'Smoked Salmon Bagel',
      description: 'Toasted sesame bagel spread with dill cream cheese, capers, onions, and wild smoked salmon.',
      price: 11.20,
      imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const beefBurger = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: mains.id,
      name: 'Gourmet Beef Burger',
      description: 'Prime Angus beef patty, cheddar cheese, butter lettuce, and house sauce on toasted brioche.',
      price: 12.80,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  const frenchFries = await prisma.menuItem.create({
    data: {
      tenantId: tenant.id,
      categoryId: mains.id,
      name: 'Crispy French Fries',
      description: 'Hand-cut russet potatoes fried to golden perfection, tossed in sea salt and parsley.',
      price: 4.50,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
      isAvailable: true
    }
  });

  // 10. Write Modifiers
  console.log('Writing menu modifiers...');
  await prisma.menuModifier.createMany({
    data: [
      {
        tenantId: tenant.id,
        menuItemId: latte.id,
        name: 'Extra Shot Espresso',
        price: 0.80,
        isAvailable: true
      },
      {
        tenantId: tenant.id,
        menuItemId: coldBrew.id,
        name: 'Sweet Vanilla Cold Foam',
        price: 1.00,
        isAvailable: true
      }
    ]
  });

  // 11. Write Recipe BOMs
  console.log('Writing recipe mappings...');
  // Espresso: 18g coffee beans (0.018 kg)
  await prisma.recipe.create({
    data: { menuItemId: espresso.id, ingredientId: beans.id, quantity: 0.018 }
  });

  // Cappuccino: 18g coffee beans, 0.20 L milk
  await prisma.recipe.createMany({
    data: [
      { menuItemId: cappuccino.id, ingredientId: beans.id, quantity: 0.018 },
      { menuItemId: cappuccino.id, ingredientId: milk.id, quantity: 0.200 }
    ]
  });

  // Caramel Latte: 18g coffee beans, 0.25 L milk, 0.02 L caramel syrup
  await prisma.recipe.createMany({
    data: [
      { menuItemId: latte.id, ingredientId: beans.id, quantity: 0.018 },
      { menuItemId: latte.id, ingredientId: milk.id, quantity: 0.250 },
      { menuItemId: latte.id, ingredientId: syrup.id, quantity: 0.020 }
    ]
  });

  // Cold Brew: 30g coffee beans (0.030 kg)
  await prisma.recipe.create({
    data: { menuItemId: coldBrew.id, ingredientId: beans.id, quantity: 0.030 }
  });

  // Croissant: (No BOM decrement tracking for baked items, direct purchase logs)
  
  // Chocolate Muffin: 15g chocolate chips (0.015 kg)
  await prisma.recipe.create({
    data: { menuItemId: muffin.id, ingredientId: chocolate.id, quantity: 0.015 }
  });

  // 12. Create Supplier
  console.log('Writing suppliers...');
  const roasters = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'NYC Roasters & Co.',
      contactName: 'Dave Miller',
      phone: '+12129990188',
      email: 'dave@nycroasters.com'
    }
  });

  const dairy = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'Manhattan Fresh Dairy Farms',
      contactName: 'Sarah Jenkins',
      phone: '+15553334444',
      email: 'sarah@manhattandairy.com'
    }
  });

  await seedPlatformData(prisma);

  console.log('Seeding finished successfully! 🚀');
  console.log(`Default restaurant tenant id: ${tenant.id}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
