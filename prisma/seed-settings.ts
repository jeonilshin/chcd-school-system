import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding school settings...');

  const settings = await prisma.schoolSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      schoolName: 'School',
      primaryColor: '#3B82F6'
    }
  });

  console.log('School settings created:', settings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
