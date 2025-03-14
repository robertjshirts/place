'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

export default function Navbar() {
  return (
    <div className="fixed top-0 w-full bg-[var(--background)] border-b border-gray-300 dark:border-gray-700 py-3 px-4 flex justify-between items-center z-10">
      <Link href="/" className="text-xl font-bold">
        r/place Clone
      </Link>
      <div className="flex items-center gap-2">
        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
