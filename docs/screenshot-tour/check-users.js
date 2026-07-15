const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

(async () => {
  const emails = [
    'areamanager@tastyc.com',
    'owner@spicehaven.com',
    'manager@spicehaven.com',
    'chef@spicehaven.com',
    'owner@oceanbistro.com',
    'owner@greenleafcafe.co.uk',
    'customer@spicehaven.com',
  ];
  for (const email of emails) {
    const u = await p.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true, tenant: true },
    });
    if (!u) {
      console.log(email, 'MISSING');
      continue;
    }
    const ok = await bcrypt.compare('password123', u.passwordHash);
    console.log(JSON.stringify({
      email,
      role: u.role?.name,
      tenant: u.tenant?.slug || u.tenantId,
      isActive: u.isActive,
      pwdOk: ok,
    }));
  }
  await p.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
