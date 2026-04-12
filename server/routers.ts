import * as express from 'express';
import { fittedRouter } from './fitted';
import { kitchenRouter } from './kitchen';
import { newBuildRouter } from './newBuild';
import { adminRouter } from './admin';
import { guestRouter } from './guest';

export const router = express.Router();

router.use('/api/fitted', fittedRouter);
router.use('/api/kitchen', kitchenRouter);
router.use('/api/new-build', newBuildRouter);
router.use('/api/admin', adminRouter);
router.use('/api/guest', guestRouter);

export function registerRoutes(app: ExpressApp) {
  app.use('/api', router);
}
