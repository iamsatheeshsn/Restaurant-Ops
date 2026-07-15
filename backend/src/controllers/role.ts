import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

function formatRoles(
  roles: Array<{
    id: string;
    name: string;
    isSystem: boolean;
    tenantId: string | null;
    permissions: Array<{ permission: { scope: string } }>;
    tenant?: { id: string; name: string } | null;
  }>
) {
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    isSystem: role.isSystem,
    tenantId: role.tenantId,
    tenantName: role.tenant?.name ?? null,
    permissions: role.permissions.map((rp) => rp.permission.scope),
  }));
}

async function resolveRoleTenantId(req: AuthRequest): Promise<string | null> {
  // Restaurant staff: always their JWT tenant
  if (req.user?.role !== 'SUPER_ADMIN' || req.user.tenantId) {
    return req.tenantId || req.user?.tenantId || null;
  }

  // Global Super Admin: optional ?tenantId= to manage a restaurant's roles
  const q = req.query.tenantId;
  if (typeof q === 'string' && q.trim()) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: q.trim(), deletedAt: null },
      select: { id: true },
    });
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }
    return tenant.id;
  }

  // Body tenantId (create role)
  const bodyTenant = req.body?.tenantId;
  if (typeof bodyTenant === 'string' && bodyTenant.trim()) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: bodyTenant.trim(), deletedAt: null },
      select: { id: true },
    });
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }
    return tenant.id;
  }

  return null; // platform / global roles only
}

// Get all roles with their assigned permissions
export const getRoles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let tenantId: string | null;
    try {
      tenantId = await resolveRoleTenantId(req);
    } catch (e) {
      return next(e);
    }

    // Without a tenant filter, Super Admin sees only the global SUPER_ADMIN role (no per-tenant dupes)
    const where =
      tenantId === null && req.user?.role === 'SUPER_ADMIN'
        ? { tenantId: null as string | null, deletedAt: null }
        : { tenantId: tenantId!, deletedAt: null };

    if (tenantId === null && req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Tenant context required', 400, 'TENANT_CONTEXT_MISSING'));
    }

    const roles = await prisma.role.findMany({
      where,
      include: {
        permissions: { include: { permission: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      data: formatRoles(roles),
    });
  } catch (error) {
    next(error);
  }
};

// Get all available system permissions
export const getPermissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { scope: 'asc' },
    });

    // Deduplicate by scope in case of legacy seed duplicates
    const seen = new Set<string>();
    const unique = permissions.filter((p) => {
      if (seen.has(p.scope)) return false;
      seen.add(p.scope);
      return true;
    });

    return res.json({
      success: true,
      data: unique,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new role with permissions mapping
export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, permissions } = req.body; // permissions = Array of scopes (string)

  if (!name) {
    return next(new AppError('Role name is required', 400, 'INVALID_INPUT_BODY'));
  }

  try {
    let tenantId: string | null;
    try {
      tenantId = await resolveRoleTenantId(req);
    } catch (e) {
      return next(e);
    }

    if (!tenantId) {
      return next(
        new AppError(
          'Select a restaurant tenant before creating a role',
          400,
          'TENANT_CONTEXT_MISSING'
        )
      );
    }

    const existing = await prisma.role.findFirst({
      where: { tenantId, name: name.toUpperCase(), deletedAt: null },
    });

    if (existing) {
      return next(new AppError('Role with this name already exists', 400, 'ROLE_ALREADY_EXISTS'));
    }

    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          tenantId,
          name: name.toUpperCase(),
          isSystem: false,
        },
      });

      if (permissions && permissions.length > 0) {
        const dbPerms = await tx.permission.findMany({
          where: { scope: { in: permissions } },
        });

        await tx.rolePermission.createMany({
          data: dbPerms.map((p) => ({
            roleId: role.id,
            permissionId: p.id,
          })),
        });
      }

      return role;
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing role's permissions
export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role || role.deletedAt) {
      return next(new AppError('Role not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Non–super-admin may only edit roles in their tenant
    if (req.user?.role !== 'SUPER_ADMIN' || req.user.tenantId) {
      const activeTenant = req.tenantId || req.user?.tenantId;
      if (role.tenantId !== activeTenant) {
        return next(new AppError('Role not found', 404, 'RESOURCE_NOT_FOUND'));
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedName = role.name;
      if (name && !role.isSystem) {
        updatedName = name.toUpperCase();
        await tx.role.update({
          where: { id },
          data: { name: updatedName },
        });
      }

      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      if (permissions && permissions.length > 0) {
        const dbPerms = await tx.permission.findMany({
          where: { scope: { in: permissions } },
        });

        await tx.rolePermission.createMany({
          data: dbPerms.map((p) => ({
            roleId: id,
            permissionId: p.id,
          })),
        });
      }

      return { id, name: updatedName, isSystem: role.isSystem };
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a custom role
export const deleteRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role || role.deletedAt) {
      return next(new AppError('Role not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    if (req.user?.role !== 'SUPER_ADMIN' || req.user.tenantId) {
      const activeTenant = req.tenantId || req.user?.tenantId;
      if (role.tenantId !== activeTenant) {
        return next(new AppError('Role not found', 404, 'RESOURCE_NOT_FOUND'));
      }
    }

    if (role.name === 'OWNER' || role.name === 'SUPER_ADMIN') {
      return next(
        new AppError(
          'This system role cannot be deleted.',
          403,
          'ACTION_FORBIDDEN'
        )
      );
    }

    if (role.isSystem) {
      return next(new AppError('System roles cannot be deleted.', 403, 'ACTION_FORBIDDEN'));
    }

    const usersBound = await prisma.user.count({
      where: { roleId: id },
    });

    if (usersBound > 0) {
      return next(
        new AppError('Cannot delete role. Active users are currently assigned to it.', 400, 'ROLE_IN_USE')
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });
      await tx.role.delete({
        where: { id },
      });
    });

    return res.json({
      success: true,
      data: { message: 'Role deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
