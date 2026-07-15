import { Router } from 'express';
import { register, login, refresh, getMe, logout } from '../controllers/auth';
import { validateRegister, validateLogin } from '../validators/auth';
import { authenticateJWT, resolveTenant, optionalResolveTenant } from '../middleware/auth';

const router = Router();

router.post('/register', resolveTenant, validateRegister, register);
// Login: tenant header optional so global SUPER_ADMIN can sign in without X-Tenant-ID
router.post('/login', optionalResolveTenant, validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);

export default router;
