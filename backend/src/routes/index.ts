import { Router } from 'express';
import authRoutes from './authRoutes.js';
import collectionRoutes from './collectionRoutes.js';
import productRoutes from './productRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import cartRoutes from './cartRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'NAYAB Fine Watchmaking API',
    time: new Date().toISOString(),
    version: '2.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/collections', collectionRoutes);
router.use('/products', productRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);

export default router;
