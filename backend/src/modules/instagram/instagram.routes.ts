import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { listRecentPosts } from './instagram.controller.js';

export const createPublicInstagramRouter = (): Router => {
  const router = express.Router();

  router.get('/', asyncHandler(listRecentPosts));

  return router;
};
