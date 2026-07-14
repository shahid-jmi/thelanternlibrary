import express from 'express';
import rateLimit from 'express-rate-limit';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { login } from './auth.controller.js';
import { loginValidators } from './auth.validators.js';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts, please try again later.' },
});

const router = express.Router();

router.post('/login', loginRateLimiter, validate(loginValidators), asyncHandler(login));

export default router;
