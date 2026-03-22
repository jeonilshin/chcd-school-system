import { NextAuthOptions, getServerSession as nextGetServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

/**
 * NextAuth configuration with credentials provider for email/password authentication
 * Supports role-based sessions for PARENT, ADMIN, and PRINCIPAL roles
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting to authenticate user:', credentials.email);
          
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          console.log('User found:', { id: user.id, email: user.email, role: user.role });

          // Verify password
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Authentication successful for:', credentials.email);

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token on sign in
      if (user) {
        console.log('JWT callback - adding user to token:', user);
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id and role to session
      if (session.user && token) {
        console.log('Session callback - adding token to session:', token);
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};


/**
 * Get the current server session
 * Use this in server components and API routes to access the authenticated user
 */
export const getServerSession = () => nextGetServerSession(authOptions);
