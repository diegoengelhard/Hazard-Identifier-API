import { Router } from 'express';
import * as ClassificationController from '../controllers/classification.controller';
import { SESSION_ID } from '../utils/constants';
import { rateLimiter } from "../middlewares/ratelimiter.middleware";

const router = Router();

// Route to classify a single booking (for Part 1 of the challenge).
// POST /api/identifier/classify
router.post('/classify', rateLimiter, ClassificationController.classifySingle);

// Route to classify a batch of bookings (for Part 2 of the challenge).
// POST /api/identifier/classify-batch
router.post('/classify-batch', rateLimiter, ClassificationController.classifyBatch);

// A route to fetch the product list for dropdowns.
// GET /api/identifier/products
router.get('/products', ClassificationController.getProducts);

// A route to fetch the session ID.
router.get('/session', (_req, res) => {
  res.json({ sessionId: SESSION_ID });
});

export default router;
