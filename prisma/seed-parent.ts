import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Creating parent account...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create parent user
  const parent = await prisma.user.upsert({
    where: { email: 'parent@test.com' },
    update: {},
    create: {
      id: 'parent_maria',
      email: 'parent@test.com',
      name: 'Maria Santos (Parent)',
      password: hashedPassword,
      role: 'PARENT',
    },
  });

  console.log('   ✓ Created parent account');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: parent@test.com');
  console.log('   Password: password123');
  console.log('   Role: PARENT');
  console.log('\n✅ Parent account created!');
  console.log('\n🚀 You can now login at: http://localhost:3000/auth/signin');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
