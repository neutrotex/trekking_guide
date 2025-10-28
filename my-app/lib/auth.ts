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
            throw new Error('Please enter your email and password');
          }

          // Check if environment variables are loaded
          if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in environment variables');
            throw new Error('Database configuration not found');
          }

          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Error in NextAuth authorize:', error);
          throw new Error(error.message || 'Authentication failed');
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
