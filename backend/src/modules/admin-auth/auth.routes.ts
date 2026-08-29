import express, { type Router } from 'express';
import rateLimit from 'express-rate-limit';
import validate from '../../common/middleware/validate.js';
import authenticateAdmin from '../../common/middleware/authenticateAdmin.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { changePassword, forgotPassword, login, resetPassword } from './auth.controller.js';
import {
  changePasswordBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  resetPasswordBodySchema,
} from './auth.validators.js';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts, please try again later.' },
});

// Generous enough for a genuine forgotten password (a couple of retries for
// typos), tight enough to blunt email-bombing an admin's inbox.
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests, please try again later.' },
});

// The reset token itself is unguessable (256 bits), so this is defense in
// depth rather than the primary control.
const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts, please try again later.' },
});

const router: Router = express.Router();

router.post('/login', loginRateLimiter, validate({ body: loginBodySchema }), asyncHandler(login));

router.post(
  '/change-password',
  authenticateAdmin,
  validate({ body: changePasswordBodySchema }),
  asyncHandler(changePassword)
);

router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validate({ body: forgotPasswordBodySchema }),
  asyncHandler(forgotPassword)
);

router.post(
  '/reset-password',
  resetPasswordRateLimiter,
  validate({ body: resetPasswordBodySchema }),
  asyncHandler(resetPassword)
);

export default router;
