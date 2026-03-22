# Sample Data Guide

## Test Accounts

### Parent Account: `parent@test.com`
- **Password**: `password123`
- **Name**: Maria Santos
- **Role**: PARENT

**Children Enrolled:**
1. **Juan Santos** (Age 4)
   - Program: Playschool AM
   - Status: NEW_STUDENT, PENDING
   - Documents: Birth Certificate, Report Card, Good Moral

2. **Ana Santos** (Age 7)
   - Program: Playschool PM
   - Status: OLD_STUDENT, APPROVED
   - Documents: Birth Certificate, Report Card, Good Moral, Medical Records

### Additional Parent Accounts

#### Parent 2: `parent2@test.com`
- **Password**: `password123`
- **Name**: Rosa Garcia
- **Role**: PARENT

**Children:**
1. **Sofia Garcia** (Age 3)
   - Program: Nursery AM
   - Status: NEW_STUDENT, REJECTED

2. **Miguel Garcia** (Age 5)
   - Program: Kinder AM
   - Status: NEW_STUDENT, PENDING
   - Special Needs: Mild speech delay
   - Documents: Birth Certificate, Special Needs Diagnosis, Medical Records

#### Parent 3: `parent3@test.com`
- **Password**: `password123`
- **Name**: John Smith
- **Role**: PARENT

**Children:**
1. **Emma Smith** (Age 4)
   - Program: Playschool AM
   - Status: NEW_STUDENT, PENDING
   - Citizenship: British (Foreign)
   - Documents: Birth Certificate, School Records

### Admin Accounts

#### Admin: `admin@test.com`
- **Password**: `password123`
- **Name**: Admin User
- **Role**: ADMIN

#### Principal: `principal@test.com`
- **Password**: `password123`
- **Name**: Principal User
- **Role**: PRINCIPAL

## Sample Data Features

### Enrollment Statuses
- **PENDING**: Juan Santos, Miguel Garcia, Emma Smith
- **APPROVED**: Ana Santos
- **REJECTED**: Sofia Garcia

### Student Types
- **NEW_STUDENT**: Juan Santos, Sofia Garcia, Miguel Garcia, Emma Smith
- **OLD_STUDENT**: Ana Santos

### Special Cases
- **Special Needs**: Miguel Garcia (speech delay with therapy documentation)
- **Foreign Citizenship**: Emma Smith (British citizen)
- **Multiple Children**: Santos family (2 children), Garcia family (2 children)

### Document Types
- Birth Certificates
- Report Cards
- Good Moral Certificates
- Medical Records
- Special Needs Diagnosis

### Programs Available
- Playschool AM
- Playschool PM
- Nursery AM
- Kinder AM

## Parent Portal Features to Test

When logged in as `parent@test.com`, you can:

1. **View Submissions**: See all enrollment applications
2. **Check Status**: Monitor approval/rejection status
3. **Upload Documents**: Add required documents
4. **View Details**: See complete enrollment information
5. **Track Progress**: Follow enrollment workflow

## Admin Portal Features to Test

When logged in as `admin@test.com` or `principal@test.com`, you can:

1. **Manage Admissions**: Review and approve/reject applications
2. **View All Students**: See enrolled students
3. **Manage Classes**: Create and assign classes
4. **Teacher Management**: Add and manage teachers (Principal only)
5. **School Settings**: Customize school branding and colors

## How to Reset Data

To reset all sample data:
```bash
npm run db:seed
```

This will clear all existing data and recreate the sample accounts and enrollments.