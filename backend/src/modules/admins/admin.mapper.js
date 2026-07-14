export const toAdminDto = (admin) => ({
  _id: admin._id,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  createdBy: admin.createdBy,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});
