# Neon Database Setup Guide

This document explains how to configure the Student Enrollment System to work with Neon serverless PostgreSQL.

## Overview

Neon is a serverless PostgreSQL database that provides:
- Automatic scaling
- Connection pooling via PgBouncer
- Branching for development environments
- Instant database provisioning

## Connection Configuration

### Two Connection Strings

Neon requires two different connection strings for optimal performance:

1. **DATABASE_URL** (Pooled Connection)
   - Used by the application at runtime
   - Routes through PgBouncer connection pooler
   - Optimized for serverless functions
   - Includes `pgbouncer=true` parameter
   - Format: `postgresql://username:password@host-pooler.region.aws.neon.tech:5432/database?sslmode=require&pgbouncer=true`

2. **DIRECT_URL** (Direct Connection)
   - Used by Prisma migrations and schema operations
   - Bypasses connection pooler
   - Required for DDL operations (CREATE, ALTER, DROP)
   - Format: `postgresql://username:password@host.region.aws.neon.tech:5432/database?sslmode=require`

### Why Two URLs?

- **Pooled connection** (DATABASE_URL): Serverless functions create many short-lived connections. PgBouncer pools these connections to avoid exhausting database connection limits.
- **Direct connection** (DIRECT_URL): Migrations need direct database access because PgBouncer in transaction mode doesn't support all PostgreSQL features required for schema changes.

## Setup Instructions

### 1. Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy both connection strings from the Neon dashboard:
   - Pooled connection (with `-pooler` in hostname)
   - Direct connection (without `-pooler`)

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Pooled connection for application runtime
DATABASE_URL="postgresql://username:password@host-pooler.region.aws.neon.tech:5432/database?sslmode=require&pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgresql://username:password@host.region.aws.neon.tech:5432/database?sslmode=require"
```

**Important**: Replace the placeholder values with your actual Neon credentials.

### 3. Verify Prisma Configuration

The `prisma/schema.prisma` file should have:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations using DIRECT_URL
npx prisma migrate dev --name init

# Or for production
npx prisma migrate deploy
```

## Prisma Client Configuration

The application uses a singleton Prisma Client instance (`src/lib/prisma.ts`) that:

1. **Prevents connection exhaustion** in development by reusing the same client instance
2. **Enables query logging** in development for debugging
3. **Optimizes for serverless** by not maintaining persistent connections

### Usage in API Routes

```typescript
import prisma from '@/lib/prisma';

export async function GET() {
  const enrollments = await prisma.enrollment.findMany();
  return Response.json(enrollments);
}
```

## Connection Pooling Details

### PgBouncer Configuration

Neon's PgBouncer is configured in **transaction mode**:
- Each query runs in its own transaction
- Connections are returned to the pool after each transaction
- Ideal for serverless functions that execute quickly

### Connection Limits

- **Free tier**: 100 concurrent connections
- **Pro tier**: Higher limits available
- Connection pooling ensures you stay within limits even with many serverless function invocations

## Best Practices

### 1. Always Use the Singleton Client

```typescript
// ✅ Good - Use the singleton
import prisma from '@/lib/prisma';

// ❌ Bad - Creates new client instances
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### 2. Close Connections in Long-Running Scripts

For CLI scripts or seed files:

```typescript
import prisma from '@/lib/prisma';

async function main() {
  // Your database operations
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3. Use Transactions for Related Operations

```typescript
await prisma.$transaction(async (tx) => {
  const enrollment = await tx.enrollment.create({ data: enrollmentData });
  await tx.document.createMany({ data: documents });
});
```

### 4. Handle Connection Errors

```typescript
try {
  const result = await prisma.enrollment.findMany();
  return result;
} catch (error) {
  if (error.code === 'P1001') {
    // Can't reach database server
    console.error('Database connection failed');
  }
  throw error;
}
```

## Troubleshooting

### "Can't reach database server" Error

**Cause**: DATABASE_URL is incorrect or database is not accessible

**Solution**:
1. Verify DATABASE_URL in `.env` matches Neon dashboard
2. Check that `sslmode=require` is included
3. Ensure your IP is not blocked (Neon allows all IPs by default)

### "Prepared statement already exists" Error

**Cause**: Using pooled connection for migrations

**Solution**: Ensure DIRECT_URL is set and Prisma is using it for migrations

### Connection Pool Exhausted

**Cause**: Too many concurrent connections

**Solution**:
1. Verify you're using the singleton Prisma client
2. Check for connection leaks (missing `$disconnect()` in scripts)
3. Consider upgrading Neon tier for higher connection limits

### Migration Fails with "pgbouncer cannot be used"

**Cause**: Trying to run migrations through pooled connection

**Solution**: Ensure `directUrl` is configured in `schema.prisma` and DIRECT_URL is set in `.env`

## Development vs Production

### Development
- Use Neon's branch feature to create isolated development databases
- Enable query logging for debugging
- Use `prisma migrate dev` for schema changes

### Production
- Use `prisma migrate deploy` for applying migrations
- Disable query logging for performance
- Monitor connection usage in Neon dashboard
- Set up database backups

## Testing

For testing, you can:

1. **Use a separate Neon branch** (recommended)
   ```bash
   # Create a test branch in Neon dashboard
   # Update .env.test with test branch credentials
   ```

2. **Use a local PostgreSQL instance**
   ```bash
   # For faster test execution
   DATABASE_URL="postgresql://localhost:5432/test_db"
   ```

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon Guide](https://www.prisma.io/docs/guides/database/neon)
- [Connection Pooling Best Practices](https://neon.tech/docs/connect/connection-pooling)
- [Serverless PostgreSQL Guide](https://neon.tech/docs/serverless/serverless-driver)

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment variables** in production (Vercel, Railway, etc.)
3. **Rotate credentials** if accidentally exposed
4. **Enable IP allowlist** in Neon dashboard for production (optional)
5. **Use read-only credentials** for reporting/analytics queries

## Summary

The Neon configuration provides:
- ✅ Automatic connection pooling for serverless environments
- ✅ Separate URLs for runtime and migrations
- ✅ Optimized Prisma Client singleton pattern
- ✅ Production-ready setup with proper error handling
- ✅ Development-friendly with query logging

This configuration ensures the Student Enrollment System can scale efficiently while maintaining database connection limits.
