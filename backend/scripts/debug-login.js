const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

(async () => {
  const email = 'owner@spicehaven.com';
  const users = await p.user.findMany({
    where: { email },
    include: { role: true, tenant: true },
  });
  console.log('count', users.length);
  for (const u of users) {
    const ok = await bcrypt.compare('password123', u.passwordHash || '');
    console.log({
      id: u.id,
      deletedAt: u.deletedAt,
      role: u.role?.name,
      tenant: u.tenant?.slug,
      hashLen: (u.passwordHash || '').length,
      hashPrefix: (u.passwordHash || '').slice(0, 10),
      pwdOk: ok,
    });
  }

  // Also try direct login logic
  const user = await p.user.findFirst({
    where: {
      email,
      deletedAt: null,
      tenantId: { not: null },
      role: { name: { not: 'CUSTOMER' } },
    },
    include: { role: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('login resolve', user ? { id: user.id, role: user.role.name } : null);
  if (user) {
    console.log('match', await bcrypt.compare('password123', user.passwordHash));
  }
  await p.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
