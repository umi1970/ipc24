import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  blogPosts: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    bodyMdx: v.string(),
    publishedAt: v.number(),
    updatedAt: v.number(),
    status: v.union(v.literal('draft'), v.literal('published')),
    tags: v.array(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_status_publishedAt', ['status', 'publishedAt']),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    receivedAt: v.number(),
    notifiedResendId: v.optional(v.string()),
  }).index('by_receivedAt', ['receivedAt']),
});
