import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const addContact = mutation({
  args: { contactId: v.string() },
  handler: async (ctx, { contactId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const ownerId = identity.subject
    if (ownerId === contactId) throw new Error('Cannot add yourself')

    // Validate the contact exists as a user
    const contactUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), contactId))
      .first()
    if (!contactUser) throw new Error('No user exists with that ID')

    const existing = await ctx.db
      .query('contacts')
      .filter(q =>
        q.and(
          q.eq(q.field('ownerId'), ownerId),
          q.eq(q.field('contactId'), contactId)
        )
      )
      .first()
    if (existing) return existing._id

    return await ctx.db.insert('contacts', {
      ownerId,
      contactId,
      createdAt: Date.now(),
    })
  },
})

export const listContacts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const ownerId = identity.subject
    return await ctx.db
      .query('contacts')
      .filter(q => q.eq(q.field('ownerId'), ownerId))
      .collect()
  },
})

export const addContactByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const ownerId = identity.subject

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('email'), email))
      .first()
    if (!user) {
      return { ok: false as const, code: 'NOT_FOUND' as const }
    }
    if (user.clerkUserId === ownerId) {
      return { ok: false as const, code: 'SELF' as const }
    }

    const existing = await ctx.db
      .query('contacts')
      .filter(q =>
        q.and(
          q.eq(q.field('ownerId'), ownerId),
          q.eq(q.field('contactId'), user.clerkUserId)
        )
      )
      .first()
    if (existing) return { ok: true as const, code: 'EXISTS' as const }

    await ctx.db.insert('contacts', {
      ownerId,
      contactId: user.clerkUserId,
      createdAt: Date.now(),
    })
    return { ok: true as const, code: 'CREATED' as const }
  },
})

export const listContactsWithProfiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const ownerId = identity.subject

    const contacts = await ctx.db
      .query('contacts')
      .filter(q => q.eq(q.field('ownerId'), ownerId))
      .collect()

    const results = await Promise.all(
      contacts.map(async (c) => {
        const user = await ctx.db
          .query('users')
          .filter(q => q.eq(q.field('clerkUserId'), c.contactId))
          .first()
        return {
          ownerId: c.ownerId,
          contactId: c.contactId,
          createdAt: c.createdAt,
          name: user?.username ?? user?.name ?? c.contactId,
          email: user?.email ?? null,
          avatarUrl: user?.avatarUrl ?? null,
        }
      })
    )

    return results
  },
})

export const deleteContact = mutation({
  args: { contactId: v.string() },
  handler: async (ctx, { contactId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const ownerId = identity.subject

    // Remove the contact entry
    const contact = await ctx.db
      .query('contacts')
      .filter(q => q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('contactId'), contactId)
      ))
      .first()
    if (contact) {
      await ctx.db.delete(contact._id)
    }

    // Delete all messages between the two users
    const msgs1 = await ctx.db
      .query('messages')
      .filter(q => q.and(
        q.eq(q.field('senderId'), ownerId),
        q.eq(q.field('receiverId'), contactId)
      ))
      .collect()
    const msgs2 = await ctx.db
      .query('messages')
      .filter(q => q.and(
        q.eq(q.field('senderId'), contactId),
        q.eq(q.field('receiverId'), ownerId)
      ))
      .collect()
    for (const m of [...msgs1, ...msgs2]) {
      await ctx.db.delete(m._id)
    }

    return { deletedContact: Boolean(contact), deletedMessages: msgs1.length + msgs2.length }
  },
})

