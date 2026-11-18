import express, { type Request, type Response, type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { startOfDayIst, startOfMonthIst } from '../../common/utils/dates.js';
import * as orderRepository from '../orders/order.repository.js';
import { countStockAlerts } from '../inventory/inventory.service.js';

export interface DashboardDto {
  orders: { toShip: number; needsAttention: number; unpaid: number; placedToday: number };
  // Sum of order totals whose payment was recorded in the period (Indian time).
  revenue: { today: number; thisMonth: number };
  stock: { lowStock: number; outOfStock: number };
}

const getDashboard = async (): Promise<DashboardDto> => {
  const today = startOfDayIst();
  const month = startOfMonthIst();

  const [toShip, needsAttention, unpaid, placedToday, revenueToday, revenueMonth, stock] =
    await Promise.all([
      orderRepository.countByView('to_ship'),
      orderRepository.countByView('attention'),
      orderRepository.countByView('unpaid'),
      orderRepository.countCreatedSince(today),
      orderRepository.sumPaidTotals(today),
      orderRepository.sumPaidTotals(month),
      countStockAlerts(),
    ]);

  return {
    orders: { toShip, needsAttention, unpaid, placedToday },
    revenue: { today: revenueToday, thisMonth: revenueMonth },
    stock,
  };
};

export const createAdminDashboardRouter = (): Router => {
  const router = express.Router();
  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await getDashboard());
    })
  );
  return router;
};
