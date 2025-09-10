import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  messages: defineTable({
    content: v.string(),
    sender: v.string(),
    receiver: v.string(),
    timestamp: v.number(),
  }),
  users: defineTable({
    email: v.string(),
    name: v.string(),
    lastSeen: v.number(),
  })
})