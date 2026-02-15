import { Role } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth types to include role in session and token
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
