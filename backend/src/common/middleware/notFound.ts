import type { Request, Response } from 'express';

const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

export default notFound;
