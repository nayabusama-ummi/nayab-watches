import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticate, CartController.getCart);
router.post('/items', optionalAuthenticate, CartController.addItem);
router.patch('/items/:id', optionalAuthenticate, CartController.updateItem);
router.delete('/items/:id', optionalAuthenticate, CartController.removeItem);
router.post('/merge', authenticate, CartController.mergeCart);

export default router;
