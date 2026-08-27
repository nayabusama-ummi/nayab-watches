import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { loginRateLimit, registerRateLimit } from '../middleware/rateLimit.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

router.post('/register', registerRateLimit, AuthController.register);
router.post('/login', loginRateLimit, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', noStore, authenticate, AuthController.getMe);

export default router;
