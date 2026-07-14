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
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
