import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

/**
 * Both gates at the router level, so every route below is protected by
 * construction rather than by each author remembering. `requireAdmin` re-reads
 * the role from the database — see middleware/authMiddleware.ts.
 */
router.use(noStore, authenticate, requireAdmin);

router.get('/overview', AdminController.overview);

router.get('/orders', AdminController.listOrders);
router.get('/orders/:id', AdminController.getOrder);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

router.get('/products', AdminController.listProducts);
router.patch('/products/:id/stock', AdminController.adjustProductStock);
router.patch('/products/:id/flags', AdminController.updateProductFlags);
router.post('/products/:id/retire', AdminController.retireProduct);
router.delete('/products/:id', AdminController.deleteProduct);

router.patch('/variants/:id/stock', AdminController.adjustVariantStock);

export default router;
