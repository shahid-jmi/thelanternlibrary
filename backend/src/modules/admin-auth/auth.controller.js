import * as authService from './auth.service.js';

export const login = async (req, res) => {
  const token = await authService.loginAdmin(req.body.password);
  res.json({ token });
};
