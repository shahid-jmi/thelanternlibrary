import readline from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Admin from '../modules/admin-auth/admin.model.js';
import * as adminRepository from '../modules/admin-auth/admin.repository.js';

const SALT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const promptForCredentials = async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const email = (await rl.question('Super admin email: ')).trim().toLowerCase();
    const password = await rl.question('Super admin password: ');
    return { email, password };
  } finally {
    rl.close();
  }
};

const createSuperAdmin = async () => {
  const { email, password } = await promptForCredentials();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error(`"${email}" is not a valid email address`);
  }

  if (!password) {
    throw new Error('Password is required');
  }

  await connectDatabase();

  try {
    const existing = await adminRepository.findByEmail(email);

    if (existing) {
      throw new Error(`An admin with email "${email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await Admin.create({
      email,
      passwordHash,
      role: 'super_admin',
      createdBy: null,
      isActive: true,
    });

    console.log(`Super admin created successfully: ${admin.email}`);
  } finally {
    await disconnectDatabase();
  }
};

createSuperAdmin().catch((error) => {
  console.error(`Failed to create super admin: ${error.message}`);
  process.exit(1);
});
