import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const upsertCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const clerkUserId = identity.subject
    const name = identity.name ?? identity.givenName ?? identity.familyName ?? 'Anonymous'
    const email = identity.email

    const existing = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), clerkUserId))
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, { name, email, lastSeen: Date.now() })
      return existing._id
    }
    return await ctx.db.insert('users', {
      clerkUserId,
      email,
      name,
      lastSeen: Date.now(),
    })
  },
})

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), userId))
      .first()
    return user ?? null
  },
})

export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('email'), email))
      .first()
    return user ?? null
  },
})

