import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const sendMessage = mutation({
  args: {
    content: v.string(),
    receiver: v.string(),
  },
  handler: async (ctx, { content, receiver }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    
    await ctx.db.insert('messages', {
      content,
      sender: identity.email,
      receiver,
      timestamp: Date.now(),
    })
  },
})

export const getMessages = query({
  args: {
    otherUser: v.string(),
  },
  handler: async (ctx, { otherUser }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('messages')
      .filter(q => 
        q.or(
          q.and(
            q.eq(q.field('sender'), identity.email),
            q.eq(q.field('receiver'), otherUser)
          ),
          q.and(
            q.eq(q.field('sender'), otherUser),
            q.eq(q.field('receiver'), identity.email)
          )
        )
      )
      .order('desc')
      .collect()
  },
})