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
    if (!user) throw new Error('No user exists with that email')
    if (user.clerkUserId === ownerId) throw new Error('Cannot add yourself')

    const existing = await ctx.db
      .query('contacts')
      .filter(q =>
        q.and(
          q.eq(q.field('ownerId'), ownerId),
          q.eq(q.field('contactId'), user.clerkUserId)
        )
      )
      .first()
    if (existing) return existing._id

    return await ctx.db.insert('contacts', {
      ownerId,
      contactId: user.clerkUserId,
      createdAt: Date.now(),
    })
  },
})

