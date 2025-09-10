'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { Send, UserPlus, Users, Search, MoreVertical, MessageCircle, Menu, X } from 'lucide-react'
import { api } from '@/convex/_generated/api'

export default function ChatLayout() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ensure current user exists in DB
  const upsert = useMutation(api.users.upsertCurrentUser)
  const { user } = useUser()
  useEffect(() => {
    const displayName = user?.fullName || user?.firstName || undefined
    const username = user?.username || undefined
    upsert({ name: displayName, username }).catch(() => {})
  }, [upsert, user?.username, user?.fullName, user?.firstName])

  const contacts = useQuery(api.contacts.listContactsWithProfiles, {})
  const messages = useQuery(
    api.messages.getMessagesWithProfiles,
    selectedId ? { otherUserId: selectedId } : 'skip'
  )

  const addContact = useMutation(api.contacts.addContactByEmail)
  const sendMessage = useMutation(api.messages.sendMessage)
  const deleteContact = useMutation(api.contacts.deleteContact)
  const deleteMessage = useMutation(api.messages.deleteMessage)
  const clearConversation = useMutation(api.messages.clearConversation)
  const [visibleDeleteForId, setVisibleDeleteForId] = useState<string | null>(null)
  const hideDeleteTimerRef = useRef<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // Do not auto-open any chat or persist selection

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onAdd = async () => {
    if (!addEmail) return
    try {
      const res = await addContact({ email: addEmail })
      if (res?.ok === false && res.code === 'NOT_FOUND') {
        alert('User not found')
        return
      }
      if (res?.ok === false && res.code === 'SELF') {
        alert("You can't add yourself")
        return
      }
      setAddEmail('')
      setShowAddContact(false)
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
    <div className="flex h-[calc(100dvh-81px)] overscroll-contain bg-gray-50">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {/* Contacts Sidebar */}
      <div
        className={
          `fixed inset-y-0 left-0 z-50 w-80 transform bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 sm:static sm:z-auto sm:w-80 lg:w-96 sm:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        }
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
            </div>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close contacts"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {showAddContact && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-gray-600 font-medium">Add new contact</p>
              <div className="flex gap-2">
                <input
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button 
                  onClick={onAdd} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {contacts?.map(c => (
              <button
                key={`${c.ownerId}-${c.contactId}`}
                onClick={() => { setSelectedId(c.contactId); setIsMobileMenuOpen(false) }}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 group ${
                  selectedId === c.contactId 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt={c.name ?? 'Avatar'}
                      className={`w-10 h-10 rounded-full object-cover border ${
                        selectedId === c.contactId ? 'border-blue-300' : 'border-gray-200'
                      }`}
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      selectedId === c.contactId 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                    }`}>
                      {(c.name ?? c.contactId).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      selectedId === c.contactId ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {c.name ?? c.contactId}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{c.email ?? 'Online'}</p>
                  </div>
                </div>
              </button>
            ))}
            {!contacts && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            {contacts?.length === 0 && (
              <div className="text-center py-8 px-4">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No contacts yet</p>
                <p className="text-xs text-gray-400">Add someone to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col relative">
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const sel = contacts?.find(c => c.contactId === selectedId)
                    if (sel?.avatarUrl) {
                      return (
                        <img
                          src={sel.avatarUrl}
                          alt={sel.name ?? 'Avatar'}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      )
                    }
                    return (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedId.charAt(0).toUpperCase()}
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="font-semibold text-gray-900">{contacts?.find(c => c.contactId === selectedId)?.name ?? selectedId}</h3>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
                <div className="relative flex items-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setMenuOpen(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-gray-200 bg-white shadow-md">
                      <button
                        onClick={async () => {
                          setMenuOpen(false)
                          if (!selectedId) return
                          const ok = confirm('Clear this chat for you? Messages remain for the other user.')
                          if (!ok) return
                          try {
                            await clearConversation({ otherUserId: selectedId })
                          } catch (e) {
                            alert((e as Error).message)
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Clear chat (for you)
                      </button>
                      <div className="h-px bg-gray-100" />
                      <button
                        onClick={async () => {
                          setMenuOpen(false)
                          if (!selectedId) return
                          const ok = confirm('Delete this contact and all chats between you? This removes contact entries for you only.')
                          if (!ok) return
                          try {
                            await deleteContact({ contactId: selectedId })
                            setSelectedId(null)
                          } catch (e) {
                            alert((e as Error).message)
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50 pb-28 sm:pb-0">
              {Array.isArray(messages) && messages.map((m, index) => {
                const isMe = m.senderId !== selectedId
                const showTime = index === 0 || messages[index - 1].timestamp < m.timestamp - 300000 // 5 minutes
                
                return (
                  <div key={m._id} className="space-y-2">
                    {showTime && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative group max-w-[70%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isMe 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md' 
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                        onClick={() => {
                          if (!isMe) return
                          setVisibleDeleteForId(prev => (prev === m._id ? null : m._id))
                          if (hideDeleteTimerRef.current) {
                            window.clearTimeout(hideDeleteTimerRef.current)
                          }
                          hideDeleteTimerRef.current = window.setTimeout(() => {
                            setVisibleDeleteForId(null)
                            hideDeleteTimerRef.current = null
                          }, 3000)
                        }}
                      >
                        <p className="text-[10px] mb-1 opacity-80">{isMe ? 'You' : (m.senderName ?? '')}</p>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        {isMe && (
                          <button
                            onClick={async () => {
                              try {
                                await deleteMessage({ messageId: m._id })
                              } catch (e) {
                                alert((e as Error).message)
                              }
                            }}
                            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow hover:bg-red-700 transition ${
                              visibleDeleteForId === m._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            aria-label="Delete message"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {!Array.isArray(messages) && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:relative sm:p-6 sm:z-auto">
              <div className="mx-auto max-w-3xl flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                      }
                    }}
                    onFocus={() => {
                      // Ensure the input area stays visible when the keyboard opens on mobile
                      setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                      }, 50)
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button 
                  onClick={onSend} 
                  disabled={!message.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4 px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Start a conversation</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a contact from the sidebar to begin chatting, or add a new contact to get started.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile FAB for contacts (always visible) */}
        <button
          className="sm:hidden fixed bottom-24 left-4 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open contacts"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}