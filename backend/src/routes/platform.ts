import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import {
  listTenants,
  createTenant,
  updateTenantStatus,
  softDeleteTenant,
  getTenantStorefrontSettings,
  updateTenantStorefrontSettings,
  listPlans,
  upsertPlan,
  deletePlan,
  listInvoices,
  createInvoice,
  updateInvoiceStatus,
  listFeatureFlags,
  upsertFeatureFlag,
  getSystemHealth,
  getPlatformAnalytics,
  listTickets,
  createTicket,
  updateTicket,
  listIntegrations,
  upsertIntegration,
  listApiKeys,
  createApiKey,
  revokeApiKey,
  listTaxSettings,
  upsertTaxSetting,
  deleteTaxSetting,
  listBackupPolicies,
  upsertBackupPolicy,
  listAnnouncements,
  upsertAnnouncement,
  deleteAnnouncement,
  listAuditLogs,
  getPlatformBranding,
  updatePlatformBranding,
  uploadPlatformBrandingAsset,
} from '../controllers/platform';

const router = Router();

router.use(authenticateJWT, requireRoles('SUPER_ADMIN'));

// Admin panel branding (System Settings)
router.get('/branding', getPlatformBranding);
router.put('/branding', updatePlatformBranding);
router.post('/branding/upload', uploadPlatformBrandingAsset);
// Tenants
router.get('/tenants', listTenants);
router.post('/tenants', createTenant);
router.patch('/tenants/:id/status', updateTenantStatus);
router.delete('/tenants/:id', softDeleteTenant);
router.get('/tenants/:id/settings', getTenantStorefrontSettings);
router.put('/tenants/:id/settings', updateTenantStorefrontSettings);

// Plans
router.get('/plans', listPlans);
router.post('/plans', upsertPlan);
router.put('/plans', upsertPlan);
router.delete('/plans/:id', deletePlan);

// Invoices
router.get('/invoices', listInvoices);
router.post('/invoices', createInvoice);
router.patch('/invoices/:id/status', updateInvoiceStatus);

// Feature flags
router.get('/feature-flags', listFeatureFlags);
router.post('/feature-flags', upsertFeatureFlag);
router.put('/feature-flags', upsertFeatureFlag);

// Health & analytics
router.get('/health', getSystemHealth);
router.get('/analytics', getPlatformAnalytics);

// Support tickets
router.get('/tickets', listTickets);
router.post('/tickets', createTicket);
router.patch('/tickets/:id', updateTicket);

// Integrations
router.get('/integrations', listIntegrations);
router.post('/integrations', upsertIntegration);
router.put('/integrations', upsertIntegration);

// API keys
router.get('/api-keys', listApiKeys);
router.post('/api-keys', createApiKey);
router.post('/api-keys/:id/revoke', revokeApiKey);

// Tax settings
router.get('/tax-settings', listTaxSettings);
router.post('/tax-settings', upsertTaxSetting);
router.put('/tax-settings', upsertTaxSetting);
router.delete('/tax-settings/:id', deleteTaxSetting);

// Backup policies
router.get('/backup-policies', listBackupPolicies);
router.post('/backup-policies', upsertBackupPolicy);
router.put('/backup-policies', upsertBackupPolicy);

// Announcements
router.get('/announcements', listAnnouncements);
router.post('/announcements', upsertAnnouncement);
router.put('/announcements', upsertAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Platform-wide audit (SUPER_ADMIN only via router.use)
router.get('/audit-logs', listAuditLogs);

export default router;
