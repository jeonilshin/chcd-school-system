# Database Seeding

This directory contains the database seed script for the Student Enrollment System.

## Overview

The seed script (`seed.ts`) populates the database with test data for development and testing purposes.

## What Gets Seeded

### Test Users

The script creates three test users with different roles:

1. **Parent User**
   - Email: `parent@test.com`
   - Password: `password123`
   - Role: PARENT
   - Has 2 enrollments

2. **Admin User**
   - Email: `admin@test.com`
   - Password: `password123`
   - Role: ADMIN

3. **Principal User**
   - Email: `principal@test.com`
   - Password: `password123`
   - Role: PRINCIPAL

4. **Additional Parent Users**
   - Email: `parent2@test.com` (Rosa Garcia)
   - Email: `parent3@test.com` (John Smith)
   - Password: `password123`
   - Role: PARENT

### Sample Enrollments

The script creates 5 diverse enrollment records:

1. **Juan Santos** (NEW_STUDENT, PENDING)
   - Filipino citizenship
   - Multiple special skills
   - Complete parent information
   - Sibling information included

2. **Ana Santos** (OLD_STUDENT, APPROVED)
   - Same family as Juan
   - Different program and skills
   - Approved status for testing

3. **Sofia Garcia** (NEW_STUDENT, REJECTED)
   - Different family
   - Rejected status for testing
   - Minimal optional fields

4. **Miguel Garcia** (NEW_STUDENT, PENDING)
   - Same family as Sofia
   - **Includes special needs diagnosis**
   - Tests special needs handling

5. **Emma Smith** (NEW_STUDENT, PENDING)
   - **Foreign citizenship (British)**
   - International family
   - Tests citizenship specification field

## Running the Seed Script

### Using npm script (recommended)

```bash
npm run db:seed
```

### Verifying the seeded data

After seeding, you can verify the data was created correctly:

```bash
npm run db:verify
```

This will display:
- All created users with their roles
- All enrollments with their details
- Summary statistics

### Using Prisma CLI directly

```bash
npx prisma db seed
```

### Manual execution

```bash
npx tsx prisma/seed.ts
```

## Important Notes

- **Data Clearing**: The seed script clears all existing data before seeding. This ensures a clean state but will delete any existing records.
- **Password**: All test users use the password `password123` (hashed with bcrypt)
- **IDs**: The script uses predictable IDs for easier testing (e.g., `parent-user-1`, `enrollment-1`)
- **Profile Pictures**: Profile picture URLs are set but the actual files are not created. You'll need to handle file uploads separately in your tests.

## Testing Scenarios Covered

The seed data supports testing:

- ✅ Parent role with multiple enrollments
- ✅ Admin and Principal roles
- ✅ Different enrollment statuses (PENDING, APPROVED, REJECTED)
- ✅ Old vs New student types
- ✅ Filipino and foreign citizenship
- ✅ Special needs diagnosis
- ✅ Various special skills combinations
- ✅ Complete and minimal parent information
- ✅ Sibling information
- ✅ Different programs and school years
- ✅ Multiple marital status options

## Modifying the Seed Data

To add or modify seed data:

1. Edit `prisma/seed.ts`
2. Add new users or enrollments following the existing patterns
3. Run `npm run db:seed` to apply changes

## Resetting the Database

To completely reset your database and reseed:

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Recreate it
3. Run all migrations
4. Run the seed script automatically
