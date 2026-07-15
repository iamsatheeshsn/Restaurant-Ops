import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding additional master data...');

  // 1. Fetch Tenant & Branch
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('No tenant found. Run base seed first.');
    return;
  }

  const branch = await prisma.branch.findFirst({ where: { tenantId: tenant.id } });
  if (!branch) {
    console.error('No branch found. Run base seed first.');
    return;
  }

  // 2. Add New Floor: "Rooftop Terrace"
  let rooftopFloor = await prisma.floor.findFirst({
    where: { tenantId: tenant.id, name: 'Rooftop Terrace' }
  });

  if (!rooftopFloor) {
    rooftopFloor = await prisma.floor.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'Rooftop Terrace'
      }
    });
    console.log(`Created floor: ${rooftopFloor.name}`);
  } else {
    console.log('Floor "Rooftop Terrace" already exists.');
  }

  // 3. Add New Tables on Rooftop Terrace
  const tableData = [
    { number: 'T-10', capacity: 4 },
    { number: 'T-11', capacity: 6 }
  ];

  for (const t of tableData) {
    const existing = await prisma.table.findFirst({
      where: { tenantId: tenant.id, number: t.number }
    });
    if (!existing) {
      const tbl = await prisma.table.create({
        data: {
          tenantId: tenant.id,
          floorId: rooftopFloor.id,
          number: t.number,
          seatingCapacity: t.capacity,
          qrToken: `table-${Date.now()}-${t.number.toLowerCase()}`
        }
      });
      console.log(`Created Table: ${tbl.number} (${tbl.seatingCapacity} seats)`);
    } else {
      console.log(`Table ${t.number} already exists.`);
    }
  }

  // 4. Add New Kitchen Section: "Bakery & Coffee Bar"
  const existingSection = await prisma.kitchenSection.findFirst({
    where: { branchId: branch.id, name: 'Bakery & Coffee Bar' }
  });

  if (!existingSection) {
    const sec = await prisma.kitchenSection.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'Bakery & Coffee Bar'
      }
    });
    console.log(`Created Kitchen Section: ${sec.name}`);
  } else {
    console.log('Kitchen Section "Bakery & Coffee Bar" already exists.');
  }

  // 5. Add New Cashier Employee: "Cashier John"
  const cashierRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: 'CASHIER' }
  });

  if (cashierRole) {
    const existingCashier = await prisma.user.findFirst({
      where: { email: 'john@tastyc.com', tenantId: tenant.id }
    });

    if (!existingCashier) {
      const hash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'john@tastyc.com',
          name: 'Cashier John',
          passwordHash: hash,
          phone: '+1 (555) 987-6543',
          roleId: cashierRole.id,
          branchId: branch.id
        }
      });
      console.log(`Created Employee: ${user.name} (${user.email})`);
    } else {
      console.log('Employee "john@tastyc.com" already exists.');
    }
  }

  console.log('Additional master data seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
