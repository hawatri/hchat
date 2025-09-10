import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  messages: defineTable({
    content: v.string(),
    senderId: v.string(),
    receiverId: v.string(),
    timestamp: v.number(),
  })
    .index('by_sender', ['senderId'])
    .index('by_receiver', ['receiverId']),

  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    lastSeen: v.number(),
  }).index('by_clerkUserId', ['clerkUserId']),

  contacts: defineTable({
    ownerId: v.string(),
    contactId: v.string(),
    createdAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_owner_contact', ['ownerId', 'contactId']),

  clears: defineTable({
    ownerId: v.string(),
    otherUserId: v.string(),
    clearedAt: v.number(),
  })
    .index('by_owner_other', ['ownerId', 'otherUserId']),
})