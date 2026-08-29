import bcrypt from 'bcryptjs';
// The Admin model/repository live in admin-auth, not here — there is one
// Admin entity, and admin-auth owns it since login/session logic needs it
// too. This module only adds account-management operations on top.
import * as adminRepository from '../admin-auth/admin.repository.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import AppError from '../../common/errors/AppError.js';
import { generateTemporaryPassword } from '../../common/utils/password.js';
import { toAdminDto, type AdminDto } from './admin.mapper.js';
import type { AdminRole } from './admin.constants.js';
import type { CreateAdminInput } from './admin.validators.js';

const SALT_ROUNDS = 10;

const assertNotSelf = (targetId: string, requestingAdminId: string, message: string): void => {
  if (targetId === requestingAdminId) {
    throw new AppError(message, 400);
  }
};

export const listAdmins = async (): Promise<AdminDto[]> => {
  const admins = await adminRepository.findAll();
  return admins.map(toAdminDto);
};

export const createAdmin = async (
  { email, password, role }: CreateAdminInput,
  requestingAdminId: string
): Promise<AdminDto> => {
  const existing = await adminRepository.findByEmail(email);

  if (existing) {
    throw new AppError('An admin with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await adminRepository.createAdmin({
    email,
    passwordHash,
    role,
    createdBy: requestingAdminId,
    // The password a super admin sets here is a temporary one — the new
    // admin must set their own on first login.
    mustChangePassword: true,
  });

  return toAdminDto(admin);
};

export const deleteAdmin = async (id: string, requestingAdminId: string): Promise<void> => {
  assertNotSelf(id, requestingAdminId, 'You cannot delete your own account');

  const deleted = await adminRepository.deleteById(id);

  if (!deleted) {
    throw new NotFoundError('Admin not found');
  }
};

export const deactivateAdmin = async (id: string, requestingAdminId: string): Promise<AdminDto> => {
  assertNotSelf(id, requestingAdminId, 'You cannot deactivate your own account');

  const admin = await adminRepository.deactivateById(id);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};

export const reactivateAdmin = async (id: string): Promise<AdminDto> => {
  const admin = await adminRepository.reactivateById(id);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};

export const updateAdminRole = async (
  id: string,
  role: AdminRole,
  requestingAdminId: string
): Promise<AdminDto> => {
  assertNotSelf(id, requestingAdminId, 'You cannot change your own role');

  const admin = await adminRepository.updateRoleById(id, role);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};

export const forcePasswordReset = async (
  id: string,
  requestingAdminId: string
): Promise<{ temporaryPassword: string }> => {
  assertNotSelf(id, requestingAdminId, 'You cannot force a password reset on your own account');

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

  const admin = await adminRepository.forcePasswordResetById(id, passwordHash);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  // Returned once and never persisted in plaintext — this is the admin's
  // only chance to see it.
  return { temporaryPassword };
};
