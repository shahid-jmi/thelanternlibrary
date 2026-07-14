import type { Types } from 'mongoose';
import type { AdminLean } from '../admin-auth/admin.model.js';
import type { AdminRole } from './admin.constants.js';

export interface AdminDto {
  _id: Types.ObjectId;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: Types.ObjectId | null;
  lastLoginAt: Date | null;
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
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});
