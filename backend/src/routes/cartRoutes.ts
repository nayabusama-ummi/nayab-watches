import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

// A bag is personal even when anonymous — never let a shared cache serve one.
router.use(noStore);

router.get('/', optionalAuthenticate, CartController.getCart);
router.post('/items', optionalAuthenticate, CartController.addItem);
router.patch('/items/:id', optionalAuthenticate, CartController.updateItem);
router.delete('/items/:id', optionalAuthenticate, CartController.removeItem);
router.delete('/', optionalAuthenticate, CartController.clear);
router.post('/merge', authenticate, CartController.mergeCart);

export default router;
