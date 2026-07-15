import { Router } from 'express';
import { getPublicBranding, listPublicTenants, resolvePublicTenant } from '../controllers/publicTenant';

const router = Router();

router.get('/branding', getPublicBranding);
router.get('/tenants', listPublicTenants);
router.get('/tenants/:slug', resolvePublicTenant);

export default router;
