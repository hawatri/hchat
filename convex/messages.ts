import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const sendMessage = mutation({
  args: {
    content: v.string(),
    receiverId: v.string(),
  },
  handler: async (ctx, { content, receiverId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const senderId = identity.subject
    // Ensure the receiver is saved as a contact for the sender
    const canChat = await ctx.db
      .query('contacts')
      .filter(q =>
        q.and(
          q.eq(q.field('ownerId'), senderId),
          q.eq(q.field('contactId'), receiverId)
        )
      )
      .first()
    if (!canChat) {
      throw new Error('Add this user as a contact before messaging')
    }
    
    await ctx.db.insert('messages', {
      content,
      senderId,
      receiverId,
      timestamp: Date.now(),
    })

    // Auto-create reciprocal contact so the recipient sees the thread
    const reverse = await ctx.db
      .query('contacts')
      .filter(q =>
        q.and(
          q.eq(q.field('ownerId'), receiverId),
          q.eq(q.field('contactId'), senderId)
        )
      )
      .first()
    if (!reverse) {
      await ctx.db.insert('contacts', {
        ownerId: receiverId,
        contactId: senderId,
        createdAt: Date.now(),
      })
    }
  },
})

export const getMessages = query({
  args: {
    otherUserId: v.string(),
  },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const me = identity.subject
    // Basic OR filter
    const all = await ctx.db
      .query('messages')
      .filter(q =>
        q.or(
          q.and(
            q.eq(q.field('senderId'), me),
            q.eq(q.field('receiverId'), otherUserId)
          ),
          q.and(
            q.eq(q.field('senderId'), otherUserId),
            q.eq(q.field('receiverId'), me)
          )
        )
      )
      .collect()
    all.sort((a, b) => a.timestamp - b.timestamp)
    return all
  },
})

export const getMessagesWithProfiles = query({
  args: { otherUserId: v.string() },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const me = identity.subject

    const msgs = await ctx.db
      .query('messages')
      .filter(q =>
        q.or(
          q.and(q.eq(q.field('senderId'), me), q.eq(q.field('receiverId'), otherUserId)),
          q.and(q.eq(q.field('senderId'), otherUserId), q.eq(q.field('receiverId'), me))
        )
      )
      .collect()

    // Fetch both user profiles
    const meProfile = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), me))
      .first()
    const otherProfile = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), otherUserId))
      .first()

    const senderNameFor = (id: string) => {
      if (id === me) return meProfile?.username ?? meProfile?.name ?? id
      return otherProfile?.username ?? otherProfile?.name ?? id
    }

    msgs.sort((a, b) => a.timestamp - b.timestamp)
    return msgs.map(m => ({
      ...m,
      senderName: senderNameFor(m.senderId),
      receiverName: senderNameFor(m.receiverId),
    }))
  },
})