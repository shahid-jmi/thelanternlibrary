import Admin, { type AdminAttrs, type AdminDocument, type AdminLean } from './admin.model.js';
import type { AdminRole } from '../admins/admin.constants.js';

export interface CreateAdminRecord {
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdBy: string | null;
}

export const findByEmail = async (email: string): Promise<AdminDocument | null> =>
  Admin.findOne({ email: email.toLowerCase() }).exec();

export const findById = async (id: string): Promise<AdminDocument | null> =>
  Admin.findById(id).exec();

export const findByIdLean = async (id: string): Promise<AdminLean | null> =>
  Admin.findById(id).lean<AdminLean>().exec();

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
