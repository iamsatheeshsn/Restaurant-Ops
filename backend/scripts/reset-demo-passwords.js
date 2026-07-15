const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash('password123', 10);
  const users = await p.user.findMany({
    where: {
      deletedAt: null,
      OR: [
        { email: { contains: 'spicehaven' } },
        { email: { contains: 'oceanbistro' } },
        { email: { contains: 'greenleaf' } },
        { email: 'areamanager@tastyc.com' },
      ],
    },
    include: { role: true, tenant: true },
  });
  console.log('Found', users.length, 'users');
  for (const u of users) {
    await p.user.update({ where: { id: u.id }, data: { passwordHash: hash } });
    console.log('reset', u.email, u.role?.name, u.tenant?.slug);
  }
  await p.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
