import { Router } from 'express';
import { authenticateJWT, requirePermission, requireAnyPermission, requireFeature, requireActiveSubscription } from '../middleware/auth';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  listLeaves,
  createLeave,
  updateLeaveStatus,
  listDeliveryJobs,
  createDeliveryJob,
  updateDeliveryJobStatus,
  listCampaigns,
  createCampaign,
  updateCampaign,
  listStockTransfers,
  createStockTransfer,
  updateStockTransferStatus,
  listApprovals,
  createApproval,
  decideApproval,
  financeSummary,
  listTenantAuditLogs,
} from '../controllers/opsModules';

const router = Router();

router.use(authenticateJWT, requireActiveSubscription);

// Expenses
router.get('/expenses', requirePermission('finance:read'), listExpenses);
router.post('/expenses', requirePermission('finance:write'), createExpense);
router.put('/expenses/:id', requirePermission('finance:write'), updateExpense);
router.delete('/expenses/:id', requirePermission('finance:write'), deleteExpense);
router.post('/expenses/:id/approve', requirePermission('expenses:approve'), approveExpense);
router.post('/expenses/:id/reject', requirePermission('expenses:approve'), rejectExpense);

// Staff schedules
router.get('/schedules', requirePermission('attendance:read'), listSchedules);
router.post('/schedules', requirePermission('staff:manage'), createSchedule);
router.put('/schedules/:id', requirePermission('staff:manage'), updateSchedule);
router.delete('/schedules/:id', requirePermission('staff:manage'), deleteSchedule);

// Leave requests
router.get('/leaves', requirePermission('attendance:read'), listLeaves);
router.post('/leaves', requirePermission('staff:manage'), createLeave);
router.patch('/leaves/:id/status', requirePermission('staff:manage'), updateLeaveStatus);

// Delivery jobs
router.get('/delivery-jobs', requirePermission('delivery:manage'), requireFeature('delivery'), listDeliveryJobs);
router.post('/delivery-jobs', requirePermission('delivery:manage'), requireFeature('delivery'), createDeliveryJob);
router.patch('/delivery-jobs/:id/status', requirePermission('delivery:manage'), requireFeature('delivery'), updateDeliveryJobStatus);

// Marketing campaigns
router.get('/campaigns', requirePermission('loyalty:manage'), requireFeature('loyalty'), listCampaigns);
router.post('/campaigns', requirePermission('loyalty:manage'), requireFeature('loyalty'), createCampaign);
router.put('/campaigns/:id', requirePermission('loyalty:manage'), requireFeature('loyalty'), updateCampaign);

// Stock transfers
router.get('/transfers', requirePermission('inventory:write'), requireFeature('inventory'), listStockTransfers);
router.post('/transfers', requirePermission('inventory:write'), requireFeature('inventory'), createStockTransfer);
router.patch('/transfers/:id/status', requirePermission('inventory:write'), requireFeature('inventory'), updateStockTransferStatus);

// Approvals
router.get('/approvals', requirePermission('reports:read'), listApprovals);
router.post('/approvals', requireAnyPermission('staff:manage', 'po:approve', 'expenses:approve'), createApproval);
router.post(
  '/approvals/:id/decide',
  requireAnyPermission('staff:manage', 'po:approve', 'expenses:approve', 'inventory:approve'),
  decideApproval
);

// Finance summary
router.get('/finance/summary', requirePermission('finance:read'), requireFeature('advanced_reports'), financeSummary);

// Tenant-scoped audit logs
router.get('/audit-logs', requirePermission('audit:read'), listTenantAuditLogs);

export default router;
