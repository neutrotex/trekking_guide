'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            🏔️ TrekGuide
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/treks" className="hover:text-green-200 transition">
              Treks
            </Link>
            <Link href="/guides" className="hover:text-green-200 transition">
              Guides
            </Link>
            
            {status === 'loading' ? (
              <span>Loading...</span>
            ) : session ? (
              <>
                <Link 
                  href={session.user.role === 'guide' ? '/dashboard' : '/user-dashboard'} 
                  className="hover:text-green-200 transition"
                >
                  Dashboard
                </Link>
                <span className="text-green-200">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-green-200 transition">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

