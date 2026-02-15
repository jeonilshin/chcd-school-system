import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.document.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('Creating test users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  const parentUser = await prisma.user.create({
    data: {
      id: 'parent-user-1',
      email: 'parent@test.com',
      name: 'Maria Santos',
      password: hashedPassword,
      role: 'PARENT',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-1',
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const principalUser = await prisma.user.create({
    data: {
      id: 'principal-user-1',
      email: 'principal@test.com',
      name: 'Principal User',
      password: hashedPassword,
      role: 'PRINCIPAL',
    },
  });

  console.log('✅ Created users:');
  console.log(`  - Parent: ${parentUser.email} (password: password123)`);
  console.log(`  - Admin: ${adminUser.email} (password: password123)`);
  console.log(`  - Principal: ${principalUser.email} (password: password123)`);

  // Create sample enrollment data
  console.log('\nCreating sample enrollment data...');

  const enrollment1 = await prisma.enrollment.create({
    data: {
      id: 'enrollment-1',
      userId: parentUser.id,
      schoolYear: '2024-2025',
      program: 'Playschool AM',
      studentStatus: 'NEW_STUDENT',
      status: 'PENDING',
      
      // Personal Information
      lastName: 'Santos',
      firstName: 'Juan',
      middleName: 'Dela Cruz',
      nameExtension: 'Jr.',
      nickname: 'Juanito',
      sex: 'MALE',
      age: 4,
      birthday: new Date('2020-03-15'),
      placeOfBirth: 'Manila, Philippines',
      religion: 'Roman Catholic',
      presentAddress: '123 Main Street, Quezon City, Metro Manila',
      contactNumber: '+639171234567',
      citizenship: 'FILIPINO',
      
      // Parent Information
      fatherFullName: 'Pedro Santos',
      fatherOccupation: 'Engineer',
      fatherContactNumber: '+639171234567',
      fatherEmail: 'pedro.santos@email.com',
      fatherEducationalAttainment: 'COLLEGE_GRADUATE',
      motherFullName: 'Maria Dela Cruz Santos',
      motherOccupation: 'Teacher',
      motherContactNumber: '+639187654321',
      motherEmail: 'maria.santos@email.com',
      motherEducationalAttainment: 'COLLEGE_GRADUATE',
      maritalStatus: ['MARRIED'],
      
      // Student History
      siblingsInformation: 'One older sister, Ana Santos, 7 years old',
      totalLearnersInHousehold: 2,
      lastSchoolPreschoolName: 'Little Stars Preschool',
      lastSchoolPreschoolAddress: '456 School Ave, Quezon City',
      lastSchoolElementaryName: 'N/A',
      lastSchoolElementaryAddress: null,
      
      // Student Skills and Special Needs
      specialSkills: ['SINGING', 'DANCING', 'COMPUTER'],
      specialNeedsDiagnosis: null,
      
      // Enrollment Agreement
      responsiblePersonName: 'Maria Dela Cruz Santos',
      responsiblePersonContactNumber: '+639187654321',
      responsiblePersonEmail: 'maria.santos@email.com',
      relationshipToStudent: 'Mother',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      
      // Profile Picture
      profilePictureUrl: '/uploads/profile-pictures/enrollment-1/profile.jpg',
      
      updatedAt: new Date(),
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      id: 'enrollment-2',
      userId: parentUser.id,
      schoolYear: '2024-2025',
      program: 'Playschool PM',
      studentStatus: 'OLD_STUDENT',
      status: 'APPROVED',
      
      // Personal Information
      lastName: 'Santos',
      firstName: 'Ana',
      middleName: 'Dela Cruz',
      nameExtension: null,
      nickname: 'Annie',
      sex: 'FEMALE',
      age: 7,
      birthday: new Date('2017-08-22'),
      placeOfBirth: 'Manila, Philippines',
      religion: 'Roman Catholic',
      presentAddress: '123 Main Street, Quezon City, Metro Manila',
      contactNumber: '+639171234567',
      citizenship: 'FILIPINO',
      
      // Parent Information
      fatherFullName: 'Pedro Santos',
      fatherOccupation: 'Engineer',
      fatherContactNumber: '+639171234567',
      fatherEmail: 'pedro.santos@email.com',
      fatherEducationalAttainment: 'COLLEGE_GRADUATE',
      motherFullName: 'Maria Dela Cruz Santos',
      motherOccupation: 'Teacher',
      motherContactNumber: '+639187654321',
      motherEmail: 'maria.santos@email.com',
      motherEducationalAttainment: 'COLLEGE_GRADUATE',
      maritalStatus: ['MARRIED'],
      
      // Student History
      siblingsInformation: 'One younger brother, Juan Santos, 4 years old',
      totalLearnersInHousehold: 2,
      lastSchoolPreschoolName: 'Circular Home Child Development',
      lastSchoolPreschoolAddress: '789 Education St, Quezon City',
      lastSchoolElementaryName: 'N/A',
      lastSchoolElementaryAddress: null,
      
      // Student Skills and Special Needs
      specialSkills: ['COMPOSITION_WRITING', 'PUBLIC_SPEAKING', 'ACTING'],
      specialNeedsDiagnosis: null,
      
      // Enrollment Agreement
      responsiblePersonName: 'Maria Dela Cruz Santos',
      responsiblePersonContactNumber: '+639187654321',
      responsiblePersonEmail: 'maria.santos@email.com',
      relationshipToStudent: 'Mother',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      
      // Profile Picture
      profilePictureUrl: '/uploads/profile-pictures/enrollment-2/profile.jpg',
      
      updatedAt: new Date(),
    },
  });

  // Create another parent with different data
  const parentUser2 = await prisma.user.create({
    data: {
      id: 'parent-user-2',
      email: 'parent2@test.com',
      name: 'Rosa Garcia',
      password: hashedPassword,
      role: 'PARENT',
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      id: 'enrollment-3',
      userId: parentUser2.id,
      schoolYear: '2024-2025',
      program: 'Nursery AM',
      studentStatus: 'NEW_STUDENT',
      status: 'REJECTED',
      
      // Personal Information
      lastName: 'Garcia',
      firstName: 'Sofia',
      middleName: 'Reyes',
      nameExtension: null,
      nickname: 'Sofi',
      sex: 'FEMALE',
      age: 3,
      birthday: new Date('2021-11-10'),
      placeOfBirth: 'Makati, Philippines',
      religion: 'Christian',
      presentAddress: '789 Oak Street, Makati City, Metro Manila',
      contactNumber: '+639191112222',
      citizenship: 'FILIPINO',
      
      // Parent Information
      fatherFullName: 'Carlos Garcia',
      fatherOccupation: 'Business Owner',
      fatherContactNumber: '+639191112222',
      fatherEmail: 'carlos.garcia@email.com',
      fatherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
      motherFullName: 'Rosa Reyes Garcia',
      motherOccupation: null,
      motherContactNumber: '+639193334444',
      motherEmail: 'rosa.garcia@email.com',
      motherEducationalAttainment: 'COLLEGE_UNDERGRAD',
      maritalStatus: ['MARRIED'],
      
      // Student History
      siblingsInformation: null,
      totalLearnersInHousehold: 1,
      lastSchoolPreschoolName: 'Happy Kids Daycare',
      lastSchoolPreschoolAddress: null,
      lastSchoolElementaryName: 'N/A',
      lastSchoolElementaryAddress: null,
      
      // Student Skills and Special Needs
      specialSkills: ['SINGING', 'COOKING'],
      specialNeedsDiagnosis: null,
      
      // Enrollment Agreement
      responsiblePersonName: 'Rosa Reyes Garcia',
      responsiblePersonContactNumber: '+639193334444',
      responsiblePersonEmail: 'rosa.garcia@email.com',
      relationshipToStudent: 'Mother',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      
      // Profile Picture
      profilePictureUrl: '/uploads/profile-pictures/enrollment-3/profile.jpg',
      
      updatedAt: new Date(),
    },
  });

  // Create enrollment with special needs
  const enrollment4 = await prisma.enrollment.create({
    data: {
      id: 'enrollment-4',
      userId: parentUser2.id,
      schoolYear: '2025-2026',
      program: 'Kinder AM',
      studentStatus: 'NEW_STUDENT',
      status: 'PENDING',
      
      // Personal Information
      lastName: 'Garcia',
      firstName: 'Miguel',
      middleName: 'Reyes',
      nameExtension: null,
      nickname: 'Miggy',
      sex: 'MALE',
      age: 5,
      birthday: new Date('2019-05-20'),
      placeOfBirth: 'Makati, Philippines',
      religion: 'Christian',
      presentAddress: '789 Oak Street, Makati City, Metro Manila',
      contactNumber: '+639191112222',
      citizenship: 'FILIPINO',
      
      // Parent Information
      fatherFullName: 'Carlos Garcia',
      fatherOccupation: 'Business Owner',
      fatherContactNumber: '+639191112222',
      fatherEmail: 'carlos.garcia@email.com',
      fatherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
      motherFullName: 'Rosa Reyes Garcia',
      motherOccupation: null,
      motherContactNumber: '+639193334444',
      motherEmail: 'rosa.garcia@email.com',
      motherEducationalAttainment: 'COLLEGE_UNDERGRAD',
      maritalStatus: ['MARRIED'],
      
      // Student History
      siblingsInformation: 'One younger sister, Sofia Garcia, 3 years old',
      totalLearnersInHousehold: 2,
      lastSchoolPreschoolName: 'Bright Beginnings Preschool',
      lastSchoolPreschoolAddress: '321 Learning Lane, Makati City',
      lastSchoolElementaryName: 'N/A',
      lastSchoolElementaryAddress: null,
      
      // Student Skills and Special Needs
      specialSkills: ['COMPUTER', 'POEM_WRITING'],
      specialNeedsDiagnosis: 'Mild speech delay - currently receiving speech therapy',
      
      // Enrollment Agreement
      responsiblePersonName: 'Rosa Reyes Garcia',
      responsiblePersonContactNumber: '+639193334444',
      responsiblePersonEmail: 'rosa.garcia@email.com',
      relationshipToStudent: 'Mother',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      
      // Profile Picture
      profilePictureUrl: '/uploads/profile-pictures/enrollment-4/profile.jpg',
      
      updatedAt: new Date(),
    },
  });

  // Create enrollment with foreign citizenship
  const parentUser3 = await prisma.user.create({
    data: {
      id: 'parent-user-3',
      email: 'parent3@test.com',
      name: 'John Smith',
      password: hashedPassword,
      role: 'PARENT',
    },
  });

  const enrollment5 = await prisma.enrollment.create({
    data: {
      id: 'enrollment-5',
      userId: parentUser3.id,
      schoolYear: '2024-2025',
      program: 'Playschool AM',
      studentStatus: 'NEW_STUDENT',
      status: 'PENDING',
      
      // Personal Information
      lastName: 'Smith',
      firstName: 'Emma',
      middleName: 'Grace',
      nameExtension: null,
      nickname: 'Em',
      sex: 'FEMALE',
      age: 4,
      birthday: new Date('2020-07-14'),
      placeOfBirth: 'London, United Kingdom',
      religion: 'Christian',
      presentAddress: '456 International Village, Bonifacio Global City, Taguig',
      contactNumber: '+639195556666',
      citizenship: 'FOREIGNER',
      citizenshipSpecification: 'British',
      
      // Parent Information
      fatherFullName: 'John Smith',
      fatherOccupation: 'Software Developer',
      fatherContactNumber: '+639195556666',
      fatherEmail: 'john.smith@email.com',
      fatherEducationalAttainment: 'COLLEGE_GRADUATE',
      motherFullName: 'Sarah Johnson Smith',
      motherOccupation: 'Marketing Manager',
      motherContactNumber: '+639197778888',
      motherEmail: 'sarah.smith@email.com',
      motherEducationalAttainment: 'COLLEGE_GRADUATE',
      maritalStatus: ['MARRIED'],
      
      // Student History
      siblingsInformation: null,
      totalLearnersInHousehold: 1,
      lastSchoolPreschoolName: 'International Preschool Manila',
      lastSchoolPreschoolAddress: '123 Global St, BGC, Taguig',
      lastSchoolElementaryName: 'N/A',
      lastSchoolElementaryAddress: null,
      
      // Student Skills and Special Needs
      specialSkills: ['COMPUTER', 'PUBLIC_SPEAKING', 'OTHER'],
      specialNeedsDiagnosis: null,
      
      // Enrollment Agreement
      responsiblePersonName: 'Sarah Johnson Smith',
      responsiblePersonContactNumber: '+639197778888',
      responsiblePersonEmail: 'sarah.smith@email.com',
      relationshipToStudent: 'Mother',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      
      // Profile Picture
      profilePictureUrl: '/uploads/profile-pictures/enrollment-5/profile.jpg',
      
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created sample enrollments:');
  console.log(`  - ${enrollment1.firstName} ${enrollment1.lastName} (${enrollment1.studentStatus}, ${enrollment1.status})`);
  console.log(`  - ${enrollment2.firstName} ${enrollment2.lastName} (${enrollment2.studentStatus}, ${enrollment2.status})`);
  console.log(`  - ${enrollment3.firstName} ${enrollment3.lastName} (${enrollment3.studentStatus}, ${enrollment3.status})`);
  console.log(`  - ${enrollment4.firstName} ${enrollment4.lastName} (${enrollment4.studentStatus}, ${enrollment4.status}) - with special needs`);
  console.log(`  - ${enrollment5.firstName} ${enrollment5.lastName} (${enrollment5.studentStatus}, ${enrollment5.status}) - foreign citizenship`);

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
