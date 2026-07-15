import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Menu } from './pages/customer/Menu';
import { Checkout } from './pages/customer/Checkout';
import { OrderStatus } from './pages/customer/OrderStatus';
import { SupplierPortal } from './pages/customer/SupplierPortal';
import { Reservations } from './pages/customer/Reservations';
import { LoyaltyLounge } from './pages/customer/LoyaltyLounge';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminLogin } from './pages/auth/AdminLogin';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Orders } from './pages/admin/Orders';
import { MenuManagement } from './pages/admin/MenuManagement';
import { Inventory } from './pages/admin/Inventory';
import { WasteManagement } from './pages/admin/WasteManagement';
import { Attendance } from './pages/admin/Attendance';
import { RolesManagement } from './pages/admin/RolesManagement';
import { SettingsManagement } from './pages/admin/SettingsManagement';
import { CRMManagement } from './pages/admin/CRMManagement';
import { FranchiseManagement } from './pages/admin/FranchiseManagement';
import { EnterpriseManagement } from './pages/admin/EnterpriseManagement';
import { MasterDataManagement } from './pages/admin/MasterDataManagement';
import { TenantsManagement } from './pages/admin/platform/TenantsManagement';
import { PlatformBilling } from './pages/admin/platform/PlatformBilling';
import { PlatformSystem } from './pages/admin/platform/PlatformSystem';
import { PlatformIntegrations } from './pages/admin/platform/PlatformIntegrations';
import { PlatformSupport } from './pages/admin/platform/PlatformSupport';
import { AuditLogs } from './pages/admin/AuditLogs';
import { FinanceReports } from './pages/admin/FinanceReports';
import { ExpensesManagement } from './pages/admin/ExpensesManagement';
import { ApprovalsCenter } from './pages/admin/ApprovalsCenter';
import { StaffScheduling } from './pages/admin/StaffScheduling';
import { HRManagement } from './pages/admin/HRManagement';
import { DeliveryHub } from './pages/admin/DeliveryHub';
import { MarketingCampaigns } from './pages/admin/MarketingCampaigns';
import { StockTransfers } from './pages/admin/StockTransfers';
import { CashDrawer } from './pages/admin/CashDrawer';
import { RestaurantDirectory } from './pages/customer/RestaurantDirectory';
import { StorefrontShell } from './components/StorefrontShell';
import { useOptionalStorefront } from './context/TenantContext';

import { ADMIN_ROUTE_ROLES, canAccessAdminRoute } from './config/rbac';

// Lucide Icons
import { X, Trash2, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
}

// Protected Route Component for Admin Dashboard with Granular RBAC Checks
const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ children, path }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const features = user?.subscription?.features || null;
  const roleAllowed = (ADMIN_ROUTE_ROLES[path] || []).includes(user?.role as any);
  const featureAllowed = canAccessAdminRoute(user?.role, path, features);

  if (isLoading) {
    return (
      <div className="bg-[#0a1316] min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const planExpired =
    user.role !== 'SUPER_ADMIN' &&
    !!user.tenantId &&
    (user.subscription?.isExpired === true || user.subscription?.status === 'EXPIRED');

  if (planExpired) {
    return (
      <AdminLayout>
        <div className="text-center py-20 max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 bg-amber-950/20 border border-amber-500/25 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <X className="h-8 w-8" />
          </div>
          <h2 className="font-title text-2xl uppercase tracking-wider text-white">Subscription Expired</h2>
          <p className="text-xs text-[#a9b8c3] leading-relaxed">
            Your restaurant plan
            {user.subscription?.planTier ? (
              <>
                {' '}
                (<span className="text-tastyc-copper font-bold">{user.subscription.planTier}</span>)
              </>
            ) : null}{' '}
            is no longer active. Renew the plan with the platform owner to restore access. You cannot use admin
            actions until the subscription is renewed.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!roleAllowed || !featureAllowed) {
    const planBlocked = roleAllowed && !featureAllowed;
    return (
      <AdminLayout>
        <div className="text-center py-20 max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 bg-red-950/20 border border-red-500/25 rounded-full flex items-center justify-center mx-auto text-red-500">
            <X className="h-8 w-8" />
          </div>
          <h2 className="font-title text-2xl uppercase tracking-wider text-white">
            {planBlocked ? 'Plan Upgrade Required' : 'Access Denied'}
          </h2>
          <p className="text-xs text-[#a9b8c3] leading-relaxed">
            {planBlocked ? (
              <>
                This module is not included in your current subscription
                {user.subscription?.planTier ? (
                  <>
                    {' '}
                    (<span className="text-tastyc-copper font-bold">{user.subscription.planTier}</span>)
                  </>
                ) : null}
                . Contact the platform owner to upgrade.
              </>
            ) : (
              <>
                Your staff account role <span className="text-tastyc-copper font-bold">({user.role})</span> does not
                hold administrative clearance to view this module.
              </>
            )}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Sliding Cart Drawer Overlay Component
const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useSettings();
  const storefront = useOptionalStorefront();
  const checkoutPath = storefront?.path('/checkout') || '/checkout';

  if (!isOpen) return null;

  return (
    <>
      {/* Dim backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
      
      {/* Sliding Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#121e22] border-l border-tastyc-copper/20 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300">
        <div className="space-y-6 flex-grow flex flex-col min-h-0 text-left">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
            <h3 className="font-title text-2xl uppercase tracking-wider text-white">Your Tray</h3>
            <button onClick={onClose} className="text-[#a9b8c3] hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1 mt-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-start space-x-3 bg-tastyc-dark/40 border border-tastyc-copper/5 p-3 rounded">
                <div className="space-y-1 text-left flex-grow">
                  <h4 className="text-xs uppercase font-bold text-white tracking-wider">{item.name}</h4>
                  <p className="text-[10px] text-tastyc-copper">{formatPrice(item.price)} each</p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-[9px] text-[#a9b8c3] leading-relaxed">
                      Modifiers: {item.modifiers.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between h-full space-y-2 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#a9b8c3] hover:text-red-400 p-0.5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center space-x-2 border border-tastyc-copper/20 px-2 py-0.5 text-xs text-white">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <span className="w-4 text-center font-mono font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-20 text-[#a9b8c3] text-xs uppercase tracking-widest border border-dashed border-tastyc-copper/10 mt-4">
                Your tray is empty
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="border-t border-tastyc-copper/10 pt-4 mt-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase text-[#a9b8c3] font-semibold">Subtotal</span>
              <span className="text-2xl font-title font-bold text-tastyc-copper">{formatPrice(cartTotal)}</span>
            </div>
            <Link
              to={checkoutPath}
              onClick={onClose}
              className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-all duration-300"
            >
              <span>Place Order</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

// Customer wrapper to inject Layout and CartDrawer state easily
const CustomerPagesWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CustomerLayout onOpenCart={() => setIsCartOpen(true)}>
      {children}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </CustomerLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Platform directory — pick a restaurant */}
                <Route path="/" element={<RestaurantDirectory />} />

                {/* Per-tenant customer storefront */}
                <Route path="/r/:slug" element={<StorefrontShell />}>
                  <Route element={<CustomerPagesWrapper><Outlet /></CustomerPagesWrapper>}>
                    <Route index element={<Home />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order-status/:id" element={<OrderStatus />} />
                    <Route path="supplier/portal" element={<SupplierPortal />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="loyalty" element={<LoyaltyLounge />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                  </Route>
                </Route>

                {/* Legacy customer URLs → directory */}
                <Route path="/menu" element={<Navigate to="/" replace />} />
                <Route path="/checkout" element={<Navigate to="/" replace />} />
                <Route path="/reservations" element={<Navigate to="/" replace />} />
                <Route path="/loyalty" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Board Routes — roles from config/rbac.ts */}
                <Route path="/admin" element={<ProtectedAdminRoute path="/admin"><Dashboard /></ProtectedAdminRoute>} />
                <Route path="/admin/orders" element={<ProtectedAdminRoute path="/admin/orders"><Orders /></ProtectedAdminRoute>} />
                <Route path="/admin/cash" element={<ProtectedAdminRoute path="/admin/cash"><CashDrawer /></ProtectedAdminRoute>} />
                <Route path="/admin/menu" element={<ProtectedAdminRoute path="/admin/menu"><MenuManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/inventory" element={<ProtectedAdminRoute path="/admin/inventory"><Inventory /></ProtectedAdminRoute>} />
                <Route path="/admin/transfers" element={<ProtectedAdminRoute path="/admin/transfers"><StockTransfers /></ProtectedAdminRoute>} />
                <Route path="/admin/waste" element={<ProtectedAdminRoute path="/admin/waste"><WasteManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/attendance" element={<ProtectedAdminRoute path="/admin/attendance"><Attendance /></ProtectedAdminRoute>} />
                <Route path="/admin/scheduling" element={<ProtectedAdminRoute path="/admin/scheduling"><StaffScheduling /></ProtectedAdminRoute>} />
                <Route path="/admin/hr" element={<ProtectedAdminRoute path="/admin/hr"><HRManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/marketing" element={<ProtectedAdminRoute path="/admin/marketing"><MarketingCampaigns /></ProtectedAdminRoute>} />
                <Route path="/admin/delivery" element={<ProtectedAdminRoute path="/admin/delivery"><DeliveryHub /></ProtectedAdminRoute>} />
                <Route path="/admin/finance" element={<ProtectedAdminRoute path="/admin/finance"><FinanceReports /></ProtectedAdminRoute>} />
                <Route path="/admin/expenses" element={<ProtectedAdminRoute path="/admin/expenses"><ExpensesManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/approvals" element={<ProtectedAdminRoute path="/admin/approvals"><ApprovalsCenter /></ProtectedAdminRoute>} />
                <Route path="/admin/roles" element={<ProtectedAdminRoute path="/admin/roles"><RolesManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/settings" element={<ProtectedAdminRoute path="/admin/settings"><SettingsManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/crm" element={<ProtectedAdminRoute path="/admin/crm"><CRMManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/franchise" element={<ProtectedAdminRoute path="/admin/franchise"><FranchiseManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/enterprise" element={<ProtectedAdminRoute path="/admin/enterprise"><EnterpriseManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/master-data" element={<ProtectedAdminRoute path="/admin/master-data"><MasterDataManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/audit" element={<ProtectedAdminRoute path="/admin/audit"><AuditLogs /></ProtectedAdminRoute>} />
                <Route path="/admin/org-audit" element={<ProtectedAdminRoute path="/admin/org-audit"><AuditLogs /></ProtectedAdminRoute>} />

                {/* Super Admin platform modules */}
                <Route path="/admin/platform/tenants" element={<ProtectedAdminRoute path="/admin/platform/tenants"><TenantsManagement /></ProtectedAdminRoute>} />
                <Route path="/admin/platform/billing" element={<ProtectedAdminRoute path="/admin/platform/billing"><PlatformBilling /></ProtectedAdminRoute>} />
                <Route path="/admin/platform/system" element={<ProtectedAdminRoute path="/admin/platform/system"><PlatformSystem /></ProtectedAdminRoute>} />
                <Route path="/admin/platform/integrations" element={<ProtectedAdminRoute path="/admin/platform/integrations"><PlatformIntegrations /></ProtectedAdminRoute>} />
                <Route path="/admin/platform/support" element={<ProtectedAdminRoute path="/admin/platform/support"><PlatformSupport /></ProtectedAdminRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </CartProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
