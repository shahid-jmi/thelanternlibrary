import Admin from './admin.model.js';

export const findByEmail = async (email) => Admin.findOne({ email: email.toLowerCase() }).exec();

export const findById = async (id) => Admin.findById(id).exec();

export const findByIdLean = async (id) => Admin.findById(id).lean().exec();

export const findAll = async () => Admin.find().sort({ createdAt: -1 }).lean().exec();

export const createAdmin = async (payload) => {
  const created = await Admin.create(payload);
  return created.toObject();
};

export const deleteById = async (id) => Admin.findByIdAndDelete(id).lean().exec();

export const deactivateById = async (id) =>
  Admin.findByIdAndUpdate(
    id,
    { isActive: false, $inc: { tokenVersion: 1 } },
    { new: true, runValidators: true, lean: true }
  ).exec();

export const reactivateById = async (id) =>
  Admin.findByIdAndUpdate(id, { isActive: true }, { new: true, runValidators: true, lean: true }).exec();

export const updateRoleById = async (id, role) =>
  Admin.findByIdAndUpdate(id, { role }, { new: true, runValidators: true, lean: true }).exec();
