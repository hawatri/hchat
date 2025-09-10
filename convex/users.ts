import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const upsertCurrentUser = mutation({
  args: { name: v.optional(v.string()), username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const clerkUserId = identity.subject
    const email = identity.email
    const avatarUrl = (identity as any).profileUrl ?? (identity as any).pictureUrl ?? undefined
    const emailLocalPart = email ? email.split('@')[0] : undefined
    const derivedName = args.name ?? identity.name ?? identity.givenName ?? identity.familyName ?? emailLocalPart ?? 'Anonymous'
    const name = derivedName
    const username = args.username ?? emailLocalPart
    // email already computed above

    const existing = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkUserId'), clerkUserId))
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, { name, username, email, avatarUrl, lastSeen: Date.now() })
      return existing._id
    }
    return await ctx.db.insert('users', {
      clerkUserId,
      email,
      username,
      name,
      avatarUrl,
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

