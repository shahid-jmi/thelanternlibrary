import express, { type Request, type Response, type Router } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../../config/env.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import { authenticateCustomer } from '../../common/middleware/authenticateCustomer.js';
import * as customerService from './customer.service.js';
import * as orderService from '../orders/order.service.js';
import {
  addressBodySchema,
  addressIdParamsSchema,
  changePasswordBodySchema,
  customerOrderParamsSchema,
  forgotPasswordBodySchema,
  listCustomerOrdersQuerySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  tokenBodySchema,
  updateProfileBodySchema,
  type AddressInput,
  type ChangePasswordInput,
  type ListCustomerOrdersQuery,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
} from './customer.validators.js';

const limiter = (limit: number, message: string, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skip: () => env.nodeEnv === 'test',
    message: { message },
  });

const loginLimiter = limiter(10, 'Too many sign-in attempts. Please try again later.', true);
const registerLimiter = limiter(
  5,
  'Too many sign-ups from this connection. Please try again later.'
);
const emailLimiter = limiter(5, 'Too many emails requested. Please try again later.');
const tokenLimiter = limiter(20, 'Too many attempts. Please try again later.', true);

const customerId = (req: Request): string => req.customer!.id;

export const createCustomerRouter = (): Router => {
  const router = express.Router();

  // ── Public ──
  router.post(
    '/register',
    registerLimiter,
    validate({ body: registerBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.status(201).json(await customerService.register(req.body as RegisterInput));
    })
  );
  router.post(
    '/login',
    loginLimiter,
    validate({ body: loginBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body as LoginInput;
      res.json(await customerService.login(email, password));
    })
  );
  router.post(
    '/verify-email',
    tokenLimiter,
    validate({ body: tokenBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await customerService.verifyEmail((req.body as { token: string }).token));
    })
  );
  router.post(
    '/forgot-password',
    emailLimiter,
    validate({ body: forgotPasswordBodySchema }),
    (req: Request, res: Response) => {
      customerService.requestPasswordReset((req.body as { email: string }).email);
      // Same answer whether or not the account exists.
      res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
    }
  );
  router.post(
    '/reset-password',
    tokenLimiter,
    validate({ body: resetPasswordBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      const { token, newPassword } = req.body as { token: string; newPassword: string };
      await customerService.resetPassword(token, newPassword);
      res.json({ message: 'Password updated. You can sign in now.' });
    })
  );

  // ── Signed in ──
  const signedIn = express.Router();
  signedIn.use(asyncHandler(authenticateCustomer));

  signedIn.get(
    '/me',
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await customerService.getMe(customerId(req)));
    })
  );
  signedIn.patch(
    '/me',
    validate({ body: updateProfileBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(
        await customerService.updateProfile(customerId(req), req.body as UpdateProfileInput)
      );
    })
  );
  signedIn.post(
    '/resend-verification',
    emailLimiter,
    asyncHandler(async (req: Request, res: Response) => {
      await customerService.resendVerification(customerId(req));
      res.json({ message: 'Verification email sent.' });
    })
  );
  signedIn.post(
    '/change-password',
    loginLimiter,
    validate({ body: changePasswordBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(
        await customerService.changePassword(customerId(req), req.body as ChangePasswordInput)
      );
    })
  );

  signedIn.post(
    '/addresses',
    validate({ body: addressBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res
        .status(201)
        .json(await customerService.addAddress(customerId(req), req.body as AddressInput));
    })
  );
  signedIn.put(
    '/addresses/:addressId',
    validate({ params: addressIdParamsSchema, body: addressBodySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(
        await customerService.updateAddress(
          customerId(req),
          req.params.addressId as string,
          req.body as AddressInput
        )
      );
    })
  );
  signedIn.delete(
    '/addresses/:addressId',
    validate({ params: addressIdParamsSchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(
        await customerService.deleteAddress(customerId(req), req.params.addressId as string)
      );
    })
  );

  signedIn.get(
    '/orders',
    validate({ query: listCustomerOrdersQuerySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      const { page, pageSize } = req.query as unknown as ListCustomerOrdersQuery;
      res.json(await orderService.listCustomerOrders(customerId(req), page, pageSize));
    })
  );
  signedIn.get(
    '/orders/:id',
    validate({ params: customerOrderParamsSchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await orderService.getCustomerOrder(customerId(req), req.params.id as string));
    })
  );
  signedIn.get(
    '/orders/:id/receipt',
    validate({ params: customerOrderParamsSchema }),
    asyncHandler(async (req: Request, res: Response) => {
      const { order, pdf } = await orderService.getCustomerReceiptPdf(
        customerId(req),
        req.params.id as string
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="receipt-${order.orderNumber}.pdf"`
      );
      res.send(pdf);
    })
  );

  router.use(signedIn);
  return router;
};
