'use client'

import { useState } from 'react'

export default function ChatLayout() {
  return (
    <div className="flex h-screen">
      {/* Users Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Users</h2>
          {/* User list will go here */}
          <div className="mt-4 space-y-2">
            {/* Placeholder users */}
            <div className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div className="ml-3">
                <p className="font-medium">User Name</p>
                <p className="text-sm text-gray-500">Last message...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center">
          <h3 className="text-lg font-semibold">Chat with User</h3>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages will go here */}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}