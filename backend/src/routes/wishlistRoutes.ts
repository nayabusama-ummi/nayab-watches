import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

router.use(noStore, authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addItem);
router.delete('/:productId', WishlistController.removeItem);

export default router;
