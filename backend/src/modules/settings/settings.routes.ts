import express, { type Request, type Response, type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import requireSuperAdmin from '../../common/middleware/requireSuperAdmin.js';
import * as settingsService from './settings.service.js';
import { updateSettingsBodySchema, type UpdateSettingsInput } from './settings.validators.js';

export const createPublicSettingsRouter = (): Router => {
  const router = express.Router();
  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await settingsService.getPublicSettings());
    })
  );
  return router;
};

export const createAdminSettingsRouter = (): Router => {
  const router = express.Router();
  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await settingsService.getSettings());
    })
  );
  // Delivery rates change what customers are charged, so only super admins
  // may edit them.
  router.put(
    '/',
    requireSuperAdmin,
    validate({ body: updateSettingsBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await settingsService.updateSettings(req.body as UpdateSettingsInput));
    })
  );
  return router;
};
