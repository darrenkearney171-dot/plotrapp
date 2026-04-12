import * as express from 'express';
import { fittedEstimates, InsertFittedEstimate, Project } from '../schema';
import { fittedMasterSchedule } from '../server/fitted';
import { fittedCatalog } from '../fittedCatalog';

export const fittedRouter = express.Router();

fittedRouter.post('/estimates', async (req, res) => {
  const { projectId } = req.body;
  try {
    const estimate = await fittedMasterSchedule(projectId);
    res.json(estimate);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
