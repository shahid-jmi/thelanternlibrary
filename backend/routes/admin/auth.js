import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!adminHash) {
      return res.status(500).json({ message: 'Admin password not configured' });
    }

    const isMatch = await bcrypt.compare(password, adminHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
