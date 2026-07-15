const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getTenantId = (): string | null => {
  return (
    localStorage.getItem('tastyc_tenant_id') ||
    import.meta.env.VITE_TENANT_ID ||
    null
  );
};

const getHeaders = (opts?: { auth?: boolean; supplier?: boolean }) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const tenantId = getTenantId();
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }

  if (opts?.supplier) {
    const supplierToken = localStorage.getItem('tastyc_supplier_token');
    if (supplierToken) {
      headers['Authorization'] = `Bearer ${supplierToken}`;
    }
  } else if (opts?.auth !== false) {
    const token = localStorage.getItem('tastyc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export type ListQuery = {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined | null;
};

export type PaginatedResult<T = any> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function toQuery(params?: ListQuery): string {
  if (!params) return '';
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function parsePaginated<T = any>(json: any): PaginatedResult<T> {
  const data = Array.isArray(json?.data) ? json.data : [];
  const p = json?.pagination || json?.metadata?.pagination || {};
  const page = Number(p.page) || 1;
  const limit = Number(p.limit) || 20;
  const total = Number(p.total ?? p.totalCount ?? data.length) || 0;
  const totalPages = Number(p.totalPages) || Math.max(1, Math.ceil((total || 1) / limit));
  return { data, pagination: { page, limit, total, totalPages } };
}

const cacheTenantFromSettings = (settings: any) => {
  if (settings?.tenantId) {
    localStorage.setItem('tastyc_tenant_id', settings.tenantId);
  }
};

export const api = {
  // --- Public storefront (no auth) ---
  public: {
    branding: async () => {
      const res = await fetch(`${API_URL}/public/branding`, {
        headers: getHeaders({ auth: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load branding');
      return json.data;
    },
    listTenants: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/public/tenants${toQuery(params)}`, {
        headers: getHeaders({ auth: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load restaurants');
      return parsePaginated(json);
    },
    resolveTenant: async (slug: string) => {
      const res = await fetch(`${API_URL}/public/tenants/${encodeURIComponent(slug)}`, {
        headers: getHeaders({ auth: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Restaurant not found');
      return json.data;
    },
  },

  // --- Auth ---
  auth: {
    login: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders({ auth: false }),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Login failed');
      if (json.data.user?.tenantId) {
        localStorage.setItem('tastyc_tenant_id', json.data.user.tenantId);
      }
      return {
        token: json.data.accessToken,
        user: json.data.user
      };
    },
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders({ auth: false }),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Registration failed');
      if (json.data.user?.tenantId) {
        localStorage.setItem('tastyc_tenant_id', json.data.user.tenantId);
      }
      return {
        token: json.data.accessToken,
        user: json.data.user
      };
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        const err: any = new Error(json.error?.message || json.error || 'Failed to fetch user session');
        err.status = res.status;
        err.code = json.error?.code;
        throw err;
      }
      return json.data;
    },
  },

  // --- Menu ---
  menu: {
    getCategories: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/menu/categories${toQuery(params)}`, { headers: getHeaders({ auth: false }) });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch categories');
      return parsePaginated(json);
    },
    createCategory: async (data: any) => {
      const res = await fetch(`${API_URL}/menu/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    uploadImage: async (imageBase64: string, filename: string) => {
      const res = await fetch(`${API_URL}/menu/items/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageBase64, filename })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to upload image');
      return json.data;
    },
    getItems: async (params?: ListQuery | string) => {
      const queryParams: ListQuery | undefined =
        typeof params === 'string' ? { categoryId: params } : params;
      const res = await fetch(`${API_URL}/menu/items${toQuery(queryParams)}`, { headers: getHeaders({ auth: false }) });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return parsePaginated(json);
    },
    getItemDetails: async (id: string | number) => {
      const res = await fetch(`${API_URL}/menu/items/${id}`, { headers: getHeaders({ auth: false }) });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch menu item details');
      return json.data;
    },
    createItem: async (data: any) => {
      const res = await fetch(`${API_URL}/menu/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to create item');
      return json.data;
    },
    updateItem: async (id: string | number, data: any) => {
      const res = await fetch(`${API_URL}/menu/items/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to update item');
      return json.data;
    },
    deleteItem: async (id: string | number) => {
      const res = await fetch(`${API_URL}/menu/items/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      return json.data;
    },
  },

  // --- Orders ---
  orders: {
    getTablesList: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/orders/tables${toQuery(params)}`, { headers: getHeaders({ auth: false }) });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch tables list');
      return parsePaginated(json);
    },
    create: async (data: any) => {
      const branchesRes = await fetch(`${API_URL}/branches${toQuery({ limit: 1 })}`, { headers: getHeaders({ auth: false }) });
      const branchesJson = await branchesRes.json();
      const branchId = branchesJson.data?.[0]?.id;

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders({ auth: false }),
        body: JSON.stringify({
          ...data,
          branchId: data.branchId || branchId
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to create order');
      return json.data;
    },
    getAll: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/orders${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch orders');
      return parsePaginated(json);
    },
    getDetails: async (id: string | number) => {
      const res = await fetch(`${API_URL}/orders/${id}`, { headers: getHeaders({ auth: false }) });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch order details');
      return json.data;
    },
    updateStatus: async (id: string | number, status: string) => {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to update order status');
      return json.data;
    },
    getDashboardStats: async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const headers = getHeaders();

      const res = await fetch(`${API_URL}/reports?startDate=${startDate}&endDate=${endDate}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');

      const r = json.data || {};

      return {
        totalRevenue: parseFloat(r.sales?.totalRevenue || 0),
        totalSalesCount: r.sales?.totalOrders || 0,
        activeOrdersCount: (r.statusSummary?.PENDING || 0) + (r.statusSummary?.PREPARING || 0) + (r.statusSummary?.READY || 0),
        lowStockCount: r.lowStockAlerts?.length || 0,
        staffActiveCount: r.staffActive || 0,
        foodCost: parseFloat(r.foodCost || 0),
        profit: parseFloat(r.profit || 0),
        procurementCost: parseFloat(r.procurement?.totalExpenditure || 0),
        wasteCost: parseFloat(r.waste?.totalCost || 0),
        inventoryValue: parseFloat(r.inventoryValue || 0),
        topSelling: r.topSelling || [],
        slowMoving: r.slowMoving || [],
        branchComparison: r.branchComparison || [],
        kitchenStatus: {
          pending: r.statusSummary?.PENDING || 0,
          preparing: r.statusSummary?.PREPARING || 0,
          ready: r.statusSummary?.READY || 0
        },
        recentOrders: (r.recentOrders || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          type: o.type,
          status: o.status,
          total: o.totalAmount,
          createdAt: o.createdAt
        })),
        lowStockAlerts: (r.lowStockAlerts || []).map((alert: any) => ({
          id: alert.id,
          name: alert.name,
          stockLevel: parseFloat(alert.stockLevel || 0),
          unit: alert.unit
        })),
        pendingPurchaseOrders: r.pendingPurchaseOrders || 0
      };
    },
  },

  // --- Inventory ---
  inventory: {
    getIngredients: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/inventory/ingredients${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error('Failed to fetch ingredients');
      return parsePaginated(json);
    },
    createIngredient: async (data: any) => {
      const res = await fetch(`${API_URL}/inventory/ingredients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateIngredient: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/inventory/ingredients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    deleteIngredient: async (id: string) => {
      await fetch(`${API_URL}/inventory/ingredients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
    adjustStock: async (data: { branchId?: string; ingredientId: string; quantity: number; type: string; reason?: string }) => {
      const branchesRes = await fetch(`${API_URL}/branches${toQuery({ limit: 1 })}`, { headers: getHeaders() });
      const branchesJson = await branchesRes.json();
      const branchId = branchesJson.data?.[0]?.id;

      const res = await fetch(`${API_URL}/inventory/adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          branchId: data.branchId || branchId
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to adjust stock');
      return json.data;
    },
    getSuppliers: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/inventory/suppliers${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return parsePaginated(json);
    },
    createSupplier: async (data: any) => {
      const res = await fetch(`${API_URL}/inventory/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    getPOs: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/inventory/purchase-orders${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return parsePaginated(json);
    },
    createPO: async (data: any) => {
      const res = await fetch(`${API_URL}/inventory/purchase-orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updatePOStatus: async (id: string | number, status: string, branchId?: string | number) => {
      let activeBranchId = branchId;
      if (!activeBranchId) {
        const branchesRes = await fetch(`${API_URL}/branches${toQuery({ limit: 1 })}`, { headers: getHeaders() });
        const branchesJson = await branchesRes.json();
        activeBranchId = branchesJson.data?.[0]?.id;
      }

      const res = await fetch(`${API_URL}/inventory/purchase-orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, branchId: activeBranchId }),
      });
      const json = await res.json();
      return json.data;
    },
  },

  // --- Waste ---
  waste: {
    getAll: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/waste${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return parsePaginated(json);
    },
    log: async (data: { branchId?: string; ingredientId: string; quantity: number; reason: string }) => {
      const branchesRes = await fetch(`${API_URL}/branches${toQuery({ limit: 1 })}`, { headers: getHeaders() });
      const branchesJson = await branchesRes.json();
      const branchId = branchesJson.data?.[0]?.id;

      const res = await fetch(`${API_URL}/waste`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          branchId: data.branchId || branchId
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to log waste');
      return json.data;
    },
  },

  // --- Attendance ---
  attendance: {
    getAll: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/attendance${toQuery(params)}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to fetch attendance logs');
      return parsePaginated(json);
    },
    clockIn: async () => {
      const res = await fetch(`${API_URL}/attendance/clock-in`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Clock in failed');
      return json.data;
    },
    clockOut: async () => {
      const res = await fetch(`${API_URL}/attendance/clock-out`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Clock out failed');
      return json.data;
    },
    getStatus: async () => {
      const res = await fetch(`${API_URL}/attendance/status`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return {
        clockedIn: json.data.isClockedIn,
        session: json.data
      };
    },
    createManual: async (data: any) => {
      const res = await fetch(`${API_URL}/attendance/manual`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to log manual attendance');
      return json.data;
    },
  },

  // --- Roles & RBAC ---
  roles: {
    getAll: async (tenantId?: string) => {
      const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
      const res = await fetch(`${API_URL}/roles${q}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch roles');
      return json.data;
    },
    getPermissions: async () => {
      const res = await fetch(`${API_URL}/roles/permissions`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch permissions');
      return json.data;
    },
    create: async (data: { name: string; permissions: string[]; tenantId?: string }) => {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to create role');
      return json.data;
    },
    update: async (id: string, data: { name?: string; permissions: string[] }) => {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to update role');
      return json.data;
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to delete role');
      return json.data;
    },
  },

  // --- Settings ---
  settings: {
    get: async () => {
      // Send JWT when present so Super Admin receives platform branding instead of a tenant fallback.
      const res = await fetch(`${API_URL}/settings`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch settings');
      cacheTenantFromSettings(json.data);
      return json.data;
    },
    update: async (data: any) => {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to update settings');
      cacheTenantFromSettings(json.data);
      return json.data;
    },
  },

  // --- Supplier Portal ---
  supplier: {
    login: async (email: string) => {
      const res = await fetch(`${API_URL}/inventory/supplier/login`, {
        method: 'POST',
        headers: getHeaders({ auth: false }),
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Supplier login failed');
      if (json.data.accessToken) {
        localStorage.setItem('tastyc_supplier_token', json.data.accessToken);
      }
      if (json.data.supplier?.tenantId) {
        localStorage.setItem('tastyc_tenant_id', json.data.supplier.tenantId);
      }
      return json.data;
    },
    getPOs: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/inventory/supplier/purchase-orders${toQuery(params)}`, {
        headers: getHeaders({ supplier: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch supplier POs');
      return parsePaginated(json);
    },
    updatePOStatus: async (poId: string, status?: string, invoiceUrl?: string) => {
      const res = await fetch(`${API_URL}/inventory/purchase-orders/${poId}/supplier-status`, {
        method: 'PUT',
        headers: getHeaders({ supplier: true }),
        body: JSON.stringify({ status, invoiceUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update PO status');
      return json.data;
    },
    logout: () => {
      localStorage.removeItem('tastyc_supplier_token');
      localStorage.removeItem('tastyc_supplier');
    },
  },

  // --- CRM & Booking ---
  crm: {
    bookReservation: async (data: any) => {
      const res = await fetch(`${API_URL}/crm/reservations/book`, {
        method: 'POST',
        headers: getHeaders({ auth: false }),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.error || 'Failed to submit reservation');
      return json.data;
    },
    getReservations: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/crm/reservations${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    updateReservation: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/crm/reservations/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    getWaitlist: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/crm/waiting-list${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    addToWaitlist: async (data: any) => {
      const res = await fetch(`${API_URL}/crm/waiting-list`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateWaitlist: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/crm/waiting-list/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json.data;
    },
    getProfile: async () => {
      const res = await fetch(`${API_URL}/crm/loyalty/profile`, { headers: getHeaders() });
      const json = await res.json();
      return json.data;
    },
    updateProfile: async (data: any) => {
      const res = await fetch(`${API_URL}/crm/loyalty/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    getCoupons: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/crm/loyalty/coupons${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createCoupon: async (data: any) => {
      const res = await fetch(`${API_URL}/crm/loyalty/coupons`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    getGiftCards: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/crm/loyalty/gift-cards${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createGiftCard: async (data: any) => {
      const res = await fetch(`${API_URL}/crm/loyalty/gift-cards`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
  },

  // --- Branches (Franchise Management) ---
  branches: {
    getAll: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/branches${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/branches`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/branches/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    delete: async (id: string) => {
      await fetch(`${API_URL}/branches/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
  },

  // --- Phase 3 & SaaS ---
  phase3: {
    getEvents: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/phase3/events${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createEvent: async (data: any) => {
      const res = await fetch(`${API_URL}/phase3/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateEventStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/phase3/events/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json.data;
    },
    getNutrition: async (menuItemId: string) => {
      const res = await fetch(`${API_URL}/phase3/nutrition/${menuItemId}`, {
        headers: getHeaders({ auth: false }),
      });
      const json = await res.json();
      return json.data;
    },
    updateNutrition: async (menuItemId: string, data: any) => {
      const res = await fetch(`${API_URL}/phase3/nutrition/${menuItemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    getProduction: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/phase3/production${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createProduction: async (data: any) => {
      const res = await fetch(`${API_URL}/phase3/production`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateProductionStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/phase3/production/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json.data;
    },
  },

  // --- Master Data ---
  master: {
    getFloors: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/master/floors${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createFloor: async (data: any) => {
      const res = await fetch(`${API_URL}/master/floors`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateFloor: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/master/floors/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    deleteFloor: async (id: string) => {
      await fetch(`${API_URL}/master/floors/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
    getTables: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/master/tables${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createTable: async (data: any) => {
      const res = await fetch(`${API_URL}/master/tables`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateTable: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/master/tables/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    deleteTable: async (id: string) => {
      await fetch(`${API_URL}/master/tables/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
    getSections: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/master/sections${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createSection: async (data: any) => {
      const res = await fetch(`${API_URL}/master/sections`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateSection: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/master/sections/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    deleteSection: async (id: string) => {
      await fetch(`${API_URL}/master/sections/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
    getUsers: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/master/users${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      return parsePaginated(json);
    },
    createUser: async (data: any) => {
      const res = await fetch(`${API_URL}/master/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    updateUser: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/master/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    },
    deleteUser: async (id: string) => {
      await fetch(`${API_URL}/master/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
  },

  // --- Platform (Super Admin) ---
  platform: {
    branding: {
      get: async () => {
        const res = await fetch(`${API_URL}/platform/branding`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load branding');
        return json.data;
      },
      update: async (data: { appName?: string; logo?: string | null; favicon?: string | null }) => {
        const res = await fetch(`${API_URL}/platform/branding`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save branding');
        return json.data;
      },
      upload: async (imageBase64: string, filename: string) => {
        const res = await fetch(`${API_URL}/platform/branding/upload`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ imageBase64, filename }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to upload image');
        return json.data;
      },
    },
    tenants: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/tenants${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load tenants');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/tenants`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create tenant');
        return json.data;
      },
      setStatus: async (id: string, status: string) => {
        const res = await fetch(`${API_URL}/platform/tenants/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update tenant');
        return json.data;
      },
      assignPlan: async (id: string, data: { planId?: string; planTier?: string; status?: string }) => {
        const res = await fetch(`${API_URL}/platform/tenants/${id}/plan`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to assign plan');
        return json.data;
      },
      remove: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/tenants/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to delete tenant');
        return json.data;
      },
      getSettings: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/tenants/${id}/settings`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load storefront settings');
        return json.data;
      },
      updateSettings: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/platform/tenants/${id}/settings`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save storefront settings');
        return json.data;
      },
    },
    plans: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/plans${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load plans');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/plans`, {
          method: data.id ? 'PUT' : 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save plan');
        return json.data;
      },
      remove: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/plans/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || 'Failed to delete plan');
        }
      },
    },
    invoices: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/invoices${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load invoices');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/invoices`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create invoice');
        return json.data;
      },
      setStatus: async (id: string, status: string) => {
        const res = await fetch(`${API_URL}/platform/invoices/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update invoice');
        return json.data;
      },
    },
    featureFlags: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/feature-flags${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load features');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/feature-flags`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save feature');
        return json.data;
      },
    },
    health: async () => {
      const res = await fetch(`${API_URL}/platform/health`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load health');
      return json.data;
    },
    analytics: async () => {
      const res = await fetch(`${API_URL}/platform/analytics`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load analytics');
      return json.data;
    },
    tickets: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/tickets${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load tickets');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/tickets`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create ticket');
        return json.data;
      },
      update: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/platform/tickets/${id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update ticket');
        return json.data;
      },
    },
    integrations: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/integrations${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load integrations');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/integrations`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save integration');
        return json.data;
      },
    },
    apiKeys: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/api-keys${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load API keys');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/api-keys`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create API key');
        return json.data;
      },
      revoke: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/api-keys/${id}/revoke`, {
          method: 'POST',
          headers: getHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to revoke key');
        return json.data;
      },
    },
    tax: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/tax-settings${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load tax settings');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/tax-settings`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save tax setting');
        return json.data;
      },
      remove: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/tax-settings/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || 'Failed to delete tax setting');
        }
      },
    },
    backups: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/backup-policies${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load backup policies');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/backup-policies`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save backup policy');
        return json.data;
      },
    },
    announcements: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/platform/announcements${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load announcements');
        return parsePaginated(json);
      },
      save: async (data: any) => {
        const res = await fetch(`${API_URL}/platform/announcements`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to save announcement');
        return json.data;
      },
      remove: async (id: string) => {
        const res = await fetch(`${API_URL}/platform/announcements/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || 'Failed to delete announcement');
        }
      },
    },
    auditLogs: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/platform/audit-logs${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load audit logs');
      return parsePaginated(json);
    },
  },

  // --- Ops modules ---
  ops: {
    expenses: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/expenses${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load expenses');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/expenses`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create expense');
        return json.data;
      },
      approve: async (id: string) => {
        const res = await fetch(`${API_URL}/ops/expenses/${id}/approve`, {
          method: 'POST',
          headers: getHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to approve');
        return json.data;
      },
      reject: async (id: string) => {
        const res = await fetch(`${API_URL}/ops/expenses/${id}/reject`, {
          method: 'POST',
          headers: getHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to reject');
        return json.data;
      },
    },
    schedules: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/schedules${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load schedules');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/schedules`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create schedule');
        return json.data;
      },
      remove: async (id: string) => {
        const res = await fetch(`${API_URL}/ops/schedules/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || 'Failed to delete schedule');
        }
      },
    },
    leaves: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/leaves${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load leaves');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/leaves`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create leave');
        return json.data;
      },
      setStatus: async (id: string, status: string) => {
        const res = await fetch(`${API_URL}/ops/leaves/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update leave');
        return json.data;
      },
    },
    delivery: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/delivery-jobs${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load deliveries');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/delivery-jobs`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create delivery');
        return json.data;
      },
      setStatus: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/ops/delivery-jobs/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update delivery');
        return json.data;
      },
    },
    campaigns: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/campaigns${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load campaigns');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/campaigns`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create campaign');
        return json.data;
      },
      update: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/ops/campaigns/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update campaign');
        return json.data;
      },
    },
    transfers: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/transfers${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load transfers');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/transfers`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create transfer');
        return json.data;
      },
      setStatus: async (id: string, status: string) => {
        const res = await fetch(`${API_URL}/ops/transfers/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to update transfer');
        return json.data;
      },
    },
    approvals: {
      list: async (params?: ListQuery) => {
        const res = await fetch(`${API_URL}/ops/approvals${toQuery(params)}`, { headers: getHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load approvals');
        return parsePaginated(json);
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/ops/approvals`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to create approval');
        return json.data;
      },
      decide: async (id: string, status: string, notes?: string) => {
        const res = await fetch(`${API_URL}/ops/approvals/${id}/decide`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ status, notes }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to decide approval');
        return json.data;
      },
    },
    financeSummary: async (startDate?: string, endDate?: string) => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      const res = await fetch(`${API_URL}/ops/finance/summary?${q}`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load finance summary');
      return json.data;
    },
    auditLogs: async (params?: ListQuery) => {
      const res = await fetch(`${API_URL}/ops/audit-logs${toQuery(params)}`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load audit logs');
      return parsePaginated(json);
    },
  },
};

