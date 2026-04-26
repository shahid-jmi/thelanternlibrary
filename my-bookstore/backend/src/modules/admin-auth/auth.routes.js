import express from 'express';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { login } from './auth.controller.js';
import { loginValidators } from './auth.validators.js';

const router = express.Router();

router.post('/login', validate(loginValidators), asyncHandler(login));

export default router;
