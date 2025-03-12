import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveExecutions = mutation({
    args: {
        language: v.string(),
        code: v.string(),
        //we could have eihter one of the,or both 
        output: v.optional(v.string()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new ConvexError("Not Authenticated")

        //chcek pro status
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first()

        if (!user?.isPro && args.language !== "javascript") {
            throw new ConvexError("Pro subscription is required")

        }
      await ctx.db.insert("codeExecutions",{
        ...args,
        userId:identity.subject,

      })
    }
})