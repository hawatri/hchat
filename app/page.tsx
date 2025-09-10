'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import ChatLayout from '@/components/ChatLayout'

export default function Home() {
  return (
    <main className="p-6">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <h1 className="text-2xl font-semibold">Welcome to hchat</h1>
          <SignInButton mode="modal">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Sign in</button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-semibold">hchat</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        <ChatLayout />
      </Authenticated>
    </main>
  )
}