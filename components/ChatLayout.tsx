'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function ChatLayout() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [addEmail, setAddEmail] = useState('')

  // Ensure current user exists in DB
  const upsert = useMutation(api.users.upsertCurrentUser)
  useEffect(() => {
    upsert({}).catch(() => {})
  }, [upsert])

  const contacts = useQuery(api.contacts.listContacts, {})
  const messages = useQuery(
    api.messages.getMessages,
    selectedId ? { otherUserId: selectedId } : 'skip'
  )

  const addContact = useMutation(api.contacts.addContactByEmail)
  const sendMessage = useMutation(api.messages.sendMessage)

  const onAdd = async () => {
    if (!addEmail) return
    try {
      await addContact({ email: addEmail })
      setAddEmail('')
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const onSend = async () => {
    if (!selectedId || !message.trim()) return
    try {
      await sendMessage({ receiverId: selectedId, content: message.trim() })
      setMessage('')
    } catch (e) {
      alert((e as Error).message)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <div className="text-sm text-gray-500">Add a contact by their email</div>
          <div className="flex gap-2">
            <input
              value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              placeholder="Add by email"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            />
            <button onClick={onAdd} className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Add</button>
          </div>
          <div className="mt-2 space-y-1">
            {contacts?.map(c => (
              <button
                key={`${c.ownerId}-${c.contactId}`}
                onClick={() => setSelectedId(c.contactId)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-100 ${selectedId === c.contactId ? 'bg-gray-100' : ''}`}
              >
                <span>{c.contactId}</span>
              </button>
            ))}
            {!contacts && <div className="text-sm text-gray-500">Loading...</div>}
            {contacts?.length === 0 && (
              <div className="text-sm text-gray-500">No contacts yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center">
          <h3 className="text-lg font-semibold">
            {selectedId ? `Chat with ${selectedId}` : 'Select a contact'}
          </h3>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {Array.isArray(messages) && messages.map(m => (
            <div key={m._id} className="max-w-[70%] rounded-lg border p-2">
              <div className="text-sm text-gray-500">{new Date(m.timestamp).toLocaleTimeString()}</div>
              <div>{m.content}</div>
            </div>
          ))}
          {!Array.isArray(messages) && selectedId && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={!selectedId}
              type="text"
              placeholder={selectedId ? 'Type a message...' : 'Select a contact to start chatting'}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button onClick={onSend} disabled={!selectedId} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}