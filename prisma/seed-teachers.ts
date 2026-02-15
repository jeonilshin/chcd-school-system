import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding teachers...');

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
    await prisma.teacher.upsert({
      where: { id: teacher.id },
      update: teacher,
      create: teacher,
    });
  }

  console.log('Teachers seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
