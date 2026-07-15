/**
 * Canonical permission catalog + role → scope matrix for the SaaS RBAC model.
 * Used by seed and sync-rbac scripts. Keep in sync with frontend/src/config/rbac.ts roles.
 */

export const PERMISSIONS = [
  // Platform (Super Admin)
  { scope: 'platform:tenants', description: 'Create, suspend, or delete restaurant tenants' },
  { scope: 'platform:billing', description: 'Manage subscription plans, billing, and invoices' },
  { scope: 'platform:features', description: 'Manage feature access by subscription plan' },
  { scope: 'platform:analytics', description: 'View platform-wide analytics and system health' },
  { scope: 'platform:support', description: 'Manage support tickets and support-mode access' },
  { scope: 'platform:integrations', description: 'Configure email, SMS, WhatsApp, and payment gateways' },
  { scope: 'platform:api_keys', description: 'Manage platform API keys' },
  { scope: 'platform:tax', description: 'Manage global tax settings' },
  { scope: 'platform:audit', description: 'View platform audit logs and backup policies' },
  { scope: 'platform:announcements', description: 'Manage system announcements' },

  // Organization / branch
  { scope: 'branch:manage', description: 'Create and update restaurant branches' },
  { scope: 'tables:manage', description: 'Manage floors, tables, and seating layout' },
  { scope: 'staff:manage', description: 'Manage employees, roles assignment, and onboarding' },
  { scope: 'settings:write', description: 'Configure restaurant profile, hours, branding, and taxes' },

  // Menu & kitchen
  { scope: 'menu:read', description: 'View menu catalogs and recipes' },
  { scope: 'menu:write', description: 'Create/update menu items, categories, and recipes' },
  { scope: 'menu:pricing', description: 'Configure menu pricing, discounts, and happy hours' },
  { scope: 'orders:kds', description: 'View and update kitchen display / order status' },
  { scope: 'orders:checkout', description: 'Take orders, billing, payments, and refunds' },
  { scope: 'catering:manage', description: 'Manage catering events and production batches' },

  // Inventory & procurement
  { scope: 'inventory:write', description: 'Manage inventory items, batches, and transfers' },
  { scope: 'inventory:adjust', description: 'Perform stock adjustments and physical counts' },
  { scope: 'inventory:approve', description: 'Approve inventory adjustments' },
  { scope: 'po:manage', description: 'Create purchase orders and coordinate suppliers' },
  { scope: 'po:approve', description: 'Approve purchases and deliveries' },
  { scope: 'waste:write', description: 'Log food and ingredient waste' },
  { scope: 'waste:approve', description: 'Approve waste entries' },

  // CRM / marketing / delivery
  { scope: 'crm:manage', description: 'Manage reservations, waitlist, and customer issues' },
  { scope: 'loyalty:manage', description: 'Manage loyalty, coupons, gift cards, and campaigns' },
  { scope: 'delivery:manage', description: 'Assign deliveries, routing, and delivery performance' },

  // People & finance
  { scope: 'attendance:read', description: 'View attendance, leave, and staffing levels' },
  { scope: 'attendance:clock', description: 'Clock in and out of shifts' },
  { scope: 'reports:read', description: 'View operational and sales analytics' },
  { scope: 'finance:read', description: 'View financial reports, P&L, and VAT' },
  { scope: 'finance:write', description: 'Manage expenses, invoices, and reconciliations' },
  { scope: 'expenses:approve', description: 'Approve expenses within policy limits' },
  { scope: 'audit:read', description: 'View audit logs and compliance exports (read-only)' },
] as const;

export type PermissionScope = (typeof PERMISSIONS)[number]['scope'];

export const SYSTEM_ROLES = [
  'SUPER_ADMIN',
  'OWNER',
  'AREA_MANAGER',
  'BRANCH_MANAGER',
  'KITCHEN_MANAGER',
  'CHEF',
  'SOUS_CHEF',
  'KITCHEN_STAFF',
  'WAITER',
  'CASHIER',
  'INVENTORY_MANAGER',
  'PURCHASE_MANAGER',
  'DELIVERY_MANAGER',
  'DELIVERY_STAFF',
  'HR_MANAGER',
  'ACCOUNTANT',
  'MARKETING_MANAGER',
  'SYSTEM_AUDITOR',
  'CUSTOMER',
] as const;

/** Full scope lists per role (supplier uses portal JWT, not RolePermission). */
export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  SUPER_ADMIN: [
    ...PERMISSIONS.map((p) => p.scope).filter((s) => s.startsWith('platform:')),
    'settings:write',
    'staff:manage',
    'branch:manage',
    'reports:read',
    'audit:read',
  ],

  OWNER: PERMISSIONS.map((p) => p.scope).filter((s) => !s.startsWith('platform:')),

  AREA_MANAGER: [
    'branch:manage',
    'reports:read',
    'finance:read',
    'po:manage',
    'po:approve',
    'attendance:read',
    'inventory:write',
    'crm:manage',
    'orders:kds',
    'menu:read',
    'waste:write',
    'waste:approve',
    'catering:manage',
    'attendance:clock',
  ],

  BRANCH_MANAGER: [
    'branch:manage',
    'tables:manage',
    'staff:manage',
    'menu:read',
    'menu:write',
    'menu:pricing',
    'inventory:write',
    'inventory:adjust',
    'po:manage',
    'orders:kds',
    'orders:checkout',
    'waste:write',
    'waste:approve',
    'attendance:read',
    'attendance:clock',
    'reports:read',
    'crm:manage',
    'catering:manage',
    'expenses:approve',
    'finance:read',
  ],

  KITCHEN_MANAGER: [
    'menu:read',
    'menu:write',
    'orders:kds',
    'waste:write',
    'waste:approve',
    'inventory:write',
    'inventory:adjust',
    'po:manage',
    'catering:manage',
    'attendance:clock',
    'reports:read',
  ],

  CHEF: [
    'menu:read',
    'orders:kds',
    'waste:write',
    'inventory:adjust',
    'attendance:clock',
  ],

  SOUS_CHEF: [
    'menu:read',
    'orders:kds',
    'waste:write',
    'attendance:clock',
  ],

  KITCHEN_STAFF: [
    'menu:read',
    'orders:kds',
    'attendance:clock',
  ],

  WAITER: [
    'menu:read',
    'orders:checkout',
    'orders:kds',
    'crm:manage',
    'tables:manage',
    'attendance:clock',
  ],

  CASHIER: [
    'menu:read',
    'orders:checkout',
    'orders:kds',
    'loyalty:manage',
    'crm:manage',
    'attendance:clock',
  ],

  INVENTORY_MANAGER: [
    'menu:read',
    'inventory:write',
    'inventory:adjust',
    'inventory:approve',
    'po:manage',
    'waste:write',
    'reports:read',
    'attendance:clock',
  ],

  PURCHASE_MANAGER: [
    'po:manage',
    'po:approve',
    'inventory:write',
    'finance:read',
    'reports:read',
    'attendance:clock',
  ],

  DELIVERY_MANAGER: [
    'delivery:manage',
    'orders:kds',
    'reports:read',
    'attendance:clock',
  ],

  DELIVERY_STAFF: [
    'delivery:manage',
    'orders:kds',
    'attendance:clock',
  ],

  HR_MANAGER: [
    'staff:manage',
    'attendance:read',
    'attendance:clock',
    'tables:manage',
  ],

  ACCOUNTANT: [
    'finance:read',
    'finance:write',
    'expenses:approve',
    'reports:read',
    'attendance:clock',
  ],

  MARKETING_MANAGER: [
    'crm:manage',
    'loyalty:manage',
    'reports:read',
    'attendance:clock',
  ],

  SYSTEM_AUDITOR: [
    'audit:read',
    'reports:read',
    'finance:read',
    'menu:read',
    'attendance:read',
  ],

  CUSTOMER: [
    'menu:read',
    'orders:checkout',
    'crm:manage',
    'loyalty:manage',
  ],
};
