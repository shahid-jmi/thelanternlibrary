import type { Types } from 'mongoose';
// See the note in admin.service.ts — the Admin model lives in admin-auth.
import type { AdminLean } from '../admin-auth/admin.model.js';
import type { AdminRole } from './admin.constants.js';

export interface AdminDto {
  _id: Types.ObjectId;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: Types.ObjectId | null;
  lastLoginAt: Date | null;
  mustChangePassword: boolean;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const toAdminDto = (admin: AdminLean): AdminDto => ({
  _id: admin._id,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  createdBy: admin.createdBy,
  lastLoginAt: admin.lastLoginAt,
  mustChangePassword: Boolean(admin.mustChangePassword),
  passwordChangedAt: admin.passwordChangedAt,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});
