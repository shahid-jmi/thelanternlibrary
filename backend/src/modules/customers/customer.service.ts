import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import AppError from '../../common/errors/AppError.js';
import ConflictError from '../../common/errors/ConflictError.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import UnauthorizedError from '../../common/errors/UnauthorizedError.js';
import ValidationError from '../../common/errors/ValidationError.js';
import logger from '../../common/utils/logger.js';
import Order from '../orders/order.model.js';
import Customer, {
  MAX_ADDRESSES,
  type CustomerAddress,
  type CustomerDocument,
  type CustomerLean,
} from './customer.model.js';
import { createOneTimeToken, hashOneTimeToken, signCustomerToken } from './customer.tokens.js';
import { sendCustomerPasswordResetEmail, sendVerificationEmail } from './customer.emails.js';
import type {
  AddressInput,
  ChangePasswordInput,
  RegisterInput,
  UpdateProfileInput,
} from './customer.validators.js';

const SALT_ROUNDS = 10;
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export interface CustomerAddressDto {
  _id: Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  altPhone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerDto {
  _id: Types.ObjectId;
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  addresses: CustomerAddressDto[];
  createdAt: Date;
}

export interface SessionDto {
  token: string;
  customer: CustomerDto;
}

const toAddressDto = (address: CustomerAddress): CustomerAddressDto => ({
  _id: address._id,
  label: address.label ?? '',
  name: address.name,
  phone: address.phone,
  altPhone: address.altPhone ?? '',
  addressLine: address.addressLine,
  locality: address.locality,
  city: address.city,
  state: address.state,
  pincode: address.pincode,
  isDefault: address.isDefault,
});

export const toCustomerDto = (customer: CustomerLean | CustomerDocument): CustomerDto => ({
  _id: customer._id,
  email: customer.email,
  name: customer.name,
  phone: customer.phone ?? '',
  emailVerified: Boolean(customer.emailVerifiedAt),
  addresses: (customer.addresses ?? []).map((address) => toAddressDto(address as CustomerAddress)),
  createdAt: (customer as CustomerLean).createdAt,
});

const sessionFor = (customer: CustomerDocument): SessionDto => ({
  token: signCustomerToken({ sub: customer._id.toString(), tv: customer.tokenVersion }),
  customer: toCustomerDto(customer),
});

const background = (task: Promise<void>, context: string): void => {
  task.catch((error: unknown) => logger.error({ err: error }, context));
};

const loadCustomer = async (id: string): Promise<CustomerDocument> => {
  const customer = await Customer.findById(id).exec();
  if (!customer || !customer.isActive) throw new UnauthorizedError('Please sign in again');
  return customer;
};

// ── Sign up / sign in ───────────────────────────────────────────────────────

const issueVerification = async (customer: CustomerDocument): Promise<void> => {
  const { raw, hash } = createOneTimeToken();
  customer.emailVerificationTokenHash = hash;
  customer.emailVerificationExpiresAt = new Date(Date.now() + VERIFY_TTL_MS);
  await customer.save();
  background(sendVerificationEmail(customer.email, raw), 'Failed to send verification email');
};

export const register = async (input: RegisterInput): Promise<SessionDto> => {
  if (await Customer.exists({ email: input.email })) {
    throw new ConflictError('An account with this email already exists. Try signing in.');
  }

  let customer: CustomerDocument;
  try {
    customer = await Customer.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS),
      lastLoginAt: new Date(),
    });
  } catch (error) {
    // Two sign-ups with the same email at the same moment.
    if ((error as { code?: number }).code === 11000) {
      throw new ConflictError('An account with this email already exists. Try signing in.');
    }
    throw error;
  }

  await issueVerification(customer);
  return sessionFor(customer);
};

export const login = async (email: string, password: string): Promise<SessionDto> => {
  const customer = await Customer.findOne({ email }).exec();
  // Same message either way, so the form doesn't reveal which emails exist.
  if (!customer || !customer.isActive || !(await bcrypt.compare(password, customer.passwordHash))) {
    throw new UnauthorizedError('Incorrect email or password');
  }
  customer.lastLoginAt = new Date();
  await customer.save();
  return sessionFor(customer);
};

export const getMe = async (customerId: string): Promise<CustomerDto> =>
  toCustomerDto(await loadCustomer(customerId));

// ── Email verification ──────────────────────────────────────────────────────

export const resendVerification = async (customerId: string): Promise<void> => {
  const customer = await loadCustomer(customerId);
  if (customer.emailVerifiedAt) return;
  await issueVerification(customer);
};

export const verifyEmail = async (rawToken: string): Promise<CustomerDto> => {
  const customer = await Customer.findOneAndUpdate(
    {
      emailVerificationTokenHash: hashOneTimeToken(rawToken),
      emailVerificationExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    },
    { new: true }
  ).exec();

  if (!customer) throw new UnauthorizedError('This link is invalid or has expired');

  // The customer has now proven they own this email, so orders they placed
  // as a guest with it can safely show up in their account.
  await Order.updateMany(
    { customer: null, customerEmail: customer.email },
    { $set: { customer: customer._id } }
  ).exec();

  return toCustomerDto(customer);
};

// ── Passwords ───────────────────────────────────────────────────────────────

const issuePasswordReset = async (email: string): Promise<void> => {
  const customer = await Customer.findOne({ email }).exec();
  if (!customer || !customer.isActive) return;
  const { raw, hash } = createOneTimeToken();
  customer.passwordResetTokenHash = hash;
  customer.passwordResetExpiresAt = new Date(Date.now() + RESET_TTL_MS);
  await customer.save();
  await sendCustomerPasswordResetEmail(customer.email, raw);
};

// Not awaited: an unknown email returns as fast as a real one, so response
// timing doesn't reveal who has an account.
export const requestPasswordReset = (email: string): void => {
  background(issuePasswordReset(email), 'Failed to issue customer password reset');
};

export const resetPassword = async (rawToken: string, newPassword: string): Promise<void> => {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const customer = await Customer.findOneAndUpdate(
    {
      passwordResetTokenHash: hashOneTimeToken(rawToken),
      passwordResetExpiresAt: { $gt: new Date() },
    },
    {
      $set: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
      $inc: { tokenVersion: 1 },
    },
    { new: true }
  ).exec();
  if (!customer) throw new UnauthorizedError('This reset link is invalid or has expired');
};

export const changePassword = async (
  customerId: string,
  input: ChangePasswordInput
): Promise<SessionDto> => {
  const customer = await loadCustomer(customerId);
  if (!(await bcrypt.compare(input.currentPassword, customer.passwordHash))) {
    throw new AppError('Current password is incorrect', 400);
  }
  customer.passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  customer.passwordResetTokenHash = null;
  customer.passwordResetExpiresAt = null;
  // Sign out every other device, keep this one signed in with a fresh token.
  customer.tokenVersion += 1;
  await customer.save();
  return sessionFor(customer);
};

// ── Profile and addresses ───────────────────────────────────────────────────

export const updateProfile = async (
  customerId: string,
  input: UpdateProfileInput
): Promise<CustomerDto> => {
  const customer = await loadCustomer(customerId);
  customer.name = input.name;
  customer.phone = input.phone;
  await customer.save();
  return toCustomerDto(customer);
};

const makeDefault = (customer: CustomerDocument, addressId: Types.ObjectId): void => {
  for (const address of customer.addresses) {
    address.isDefault = address._id.equals(addressId);
  }
};

const findAddress = (customer: CustomerDocument, addressId: string): CustomerAddress => {
  const address = customer.addresses.find((item) => item._id.equals(addressId));
  if (!address) throw new NotFoundError('Address not found');
  return address;
};

export const addAddress = async (customerId: string, input: AddressInput): Promise<CustomerDto> => {
  const customer = await loadCustomer(customerId);
  if (customer.addresses.length >= MAX_ADDRESSES) {
    throw new ValidationError('Validation failed', [
      { path: 'addresses', msg: `You can save up to ${MAX_ADDRESSES} addresses` },
    ]);
  }
  const _id = new Types.ObjectId();
  customer.addresses.push({ ...input, _id, isDefault: false });
  // The first address is always the default.
  if (input.isDefault || customer.addresses.length === 1) makeDefault(customer, _id);
  await customer.save();
  return toCustomerDto(customer);
};

export const updateAddress = async (
  customerId: string,
  addressId: string,
  input: AddressInput
): Promise<CustomerDto> => {
  const customer = await loadCustomer(customerId);
  const address = findAddress(customer, addressId);
  const { isDefault, ...fields } = input;
  Object.assign(address, fields);
  if (isDefault) makeDefault(customer, address._id);
  await customer.save();
  return toCustomerDto(customer);
};

export const deleteAddress = async (
  customerId: string,
  addressId: string
): Promise<CustomerDto> => {
  const customer = await loadCustomer(customerId);
  const address = findAddress(customer, addressId);
  customer.addresses = customer.addresses.filter((item) => !item._id.equals(address._id));
  const next = customer.addresses[0];
  if (address.isDefault && next) makeDefault(customer, next._id);
  await customer.save();
  return toCustomerDto(customer);
};
