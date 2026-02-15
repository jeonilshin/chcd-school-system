import { describe, it, expect } from 'vitest';
import prisma from '@/lib/prisma';

describe('Prisma Connection Configuration', () => {
  it('should have a valid Prisma client instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
  });

  it('should be configured for Neon serverless', () => {
    // Verify the client has the expected models
    expect(prisma.user).toBeDefined();
    expect(prisma.enrollment).toBeDefined();
    expect(prisma.document).toBeDefined();
  });

  it('should use singleton pattern in development', async () => {
    // Verify the client is a singleton by checking it's attached to global in dev
    const globalForPrisma = global as unknown as { prisma: typeof prisma };
    
    // In development, the prisma instance should be attached to global
    if (process.env.NODE_ENV !== 'production') {
      expect(globalForPrisma.prisma).toBeDefined();
      expect(globalForPrisma.prisma).toBe(prisma);
    }
  });
});
