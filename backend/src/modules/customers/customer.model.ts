import mongoose, { Schema, type HydratedDocument, type Types } from 'mongoose';
import { INDIAN_STATES } from '../orders/order.constants.js';

export const MAX_ADDRESSES = 10;

export interface CustomerAddress {
  _id: Types.ObjectId;
  // e.g. "Home", "Office". Optional.
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

export interface CustomerAttrs {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  emailVerificationTokenHash: string | null;
  emailVerificationExpiresAt: Date | null;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  // Bumped on password change/reset so every older login stops working.
  tokenVersion: number;
  lastLoginAt: Date | null;
  addresses: CustomerAddress[];
}

export interface CustomerLean extends CustomerAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerDocument = HydratedDocument<CustomerAttrs>;

const addressSchema = new Schema<CustomerAddress>({
  label: { type: String, trim: true, default: '' },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  altPhone: { type: String, trim: true, default: '' },
  addressLine: { type: String, required: true, trim: true },
  locality: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, enum: INDIAN_STATES, required: true },
  pincode: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
});

const customerSchema = new Schema<CustomerAttrs>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

customerSchema.index({ emailVerificationTokenHash: 1 });
customerSchema.index({ passwordResetTokenHash: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
