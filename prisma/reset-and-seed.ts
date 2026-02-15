import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting all data...');

  // Delete all data in order (respecting foreign key constraints)
  await prisma.document.deleteMany({});
  console.log('   ✓ Deleted all documents');

  await prisma.enrollment.deleteMany({});
  console.log('   ✓ Deleted all enrollments');

  await prisma.teacher.deleteMany({});
  console.log('   ✓ Deleted all teachers');

  await prisma.user.deleteMany({});
  console.log('   ✓ Deleted all users');

  console.log('\n👤 Creating principal account...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create principal user
  const principal = await prisma.user.create({
    data: {
      id: 'principal_jeon',
      email: 'jeon@admin.com',
      name: 'Jeon Principal',
      password: hashedPassword,
      role: 'PRINCIPAL',
    },
  });

  console.log('   ✓ Created principal account');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: jeon@admin.com');
  console.log('   Password: password123');
  console.log('   Role: PRINCIPAL');

  console.log('\n🎓 Creating sample teachers...');

  const teachers = [
    {
      id: 'tchr_001',
      name: 'Floyd Miles',
      email: 'floyd.miles@school.com',
      phone: '+123 9988',
      address: 'TA-107 Newyork',
      subject: 'Mathematics',
      class: '01',
      employeeId: '0021',
      profileUrl: null,
    },
    {
      id: 'tchr_002',
      name: 'Jane Cooper',
      email: 'jane.cooper@school.com',
      phone: '+123 7988',
      address: 'Australia, Sydney',
      subject: 'English',
      class: '02',
      employeeId: '0011',
      profileUrl: null,
    },
    {
      id: 'tchr_003',
      name: 'Jenny Wilson',
      email: 'jenny.wilson@school.com',
      phone: '+123 7988',
      address: 'TA-107 Newyork',
      subject: 'Physics',
      class: '03',
      employeeId: '0031',
      profileUrl: null,
    },
    {
      id: 'tchr_004',
      name: 'Annette Black',
      email: 'annette.black@school.com',
      phone: '+123 5988',
      address: 'Australia, Sydney',
      subject: 'Literature',
      class: '04',
      employeeId: '0022',
      profileUrl: null,
    },
    {
      id: 'tchr_005',
      name: 'Arlene McCoy',
      email: 'arlene.mccoy@school.com',
      phone: '+123 4948',
      address: 'TA-107 Newyork',
      subject: 'Mathematics',
      class: '04',
      employeeId: '0013',
      profileUrl: null,
    },
  ];

  for (const teacher of teachers) {
    await prisma.teacher.create({
      data: teacher,
    });
  }

  console.log(`   ✓ Created ${teachers.length} sample teachers`);

  console.log('\n✅ Database reset complete!');
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
