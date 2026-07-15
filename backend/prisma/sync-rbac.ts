/**
 * Sync RBAC permissions + system role bindings to an existing tenant DB
 * without wiping operational data.
 *
 * SUPER_ADMIN is global (tenantId null). Restaurant roles stay per-tenant.
 *
 * Usage: npx ts-node prisma/sync-rbac.ts
 *    or: npm run prisma:sync-rbac
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PERMISSIONS, ROLE_PERMISSIONS, SYSTEM_ROLES } from '../src/config/rbac';
import { redisClient } from '../src/config/redis';
import { seedPlatformData } from './seed-platform';

const prisma = new PrismaClient();

const TENANT_ROLES = SYSTEM_ROLES.filter((name) => name !== 'SUPER_ADMIN');

async function ensureRolePermissions(
  roleId: string,
  roleName: string,
  permissionsMap: Map<string, string>
) {
  await prisma.rolePermission.deleteMany({ where: { roleId } });
  const scopes = ROLE_PERMISSIONS[roleName] || [];
  const rows = scopes
    .map((scope) => permissionsMap.get(scope))
    .filter(Boolean)
    .map((permissionId) => ({ roleId, permissionId: permissionId! }));
  if (rows.length) {
    await prisma.rolePermission.createMany({ data: rows });
  }
}

async function main() {
  console.log('Syncing SaaS RBAC catalog...');

  const permissionsMap = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { scope: perm.scope },
      update: { description: perm.description },
      create: { scope: perm.scope, description: perm.description },
    });
    permissionsMap.set(perm.scope, record.id);
  }
  console.log(`Permissions upserted: ${permissionsMap.size}`);

  // Global SUPER_ADMIN role (no restaurant tenant)
  let globalSuperRole = await prisma.role.findFirst({
    where: { name: 'SUPER_ADMIN', tenantId: null, deletedAt: null },
  });
  if (!globalSuperRole) {
    globalSuperRole = await prisma.role.create({
      data: { name: 'SUPER_ADMIN', tenantId: null, isSystem: true },
    });
    console.log('+ created global SUPER_ADMIN role');
  } else if (!globalSuperRole.isSystem) {
    globalSuperRole = await prisma.role.update({
      where: { id: globalSuperRole.id },
      data: { isSystem: true },
    });
  }
  await ensureRolePermissions(globalSuperRole.id, 'SUPER_ADMIN', permissionsMap);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Migrate any tenant-scoped superadmin users → global
  const legacySuperAdmins = await prisma.user.findMany({
    where: {
      deletedAt: null,
      OR: [
        { email: 'superadmin@restaurantops.com' },
        { email: 'superadmin@tastyc.platform' },
        { email: 'superadmin@tastyc.com' },
      ],
    },
    include: { role: true },
  });

  for (const user of legacySuperAdmins) {
    const needsMigrate =
      user.tenantId !== null ||
      user.roleId !== globalSuperRole.id ||
      user.email !== 'superadmin@restaurantops.com';
    if (needsMigrate) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: 'superadmin@restaurantops.com',
          tenantId: null,
          roleId: globalSuperRole.id,
          branchId: null,
          name: 'Platform Super Admin',
        },
      });
      console.log(`~ migrated ${user.email} → superadmin@restaurantops.com (global SUPER_ADMIN)`);
    }
  }

  const existingGlobal = await prisma.user.findFirst({
    where: { email: 'superadmin@restaurantops.com', deletedAt: null },
  });
  if (!existingGlobal) {
    await prisma.user.create({
      data: {
        email: 'superadmin@restaurantops.com',
        name: 'Platform Super Admin',
        passwordHash: hashedPassword,
        tenantId: null,
        roleId: globalSuperRole.id,
        branchId: null,
      },
    });
    console.log('+ created global superadmin@restaurantops.com');
  }

  // Soft-delete leftover tenant-scoped SUPER_ADMIN roles (users already remapped)
  const orphanRoles = await prisma.role.findMany({
    where: { name: 'SUPER_ADMIN', tenantId: { not: null }, deletedAt: null },
  });
  for (const role of orphanRoles) {
    await prisma.role.update({
      where: { id: role.id },
      data: { deletedAt: new Date() },
    });
    console.log(`~ retired tenant SUPER_ADMIN role ${role.id}`);
  }

  const tenants = await prisma.tenant.findMany({ where: { deletedAt: null } });
  if (tenants.length === 0) {
    throw new Error('No tenants found. Run prisma:seed first.');
  }

  for (const tenant of tenants) {
    console.log(`\nTenant: ${tenant.name} (${tenant.id})`);

    const rolesMap = new Map<string, string>();
    for (const name of TENANT_ROLES) {
      let role = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name, deletedAt: null },
      });
      if (!role) {
        role = await prisma.role.create({
          data: { tenantId: tenant.id, name, isSystem: true },
        });
        console.log(`  + created role ${name}`);
      } else if (!role.isSystem) {
        role = await prisma.role.update({
          where: { id: role.id },
          data: { isSystem: true },
        });
      }
      rolesMap.set(name, role.id);
      await ensureRolePermissions(role.id, name, permissionsMap);
    }
    console.log(`  Role bindings refreshed for ${rolesMap.size} tenant roles`);

    const areaManagerEmail = 'areamanager@tastyc.com';
    const existingArea = await prisma.user.findFirst({
      where: { email: areaManagerEmail, tenantId: tenant.id, deletedAt: null },
    });
    if (!existingArea) {
      await prisma.user.create({
        data: {
          email: areaManagerEmail,
          name: 'Area Manager Priya',
          passwordHash: hashedPassword,
          tenantId: tenant.id,
          roleId: rolesMap.get('AREA_MANAGER')!,
          branchId: null,
        },
      });
      console.log(`  + created user ${areaManagerEmail}`);
    }

    try {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [{ tenantId: tenant.id }, { tenantId: null, role: { name: 'SUPER_ADMIN' } }],
        },
        select: { id: true },
      });
      for (const user of users) {
        if (typeof (redisClient as any).del === 'function') {
          await (redisClient as any).del(`user:permissions:${user.id}`);
        } else if (typeof (redisClient as any).delete === 'function') {
          await (redisClient as any).delete(`user:permissions:${user.id}`);
        }
      }
    } catch {
      /* ignore cache bust failures */
    }
  }

  await seedPlatformData(prisma);

  console.log('\nRBAC sync complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
