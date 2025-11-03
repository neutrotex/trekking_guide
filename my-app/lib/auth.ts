import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import connectDB from '@/lib/mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials: email or password not provided');
            return null;
          }

          // Check if environment variables are loaded
          if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in environment variables');
            return null;
          }

          await connectDB();
          
          // Normalize email to lowercase for case-insensitive comparison
          const normalizedEmail = credentials.email.toLowerCase().trim();
          const user = await UserModel.findOne({ email: normalizedEmail });

          if (!user) {
            console.error(`User not found: ${normalizedEmail}`);
            return null;
          }

          if (!user.password) {
            console.error(`User password not set for: ${normalizedEmail}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error(`Invalid password for user: ${normalizedEmail}`);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Error in NextAuth authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
};
