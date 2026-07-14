import type { NextFunction, Request, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncHandler =
  (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

export default asyncHandler;
