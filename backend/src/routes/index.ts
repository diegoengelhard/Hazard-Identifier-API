import express, { Request, Response } from 'express';
const router = express.Router();
import classificationRouter from './classification.router';

router.use('/identifier', classificationRouter);

/* GET Test Route */
router.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

export default router;
