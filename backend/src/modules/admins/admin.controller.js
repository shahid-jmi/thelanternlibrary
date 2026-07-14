import * as adminService from './admin.service.js';

export const listAdmins = async (req, res) => {
  const admins = await adminService.listAdmins();
  res.json(admins);
};

export const createAdmin = async (req, res) => {
  const admin = await adminService.createAdmin(req.body, req.admin.id);
  res.status(201).json(admin);
};

export const deleteAdmin = async (req, res) => {
  await adminService.deleteAdmin(req.params.id, req.admin.id);
  res.json({ message: 'Admin deleted' });
};

export const deactivateAdmin = async (req, res) => {
  const admin = await adminService.deactivateAdmin(req.params.id, req.admin.id);
  res.json(admin);
};

export const reactivateAdmin = async (req, res) => {
  const admin = await adminService.reactivateAdmin(req.params.id);
  res.json(admin);
};

export const updateAdminRole = async (req, res) => {
  const admin = await adminService.updateAdminRole(req.params.id, req.body.role, req.admin.id);
  res.json(admin);
};
