/**
 * @file Defines the routes related to booking classification.
 * This router delegates requests to the appropriate controller functions.
 */

import { Router } from 'express';
import * as ClassificationController from '../controllers/classification.controller';

const router = Router();

// Route to classify a single booking (for Part 1 of the challenge).
// POST /api/identifier/classify
router.post('/classify', ClassificationController.classifySingle);

// Route to classify a batch of bookings (for Part 2 of the challenge).
// POST /api/identifier/classify-batch
router.post('/classify-batch', ClassificationController.classifyBatch);

// A route to fetch the product list for dropdowns.
// GET /api/identifier/products
router.get('/products', ClassificationController.getProducts);

export default router;
