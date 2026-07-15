/**
 * Seed operational demo data for every active restaurant tenant so admin
 * screens (Orders, Cash Drawer, CRM, Delivery, Expenses, etc.) are not empty.
 *
 * Idempotent: skips a tenant that already has orders.
 * Usage: npm run prisma:seed-ops
 */
import {
  PrismaClient,
  OrderType,
  OrderStatus,
  ExpenseStatus,
  LeaveStatus,
  DeliveryJobStatus,
  CampaignStatus,
  TransferStatus,
  ApprovalType,
  ApprovalStatus,
  ReservationStatus,
  MovementType,
} from '@prisma/client';

const prisma = new PrismaClient();

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysFromNow(d: number) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

async function seedTenantOps(tenantId: string, tenantName: string) {
  const orderCount = await prisma.order.count({ where: { tenantId } });
  if (orderCount > 0) {
    console.log(`  · ${tenantName}: already has ${orderCount} order(s) — skip`);
    return;
  }

  const branch = await prisma.branch.findFirst({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  if (!branch) {
    console.log(`  ! ${tenantName}: no branch — skip`);
    return;
  }

  const branches = await prisma.branch.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });

  const table = await prisma.table.findFirst({
    where: { tenantId },
    orderBy: { number: 'asc' },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { tenantId, isAvailable: true, deletedAt: null },
    take: 8,
    orderBy: { name: 'asc' },
  });
  if (menuItems.length === 0) {
    console.log(`  ! ${tenantName}: no menu items — skip`);
    return;
  }

  const staff = await prisma.user.findMany({
    where: {
      tenantId,
      deletedAt: null,
      role: { name: { notIn: ['CUSTOMER', 'SUPER_ADMIN'] } },
    },
    include: { role: true },
    take: 20,
  });
  const owner = staff.find((u) => u.role.name === 'OWNER') || staff[0];
  const cashier = staff.find((u) => u.role.name === 'CASHIER') || owner;
  const chef = staff.find((u) => u.role.name === 'CHEF' || u.role.name === 'KITCHEN_MANAGER') || owner;
  const deliveryStaff = staff.find((u) => u.role.name === 'DELIVERY_STAFF' || u.role.name === 'DELIVERY_MANAGER') || owner;
  const waiter = staff.find((u) => u.role.name === 'WAITER') || owner;

  const ingredients = await prisma.ingredient.findMany({
    where: { tenantId, deletedAt: null },
    take: 5,
  });

  const pickItems = (n: number) => {
    const chosen = menuItems.slice(0, Math.min(n, menuItems.length));
    return chosen.map((m, idx) => ({
      menuItemId: m.id,
      quantity: 1 + (idx % 2),
      unitPrice: m.price,
    }));
  };

  const buildTotals = (items: ReturnType<typeof pickItems>) => {
    const subtotal = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    return { subtotal, tax, discount: 0, totalAmount: Math.round((subtotal + tax) * 100) / 100 };
  };

  const orderSpecs: Array<{
    suffix: string;
    type: OrderType;
    status: OrderStatus;
    hoursAgo: number;
    withTable?: boolean;
  }> = [
    { suffix: '1001', type: OrderType.DINE_IN, status: OrderStatus.PENDING, hoursAgo: 0.3, withTable: true },
    { suffix: '1002', type: OrderType.DINE_IN, status: OrderStatus.PREPARING, hoursAgo: 0.6, withTable: true },
    { suffix: '1003', type: OrderType.TAKE_AWAY, status: OrderStatus.READY, hoursAgo: 1 },
    { suffix: '1004', type: OrderType.DINE_IN, status: OrderStatus.SERVED, hoursAgo: 2, withTable: true },
    { suffix: '1005', type: OrderType.ONLINE, status: OrderStatus.COMPLETED, hoursAgo: 3 },
    { suffix: '1006', type: OrderType.DELIVERY, status: OrderStatus.COMPLETED, hoursAgo: 4 },
    { suffix: '1007', type: OrderType.DINE_IN, status: OrderStatus.COMPLETED, hoursAgo: 5, withTable: true },
    { suffix: '1008', type: OrderType.TAKE_AWAY, status: OrderStatus.PREPARING, hoursAgo: 0.2 },
    { suffix: '1009', type: OrderType.ONLINE, status: OrderStatus.PENDING, hoursAgo: 0.1 },
    { suffix: '1010', type: OrderType.DELIVERY, status: OrderStatus.READY, hoursAgo: 0.8 },
  ];

  const createdOrders: { id: string; status: OrderStatus; type: OrderType; total: number }[] = [];

  for (const spec of orderSpecs) {
    const items = pickItems(2 + (Number(spec.suffix) % 3));
    const totals = buildTotals(items);
    const createdAt = hoursAgo(spec.hoursAgo);
    const order = await prisma.order.create({
      data: {
        tenantId,
        branchId: branch.id,
        orderNumber: `ORD-${spec.suffix}`,
        type: spec.type,
        status: spec.status,
        tableId: spec.withTable && table ? table.id : null,
        customerId: null,
        ...totals,
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
      },
    });
    createdOrders.push({ id: order.id, status: order.status, type: order.type, total: Number(order.totalAmount) });
  }

  // Delivery jobs for delivery-type orders
  const deliveryOrders = createdOrders.filter((o) => o.type === OrderType.DELIVERY);
  for (const [idx, o] of deliveryOrders.entries()) {
    await prisma.deliveryJob.create({
      data: {
        tenantId,
        orderId: o.id,
        branchId: branch.id,
        assigneeId: deliveryStaff?.id,
        status: idx === 0 ? DeliveryJobStatus.EN_ROUTE : DeliveryJobStatus.ASSIGNED,
        address: `${120 + idx} Demo Street, Local District`,
        codAmount: o.total,
        customerName: idx === 0 ? 'Alex Rivera' : 'Jordan Lee',
      },
    });
  }

  // CRM
  await prisma.reservation.createMany({
    data: [
      {
        tenantId,
        customerName: 'Priya Sharma',
        customerEmail: 'priya@example.com',
        customerPhone: '+15550101',
        partySize: 4,
        reservationTime: daysFromNow(1),
        status: ReservationStatus.CONFIRMED,
        tableId: table?.id,
        notes: 'Window seat preferred',
      },
      {
        tenantId,
        customerName: 'Marcus Chen',
        customerEmail: 'marcus@example.com',
        customerPhone: '+15550102',
        partySize: 2,
        reservationTime: daysFromNow(2),
        status: ReservationStatus.PENDING,
        notes: 'Anniversary',
      },
    ],
  });

  await prisma.waitingList.createMany({
    data: [
      {
        tenantId,
        customerName: 'Sam Patel',
        customerPhone: '+15550103',
        partySize: 3,
        status: 'WAITING',
      },
      {
        tenantId,
        customerName: 'Riley Gomez',
        customerPhone: '+15550104',
        partySize: 2,
        status: 'WAITING',
      },
    ],
  });

  const couponCode = `SAVE10-${tenantId.slice(0, 4).toUpperCase()}`;
  const giftCode = `GIFT-${tenantId.slice(0, 6).toUpperCase()}`;
  const existingCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!existingCoupon) {
    await prisma.coupon.create({
      data: {
        tenantId,
        code: couponCode,
        discountType: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 25,
        expiryDate: daysFromNow(60),
        isActive: true,
      },
    });
  }
  const existingGift = await prisma.giftCard.findUnique({ where: { code: giftCode } });
  if (!existingGift) {
    await prisma.giftCard.create({
      data: {
        tenantId,
        code: giftCode,
        balance: 50,
        expiryDate: daysFromNow(180),
        isActive: true,
      },
    });
  }

  // Expenses
  if (owner) {
    await prisma.expense.createMany({
      data: [
        {
          tenantId,
          branchId: branch.id,
          amount: 245.5,
          category: 'Utilities',
          description: 'Monthly kitchen utilities',
          status: ExpenseStatus.APPROVED,
          createdById: owner.id,
          approvedById: owner.id,
        },
        {
          tenantId,
          branchId: branch.id,
          amount: 89.0,
          category: 'Supplies',
          description: 'To-go packaging restock',
          status: ExpenseStatus.PENDING,
          createdById: cashier?.id || owner.id,
        },
        {
          tenantId,
          branchId: branch.id,
          amount: 320.0,
          category: 'Maintenance',
          description: 'Espresso machine service',
          status: ExpenseStatus.PENDING,
          createdById: owner.id,
        },
      ],
    });
  }

  // Marketing
  await prisma.marketingCampaign.createMany({
    data: [
      {
        tenantId,
        name: 'Weekend Brunch Push',
        channel: 'EMAIL',
        status: CampaignStatus.SCHEDULED,
        audience: 'Loyalty members',
        content: 'Join us for weekend brunch — 15% off with code BRUNCH15.',
        scheduledAt: daysFromNow(3),
      },
      {
        tenantId,
        name: 'Happy Hour SMS',
        channel: 'SMS',
        status: CampaignStatus.DRAFT,
        audience: 'Local guests',
        content: 'Happy Hour 4–6pm: 2-for-1 selected drinks.',
      },
    ],
  });

  // Schedules + leave
  const scheduleUsers = staff.slice(0, 4);
  for (let i = 0; i < scheduleUsers.length; i++) {
    await prisma.staffSchedule.create({
      data: {
        tenantId,
        branchId: branch.id,
        userId: scheduleUsers[i].id,
        shiftDate: daysFromNow(i),
        startTime: i % 2 === 0 ? '09:00' : '14:00',
        endTime: i % 2 === 0 ? '17:00' : '22:00',
        note: 'Seeded demo shift',
      },
    });
  }

  if (waiter) {
    await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId: waiter.id,
        startDate: daysFromNow(7),
        endDate: daysFromNow(8),
        leaveType: 'ANNUAL',
        status: LeaveStatus.PENDING,
        reason: 'Family event',
      },
    });
  }
  if (chef) {
    await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId: chef.id,
        startDate: daysFromNow(-2),
        endDate: daysFromNow(-1),
        leaveType: 'SICK',
        status: LeaveStatus.APPROVED,
        reason: 'Recovered — seeded sample',
      },
    });
  }

  // Attendance samples
  for (const u of staff.slice(0, 3)) {
    await prisma.staffAttendance.create({
      data: {
        tenantId,
        userId: u.id,
        clockIn: hoursAgo(5),
        clockOut: hoursAgo(1),
      },
    });
  }

  // Waste
  if (ingredients[0] && chef) {
    await prisma.wasteLog.create({
      data: {
        tenantId,
        branchId: branch.id,
        ingredientId: ingredients[0].id,
        quantity: 1.5,
        cost: 12.5,
        reason: 'Prep trim / spoilage demo',
        employeeId: chef.id,
      },
    });
  }

  // Stock transfer (needs 2 branches)
  if (branches.length >= 2 && ingredients[0] && owner) {
    await prisma.stockTransferRequest.create({
      data: {
        tenantId,
        fromBranchId: branches[0].id,
        toBranchId: branches[1].id,
        ingredientId: ingredients[0].id,
        quantity: 5,
        status: TransferStatus.REQUESTED,
        requestedById: owner.id,
      },
    });
  } else if (ingredients[0] && owner) {
    // Single-branch tenants: still create a transfer request to same branch pair if second missing — skip
  }

  // Approvals
  if (owner) {
    await prisma.approvalRequest.createMany({
      data: [
        {
          tenantId,
          type: ApprovalType.EXPENSE,
          refId: 'seed-expense',
          title: 'Approve packaging supplies expense',
          status: ApprovalStatus.PENDING,
          requestedById: cashier?.id || owner.id,
        },
        {
          tenantId,
          type: ApprovalType.INVENTORY,
          refId: 'seed-inventory',
          title: 'Approve stock adjustment — coffee beans',
          status: ApprovalStatus.PENDING,
          requestedById: owner.id,
        },
      ],
    });
  }

  // Catering / production
  await prisma.eventBooking.create({
    data: {
      tenantId,
      branchId: branch.id,
      title: 'Corporate Lunch Buffet',
      customerName: 'Northwind Corp',
      customerPhone: '+15550999',
      guestCount: 40,
      eventDate: daysFromNow(10),
      cateringDetails: 'Vegetarian + non-veg trays, soft drinks',
      totalCost: 1250,
      status: 'CONFIRMED',
    },
  });

  await prisma.productionBatch.create({
    data: {
      tenantId,
      branchId: branch.id,
      recipeId: menuItems[0].id,
      name: `${menuItems[0].name} — prep batch`,
      batchQty: 20,
      status: 'IN_PROGRESS',
    },
  });

  // Stock movement sample
  if (ingredients[0] && owner) {
    await prisma.stockMovement.create({
      data: {
        tenantId,
        branchId: branch.id,
        ingredientId: ingredients[0].id,
        quantity: 10,
        type: MovementType.STOCK_IN,
        reason: 'Seeded receiving demo',
        createdById: owner.id,
      },
    });
  }

  // Activity log samples
  if (owner) {
    await prisma.activityLog.createMany({
      data: [
        {
          tenantId,
          userId: owner.id,
          action: 'SEED_OPS',
          details: 'Operational demo data seeded (orders, CRM, expenses)',
        },
        {
          tenantId,
          userId: cashier?.id || owner.id,
          action: 'ORDER_COMPLETED',
          details: `Completed sample order ${createdOrders.find((o) => o.status === OrderStatus.COMPLETED)?.id || ''}`,
        },
      ],
    });
  }

  console.log(
    `  ✓ ${tenantName}: ${createdOrders.length} orders, CRM, delivery, expenses, schedules, catering`
  );
}

async function main() {
  console.log('Seeding operational demo data for all tenants...');
  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  for (const t of tenants) {
    await seedTenantOps(t.id, t.name);
  }

  console.log('Ops seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
