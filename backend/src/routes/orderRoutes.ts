import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { checkoutRateLimit } from '../middleware/rateLimit.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

// Orders are never public. Applied at the router level so a route added later
// cannot accidentally be left open.
router.use(noStore, authenticate);

router.post('/', checkoutRateLimit, OrderController.create);
router.get('/', OrderController.list);
router.get('/:id', OrderController.getOne);
router.post('/:id/cancel', OrderController.cancel);

export default router;
