import type { Request, Response } from 'express';
import * as instagramService from './instagram.service.js';

export const listRecentPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await instagramService.getRecentPosts();
  // The service already caches upstream; this just spares repeat page views.
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ posts });
};
