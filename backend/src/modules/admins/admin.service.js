import bcrypt from 'bcryptjs';
import * as adminRepository from '../admin-auth/admin.repository.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import AppError from '../../common/errors/AppError.js';
import { toAdminDto } from './admin.mapper.js';

const SALT_ROUNDS = 10;

const assertNotSelf = (targetId, requestingAdminId, message) => {
  if (targetId === requestingAdminId.toString()) {
    throw new AppError(message, 400);
  }
};

export const listAdmins = async () => {
  const admins = await adminRepository.findAll();
  return admins.map(toAdminDto);
};

export const createAdmin = async ({ email, password, role }, requestingAdminId) => {
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
  });

  return toAdminDto(admin);
};

export const deleteAdmin = async (id, requestingAdminId) => {
  assertNotSelf(id, requestingAdminId, 'You cannot delete your own account');

  const deleted = await adminRepository.deleteById(id);

  if (!deleted) {
    throw new NotFoundError('Admin not found');
  }
};

export const deactivateAdmin = async (id, requestingAdminId) => {
  assertNotSelf(id, requestingAdminId, 'You cannot deactivate your own account');

  const admin = await adminRepository.deactivateById(id);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};

export const reactivateAdmin = async (id) => {
  const admin = await adminRepository.reactivateById(id);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};

export const updateAdminRole = async (id, role, requestingAdminId) => {
  assertNotSelf(id, requestingAdminId, 'You cannot change your own role');

  const admin = await adminRepository.updateRoleById(id, role);

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return toAdminDto(admin);
};
