import { Router } from 'express';
import { CollectionController } from '../controllers/collectionController.js';

const router = Router();

router.get('/', CollectionController.getAll);
router.get('/:slug', CollectionController.getBySlug);

export default router;
