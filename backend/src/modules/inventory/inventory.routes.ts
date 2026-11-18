import express, { type Request, type Response, type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import type { ItemType } from '../../common/constants/catalog.js';
import { actorOf } from '../../common/utils/actor.js';
import * as inventoryService from './inventory.service.js';
import {
  adjustStockBodySchema,
  inventoryItemParamsSchema,
  listInventoryQuerySchema,
  type AdjustStockInput,
  type ListInventoryQuery,
} from './inventory.validators.js';

const refOf = (req: Request) => ({
  itemType: req.params.itemType as ItemType,
  itemId: req.params.id as string,
});

export const createAdminInventoryRouter = (): Router => {
  const router = express.Router();

  router.get(
    '/',
    validate({ query: listInventoryQuerySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await inventoryService.listInventory(req.query as unknown as ListInventoryQuery));
    })
  );

  router.post(
    '/:itemType/:id/adjustments',
    validate({ params: inventoryItemParamsSchema, body: adjustStockBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await inventoryService.adjustStock(
        refOf(req),
        req.body as AdjustStockInput,
        actorOf(req)
      );
      res.json(item);
    })
  );

  router.get(
    '/:itemType/:id/movements',
    validate({ params: inventoryItemParamsSchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await inventoryService.listMovements(refOf(req)));
    })
  );

  return router;
};
