import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Coffee,
  Boxes,
  Trash2,
  ChefHat,
  Users,
  Shield,
  Settings,
  Layers,
  Landmark,
  Building2,
  CreditCard,
  Activity,
  Plug,
  LifeBuoy,
  ScrollText,
  Wallet,
  Receipt,
  CheckSquare,
  CalendarClock,
  Truck,
  Megaphone,
  ArrowLeftRight,
  Banknote,
  HeartHandshake,
} from 'lucide-react';

/** All SaaS + restaurant roles (matches product RBAC spec). */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  AREA_MANAGER: 'AREA_MANAGER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  KITCHEN_MANAGER: 'KITCHEN_MANAGER',
  CHEF: 'CHEF',
  SOUS_CHEF: 'SOUS_CHEF',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  WAITER: 'WAITER',
  CASHIER: 'CASHIER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  PURCHASE_MANAGER: 'PURCHASE_MANAGER',
  SUPPLIER: 'SUPPLIER',
  DELIVERY_MANAGER: 'DELIVERY_MANAGER',
  DELIVERY_STAFF: 'DELIVERY_STAFF',
  HR_MANAGER: 'HR_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  CUSTOMER: 'CUSTOMER',
  SYSTEM_AUDITOR: 'SYSTEM_AUDITOR',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export interface AdminNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles: AppRole[];
  permissions?: string[];
  /** SaaS plan feature flag key (from PlanFeatureFlag). Omit = always available. */
  feature?: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

const {
  SUPER_ADMIN,
  OWNER,
  AREA_MANAGER,
  BRANCH_MANAGER,
  KITCHEN_MANAGER,
  CHEF,
  SOUS_CHEF,
  KITCHEN_STAFF,
  WAITER,
  CASHIER,
  INVENTORY_MANAGER,
  PURCHASE_MANAGER,
  DELIVERY_MANAGER,
  DELIVERY_STAFF,
  HR_MANAGER,
  ACCOUNTANT,
  MARKETING_MANAGER,
  SYSTEM_AUDITOR,
} = ROLES;

/**
 * Sidebar + route access matrix derived from SaaS role responsibilities.
 * SUPPLIER and CUSTOMER use dedicated portals (not this admin shell).
 * Overview / Dashboard is always the first group so every staff login lands there.
 */
export const ADMIN_MENU_GROUPS: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
        roles: [
          SUPER_ADMIN,
          OWNER,
          AREA_MANAGER,
          BRANCH_MANAGER,
          KITCHEN_MANAGER,
          CHEF,
          SOUS_CHEF,
          KITCHEN_STAFF,
          WAITER,
          CASHIER,
          INVENTORY_MANAGER,
          PURCHASE_MANAGER,
          DELIVERY_MANAGER,
          DELIVERY_STAFF,
          HR_MANAGER,
          ACCOUNTANT,
          MARKETING_MANAGER,
          SYSTEM_AUDITOR,
        ],
      },
      {
        name: 'Finance & P&L',
        path: '/admin/finance',
        icon: Wallet,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, ACCOUNTANT],
        feature: 'advanced_reports',
      },
      {
        name: 'Approvals',
        path: '/admin/approvals',
        icon: CheckSquare,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, PURCHASE_MANAGER],
      },
    ],
  },
  {
    title: 'Platform',
    items: [
      {
        name: 'Tenants',
        path: '/admin/platform/tenants',
        icon: Building2,
        roles: [SUPER_ADMIN],
        permissions: ['platform:tenants'],
      },
      {
        name: 'Billing & Plans',
        path: '/admin/platform/billing',
        icon: CreditCard,
        roles: [SUPER_ADMIN],
        permissions: ['platform:billing', 'platform:features'],
      },
      {
        name: 'System & Analytics',
        path: '/admin/platform/system',
        icon: Activity,
        roles: [SUPER_ADMIN],
        permissions: ['platform:analytics'],
      },
      {
        name: 'Integrations & Tax',
        path: '/admin/platform/integrations',
        icon: Plug,
        roles: [SUPER_ADMIN],
        permissions: ['platform:integrations', 'platform:api_keys', 'platform:tax'],
      },
      {
        name: 'Support Tickets',
        path: '/admin/platform/support',
        icon: LifeBuoy,
        roles: [SUPER_ADMIN],
        permissions: ['platform:support'],
      },
      {
        name: 'Platform Audit',
        path: '/admin/audit',
        icon: ScrollText,
        roles: [SUPER_ADMIN],
        permissions: ['platform:audit'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        name: 'KDS (Orders)',
        path: '/admin/orders',
        icon: ClipboardList,
        roles: [
          OWNER,
          AREA_MANAGER,
          BRANCH_MANAGER,
          KITCHEN_MANAGER,
          CHEF,
          SOUS_CHEF,
          KITCHEN_STAFF,
          WAITER,
          CASHIER,
          DELIVERY_MANAGER,
          DELIVERY_STAFF,
        ],
        feature: 'kds',
      },
      {
        name: 'Cash Drawer',
        path: '/admin/cash',
        icon: Banknote,
        roles: [OWNER, BRANCH_MANAGER, CASHIER],
        feature: 'pos',
      },
      {
        name: 'Reservations & CRM',
        path: '/admin/crm',
        icon: Calendar,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, MARKETING_MANAGER, WAITER, CASHIER],
      },
      {
        name: 'Delivery Hub',
        path: '/admin/delivery',
        icon: Truck,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, DELIVERY_MANAGER, DELIVERY_STAFF],
        feature: 'delivery',
      },
      {
        name: 'Catering & Production',
        path: '/admin/enterprise',
        icon: ChefHat,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, KITCHEN_MANAGER],
        feature: 'catering',
      },
    ],
  },
  {
    title: 'Kitchen & Inventory',
    items: [
      {
        name: 'Menu Manager',
        path: '/admin/menu',
        icon: Coffee,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, KITCHEN_MANAGER, SYSTEM_AUDITOR],
      },
      {
        name: 'Inventory & POs',
        path: '/admin/inventory',
        icon: Boxes,
        roles: [
          OWNER,
          AREA_MANAGER,
          BRANCH_MANAGER,
          KITCHEN_MANAGER,
          INVENTORY_MANAGER,
          PURCHASE_MANAGER,
        ],
        feature: 'inventory',
      },
      {
        name: 'Stock Transfers',
        path: '/admin/transfers',
        icon: ArrowLeftRight,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, INVENTORY_MANAGER, KITCHEN_MANAGER],
        feature: 'inventory',
      },
      {
        name: 'Waste Tracker',
        path: '/admin/waste',
        icon: Trash2,
        roles: [
          OWNER,
          AREA_MANAGER,
          BRANCH_MANAGER,
          KITCHEN_MANAGER,
          CHEF,
          SOUS_CHEF,
          INVENTORY_MANAGER,
        ],
        feature: 'inventory',
      },
    ],
  },
  {
    title: 'People & Marketing',
    items: [
      {
        name: 'Attendance Shifts',
        path: '/admin/attendance',
        icon: Users,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, HR_MANAGER, SYSTEM_AUDITOR],
      },
      {
        name: 'Staff Scheduling',
        path: '/admin/scheduling',
        icon: CalendarClock,
        roles: [OWNER, AREA_MANAGER, BRANCH_MANAGER, HR_MANAGER],
      },
      {
        name: 'HR & Leave',
        path: '/admin/hr',
        icon: HeartHandshake,
        roles: [OWNER, HR_MANAGER],
      },
      {
        name: 'Marketing Campaigns',
        path: '/admin/marketing',
        icon: Megaphone,
        roles: [OWNER, MARKETING_MANAGER],
        feature: 'loyalty',
      },
    ],
  },
  {
    title: 'Finance Ops',
    items: [
      {
        name: 'Expenses',
        path: '/admin/expenses',
        icon: Receipt,
        roles: [OWNER, BRANCH_MANAGER, ACCOUNTANT],
      },
      {
        name: 'Audit Logs',
        path: '/admin/org-audit',
        icon: ScrollText,
        roles: [OWNER, SYSTEM_AUDITOR],
        feature: 'advanced_reports',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        name: 'Branches / Franchise',
        path: '/admin/franchise',
        icon: Landmark,
        roles: [OWNER, AREA_MANAGER],
        feature: 'multi_branch',
      },
      {
        name: 'Master References',
        path: '/admin/master-data',
        icon: Layers,
        roles: [OWNER, BRANCH_MANAGER, HR_MANAGER],
      },
      {
        name: 'Roles & Permissions',
        path: '/admin/roles',
        icon: Shield,
        roles: [SUPER_ADMIN, OWNER, BRANCH_MANAGER, HR_MANAGER],
      },
      {
        name: 'System Settings',
        path: '/admin/settings',
        icon: Settings,
        roles: [SUPER_ADMIN, OWNER],
      },
    ],
  },
];

export const ADMIN_ROUTE_FEATURES: Record<string, string | undefined> = Object.fromEntries(
  ADMIN_MENU_GROUPS.flatMap((group) => group.items.map((item) => [item.path, item.feature]))
);

export const ADMIN_ROUTE_ROLES: Record<string, AppRole[]> = Object.fromEntries(
  ADMIN_MENU_GROUPS.flatMap((group) => group.items.map((item) => [item.path, item.roles]))
) as Record<string, AppRole[]>;

export function getAllowedAdminRoutes(role: string, features?: string[] | null): string[] {
  const featureSet = features ? new Set(features) : null;
  return Object.entries(ADMIN_ROUTE_ROLES)
    .filter(([path, roles]) => {
      if (!roles.includes(role as AppRole)) return false;
      if (role === ROLES.SUPER_ADMIN) return true;
      const feature = ADMIN_ROUTE_FEATURES[path];
      if (!feature) return true;
      // If entitlements not loaded yet, keep item visible; API still enforces.
      if (!featureSet) return true;
      return featureSet.has(feature);
    })
    .map(([path]) => path);
}

export function canAccessAdminRoute(
  role: string | undefined,
  path: string,
  features?: string[] | null
): boolean {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) {
    const allowed = ADMIN_ROUTE_ROLES[path];
    return !!allowed?.includes(role as AppRole);
  }
  const allowed = ADMIN_ROUTE_ROLES[path];
  if (!allowed) return false;
  if (!allowed.includes(role as AppRole)) return false;
  const feature = ADMIN_ROUTE_FEATURES[path];
  if (!feature) return true;
  if (!features) return true;
  return features.includes(feature);
}

/** All admin panel logins land on the Dashboard (/admin). */
export function getDefaultAdminPath(role: string, features?: string[] | null): string {
  if (canAccessAdminRoute(role, '/admin', features)) return '/admin';
  const routes = getAllowedAdminRoutes(role, features);
  return routes[0] || '/admin/login';
}

export const ADMIN_PANEL_ROLES: AppRole[] = Object.values(ROLES).filter(
  (r) => r !== ROLES.CUSTOMER && r !== ROLES.SUPPLIER
);
