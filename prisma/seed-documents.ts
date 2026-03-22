import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding sample documents...');

  // Add documents for enrollment-1 (Juan Santos - PENDING)
  await prisma.document.createMany({
    data: [
      {
        id: 'doc-1-birth-cert',
        enrollmentId: 'enrollment-1',
        type: 'BIRTH_CERTIFICATE',
        fileName: 'juan_santos_birth_certificate.pdf',
        fileSize: 245760, // ~240KB
        fileUrl: '/uploads/documents/enrollment-1/juan_santos_birth_certificate.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-1-report-card',
        enrollmentId: 'enrollment-1',
        type: 'REPORT_CARD',
        fileName: 'juan_santos_report_card.pdf',
        fileSize: 189440, // ~185KB
        fileUrl: '/uploads/documents/enrollment-1/juan_santos_report_card.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-1-good-moral',
        enrollmentId: 'enrollment-1',
        type: 'GOOD_MORAL',
        fileName: 'juan_santos_good_moral.pdf',
        fileSize: 156672, // ~153KB
        fileUrl: '/uploads/documents/enrollment-1/juan_santos_good_moral.pdf',
        mimeType: 'application/pdf',
      },
    ]
  });

  // Add documents for enrollment-2 (Ana Santos - APPROVED)
  await prisma.document.createMany({
    data: [
      {
        id: 'doc-2-birth-cert',
        enrollmentId: 'enrollment-2',
        type: 'BIRTH_CERTIFICATE',
        fileName: 'ana_santos_birth_certificate.pdf',
        fileSize: 267264, // ~261KB
        fileUrl: '/uploads/documents/enrollment-2/ana_santos_birth_certificate.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-2-report-card',
        enrollmentId: 'enrollment-2',
        type: 'REPORT_CARD',
        fileName: 'ana_santos_report_card.pdf',
        fileSize: 198656, // ~194KB
        fileUrl: '/uploads/documents/enrollment-2/ana_santos_report_card.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-2-good-moral',
        enrollmentId: 'enrollment-2',
        type: 'GOOD_MORAL',
        fileName: 'ana_santos_good_moral.pdf',
        fileSize: 145408, // ~142KB
        fileUrl: '/uploads/documents/enrollment-2/ana_santos_good_moral.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-2-medical',
        enrollmentId: 'enrollment-2',
        type: 'MEDICAL_RECORDS',
        fileName: 'ana_santos_medical_records.pdf',
        fileSize: 312320, // ~305KB
        fileUrl: '/uploads/documents/enrollment-2/ana_santos_medical_records.pdf',
        mimeType: 'application/pdf',
      },
    ]
  });

  // Add documents for enrollment-4 (Miguel Garcia - with special needs)
  await prisma.document.createMany({
    data: [
      {
        id: 'doc-4-birth-cert',
        enrollmentId: 'enrollment-4',
        type: 'BIRTH_CERTIFICATE',
        fileName: 'miguel_garcia_birth_certificate.pdf',
        fileSize: 234496, // ~229KB
        fileUrl: '/uploads/documents/enrollment-4/miguel_garcia_birth_certificate.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-4-special-needs',
        enrollmentId: 'enrollment-4',
        type: 'SPECIAL_NEEDS_DIAGNOSIS',
        fileName: 'miguel_garcia_speech_therapy_report.pdf',
        fileSize: 445440, // ~435KB
        fileUrl: '/uploads/documents/enrollment-4/miguel_garcia_speech_therapy_report.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-4-medical',
        enrollmentId: 'enrollment-4',
        type: 'MEDICAL_RECORDS',
        fileName: 'miguel_garcia_medical_records.pdf',
        fileSize: 389120, // ~380KB
        fileUrl: '/uploads/documents/enrollment-4/miguel_garcia_medical_records.pdf',
        mimeType: 'application/pdf',
      },
    ]
  });

  // Add documents for enrollment-5 (Emma Smith - foreign citizenship)
  await prisma.document.createMany({
    data: [
      {
        id: 'doc-5-birth-cert',
        enrollmentId: 'enrollment-5',
        type: 'BIRTH_CERTIFICATE',
        fileName: 'emma_smith_birth_certificate.pdf',
        fileSize: 298752, // ~292KB
        fileUrl: '/uploads/documents/enrollment-5/emma_smith_birth_certificate.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-5-report-card',
        enrollmentId: 'enrollment-5',
        type: 'REPORT_CARD',
        fileName: 'emma_smith_school_records.pdf',
        fileSize: 223232, // ~218KB
        fileUrl: '/uploads/documents/enrollment-5/emma_smith_school_records.pdf',
        mimeType: 'application/pdf',
      },
    ]
  });

  console.log('✅ Added sample documents for all enrollments');
  console.log('📄 Document types included:');
  console.log('  - Birth Certificates');
  console.log('  - Report Cards');
  console.log('  - Good Moral Certificates');
  console.log('  - Medical Records');
  console.log('  - Special Needs Diagnosis');
}

main()
  .catch((e) => {
    console.error('❌ Error adding documents:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });