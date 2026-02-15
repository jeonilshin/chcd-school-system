import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth API route handler
 * Handles all authentication requests including sign in, sign out, and session management
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
