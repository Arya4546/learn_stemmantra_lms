import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME;

  if (!email || !password || !fullName) {
    console.error('❌ ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_FULL_NAME must be set in .env');
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (existingAdmin) {
    console.log(`✔ Admin already exists (${existingAdmin.email}). Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`✔ Default admin created: ${email}`);
}
