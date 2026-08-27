import { Router } from 'express';
import { AddressController } from '../controllers/addressController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { noStore } from '../middleware/securityHeaders.js';

const router = Router();

router.use(noStore, authenticate);

router.get('/', AddressController.list);
router.post('/', AddressController.create);
router.patch('/:id', AddressController.update);
router.delete('/:id', AddressController.remove);

export default router;
