/**
 * Backfill Tenant.slug for existing restaurants.
 * Usage: npx ts-node prisma/backfill-slugs.ts
 */
import { PrismaClient } from '@prisma/client';
import { uniqueTenantSlug } from '../src/utils/slug';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    where: { OR: [{ slug: null }, { slug: '' }] },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Backfilling slugs for ${tenants.length} tenant(s)...`);

  for (const t of tenants) {
    const slug = await uniqueTenantSlug(t.name, async (s) => {
      const hit = await prisma.tenant.findFirst({ where: { slug: s } });
      return !!hit;
    });
    await prisma.tenant.update({ where: { id: t.id }, data: { slug } });
    console.log(`  ${t.name} → /r/${slug}`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
