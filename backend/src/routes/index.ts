import { Router } from 'express';
import authRoutes from './authRoutes.js';
import collectionRoutes from './collectionRoutes.js';
import productRoutes from './productRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import addressRoutes from './addressRoutes.js';
import adminRoutes from './adminRoutes.js';

import { prisma } from '../config/prisma.js';

const router = Router();

// Liveness check: lightweight ping
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'NAYAB Fine Watchmaking API',
    time: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Readiness check: verifies database connectivity
router.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      time: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'unavailable',
      database: 'disconnected',
      time: new Date().toISOString(),
    });
  }
});

router.use('/auth', authRoutes);
router.use('/collections', collectionRoutes);
router.use('/products', productRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);

export default router;
