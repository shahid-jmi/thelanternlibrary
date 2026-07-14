import type { Request, Response } from 'express';
import * as adminService from './admin.service.js';
import type { CreateAdminInput, UpdateRoleInput } from './admin.validators.js';

export const listAdmins = async (req: Request, res: Response): Promise<void> => {
  const admins = await adminService.listAdmins();
  res.json(admins);
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const admin = await adminService.createAdmin(req.body as CreateAdminInput, req.admin!.id);
  res.status(201).json(admin);
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  await adminService.deleteAdmin(req.params.id as string, req.admin!.id);
  res.json({ message: 'Admin deleted' });
};

export const deactivateAdmin = async (req: Request, res: Response): Promise<void> => {
  const admin = await adminService.deactivateAdmin(req.params.id as string, req.admin!.id);
  res.json(admin);
};

export const reactivateAdmin = async (req: Request, res: Response): Promise<void> => {
  const admin = await adminService.reactivateAdmin(req.params.id as string);
  res.json(admin);
};

export const updateAdminRole = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body as UpdateRoleInput;
  const admin = await adminService.updateAdminRole(req.params.id as string, role, req.admin!.id);
  res.json(admin);
};
