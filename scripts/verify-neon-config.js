#!/usr/bin/env node

/**
 * Verification script for Neon database configuration
 * This script checks that the Prisma schema and environment are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Neon Database Configuration...\n');

let hasErrors = false;

// Check 1: Verify Prisma schema has directUrl
console.log('✓ Checking Prisma schema configuration...');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

if (schemaContent.includes('directUrl = env("DIRECT_URL")')) {
  console.log('  ✅ Prisma schema has directUrl configured for Neon');
} else {
  console.log('  ❌ Prisma schema missing directUrl configuration');
  hasErrors = true;
}

if (schemaContent.includes('provider  = "postgresql"') || schemaContent.includes('provider = "postgresql"')) {
  console.log('  ✅ Database provider is PostgreSQL');
} else {
  console.log('  ❌ Database provider is not PostgreSQL');
  hasErrors = true;
}

// Check 2: Verify .env.example has both URLs
console.log('\n✓ Checking .env.example configuration...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

if (envExampleContent.includes('DATABASE_URL=') && envExampleContent.includes('pgbouncer=true')) {
  console.log('  ✅ .env.example has DATABASE_URL with pgbouncer parameter');
} else {
  console.log('  ❌ .env.example missing DATABASE_URL with pgbouncer parameter');
  hasErrors = true;
}

if (envExampleContent.includes('DIRECT_URL=')) {
  console.log('  ✅ .env.example has DIRECT_URL configured');
} else {
  console.log('  ❌ .env.example missing DIRECT_URL');
  hasErrors = true;
}

// Check 3: Verify Prisma client singleton exists
console.log('\n✓ Checking Prisma client configuration...');
const prismaClientPath = path.join(__dirname, '..', 'src', 'lib', 'prisma.ts');

if (fs.existsSync(prismaClientPath)) {
  const prismaClientContent = fs.readFileSync(prismaClientPath, 'utf-8');
  
  if (prismaClientContent.includes('globalForPrisma.prisma')) {
    console.log('  ✅ Prisma client uses singleton pattern');
  } else {
    console.log('  ⚠️  Prisma client may not use singleton pattern');
  }
  
  if (prismaClientContent.includes('new PrismaClient')) {
    console.log('  ✅ Prisma client is properly instantiated');
  } else {
    console.log('  ❌ Prisma client instantiation not found');
    hasErrors = true;
  }
} else {
  console.log('  ❌ Prisma client file not found at src/lib/prisma.ts');
  hasErrors = true;
}

// Check 4: Verify documentation exists
console.log('\n✓ Checking documentation...');
const docsPath = path.join(__dirname, '..', 'docs', 'NEON_DATABASE_SETUP.md');

if (fs.existsSync(docsPath)) {
  console.log('  ✅ Neon setup documentation exists');
} else {
  console.log('  ⚠️  Neon setup documentation not found');
}

// Check 5: Verify environment variables (if .env exists)
console.log('\n✓ Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (envContent.includes('DATABASE_URL=')) {
    console.log('  ✅ .env has DATABASE_URL configured');
    
    // Check if it looks like a Neon URL
    if (envContent.includes('neon.tech') || envContent.includes('pgbouncer=true')) {
      console.log('  ✅ DATABASE_URL appears to be configured for Neon');
    } else {
      console.log('  ⚠️  DATABASE_URL may not be configured for Neon (missing neon.tech or pgbouncer=true)');
    }
  } else {
    console.log('  ⚠️  .env missing DATABASE_URL (this is expected if not yet configured)');
  }
  
  if (envContent.includes('DIRECT_URL=')) {
    console.log('  ✅ .env has DIRECT_URL configured');
  } else {
    console.log('  ⚠️  .env missing DIRECT_URL (this is expected if not yet configured)');
  }
} else {
  console.log('  ℹ️  .env file not found (create from .env.example and add your Neon credentials)');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Configuration has errors that need to be fixed');
  process.exit(1);
} else {
  console.log('✅ Neon database configuration is properly set up!');
  console.log('\nNext steps:');
  console.log('1. Create .env file from .env.example');
  console.log('2. Add your Neon database credentials (DATABASE_URL and DIRECT_URL)');
  console.log('3. Run: npx prisma generate');
  console.log('4. Run: npx prisma migrate dev --name init');
  console.log('\nSee docs/NEON_DATABASE_SETUP.md for detailed instructions.');
  process.exit(0);
}
