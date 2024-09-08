'use client';

import { signOut } from 'firebase/auth';
import Link from 'next/link';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { auth } from '@/firebase';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="text-center">
      <h1 className="mb-5 text-center font-bold">
        How to Add One-Time Password Phone Authentication
      </h1>
      {user ? (
        <h2>Welcome to the App as a logged in as User {user?.uid}</h2>
      ) : (
        <h2>You are not logged in</h2>
      )}
      {user ? (
        <Button onClick={() => signOut(auth)} className="mt-10"></Button>
      ) : (
        <Link href={'/login'}>
          <Button className="mt-10">Sign In</Button>
        </Link>
      )}
    </main>
  );
}
