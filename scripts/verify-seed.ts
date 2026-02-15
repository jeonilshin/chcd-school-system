import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying seeded data...\n');

  // Check users
  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
  });
  
  console.log(`✅ Users (${users.length}):`);
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.role})`);
  });

  // Check enrollments
  const enrollments = await prisma.enrollment.findMany({
    include: {
      User: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\n✅ Enrollments (${enrollments.length}):`);
  enrollments.forEach(enrollment => {
    console.log(`  - ${enrollment.firstName} ${enrollment.lastName}`);
    console.log(`    Status: ${enrollment.status}, Student Type: ${enrollment.studentStatus}`);
    console.log(`    Program: ${enrollment.program}, School Year: ${enrollment.schoolYear}`);
    console.log(`    Parent: ${enrollment.User.email}`);
    if (enrollment.specialNeedsDiagnosis) {
      console.log(`    Special Needs: ${enrollment.specialNeedsDiagnosis}`);
    }
    if (enrollment.citizenship === 'FOREIGNER') {
      console.log(`    Citizenship: ${enrollment.citizenshipSpecification}`);
    }
    console.log('');
  });

  // Summary statistics
  const pendingCount = enrollments.filter(e => e.status === 'PENDING').length;
  const approvedCount = enrollments.filter(e => e.status === 'APPROVED').length;
  const rejectedCount = enrollments.filter(e => e.status === 'REJECTED').length;
  const newStudentCount = enrollments.filter(e => e.studentStatus === 'NEW_STUDENT').length;
  const oldStudentCount = enrollments.filter(e => e.studentStatus === 'OLD_STUDENT').length;

  console.log('📊 Summary:');
  console.log(`  - Pending: ${pendingCount}`);
  console.log(`  - Approved: ${approvedCount}`);
  console.log(`  - Rejected: ${rejectedCount}`);
  console.log(`  - New Students: ${newStudentCount}`);
  console.log(`  - Old Students: ${oldStudentCount}`);

  console.log('\n✨ Verification complete!');
}

verify()
  .catch((e) => {
    console.error('❌ Error verifying data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
