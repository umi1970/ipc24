import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('contactSubmissions', args);
  },
});
