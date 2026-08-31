import Admin, { type AdminAttrs, type AdminDocument, type AdminLean } from './admin.model.js';
import type { AdminRole } from '../admins/admin.constants.js';

export interface CreateAdminRecord {
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdBy: string | null;
  mustChangePassword?: boolean;
}

export const findByEmail = async (email: string): Promise<AdminDocument | null> =>
  Admin.findOne({ email: email.toLowerCase() }).exec();

export const findById = async (id: string): Promise<AdminDocument | null> =>
  Admin.findById(id).exec();

export const findByIdLean = async (id: string): Promise<AdminLean | null> =>
  Admin.findById(id).lean<AdminLean>().exec();

export const findByResetTokenHash = async (tokenHash: string): Promise<AdminDocument | null> =>
  Admin.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).exec();

export const findAll = async (): Promise<AdminLean[]> =>
  Admin.find().sort({ createdAt: -1 }).lean<AdminLean[]>().exec();

export const createAdmin = async (payload: CreateAdminRecord): Promise<AdminLean> => {
  const created = await Admin.create(payload as unknown as Partial<AdminAttrs>);
  return created.toObject() as unknown as AdminLean;
};

export const deleteById = async (id: string): Promise<AdminLean | null> =>
  Admin.findByIdAndDelete(id).lean<AdminLean>().exec();

export const deactivateById = async (id: string): Promise<AdminLean | null> =>
  Admin.findByIdAndUpdate(
    id,
    { isActive: false, $inc: { tokenVersion: 1 } },
    { new: true, runValidators: true }
  )
    .lean<AdminLean>()
    .exec();

export const reactivateById = async (id: string): Promise<AdminLean | null> =>
  Admin.findByIdAndUpdate(id, { isActive: true }, { new: true, runValidators: true })
    .lean<AdminLean>()
    .exec();

export const updateRoleById = async (id: string, role: AdminRole): Promise<AdminLean | null> =>
  Admin.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
    .lean<AdminLean>()
    .exec();

// Used for the super-admin "force password reset" flow. Bumping tokenVersion
// invalidates any sessions the admin already holds, mirroring deactivateById
// — a forced reset is a signal the current credentials may be compromised.
export const forcePasswordResetById = async (
  id: string,
  passwordHash: string
): Promise<AdminLean | null> =>
  Admin.findByIdAndUpdate(
    id,
    {
      passwordHash,
      mustChangePassword: true,
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      $inc: { tokenVersion: 1 },
    },
    { new: true, runValidators: true }
  )
    .lean<AdminLean>()
    .exec();
