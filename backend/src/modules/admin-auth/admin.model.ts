import mongoose, { Schema, type HydratedDocument, type Types } from 'mongoose';
import { ADMIN_ROLES, type AdminRole } from '../admins/admin.constants.js';

export interface AdminAttrs {
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: Types.ObjectId | null;
  lastLoginAt: Date | null;
  tokenVersion: number;
  mustChangePassword: boolean;
  passwordChangedAt: Date;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
}

export interface AdminLean extends AdminAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<AdminAttrs>;

const adminSchema = new Schema<AdminAttrs>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    lastLoginAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: Date.now },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Reset tokens are looked up by their hash on every reset-password request.
adminSchema.index({ passwordResetTokenHash: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
