import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { use } from "react";

export const createSnippet = mutation({
    args:{
        title: v.string(),
        language:v.string(),
        code:v.string(),
    },

    handler: async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity()
        if(!identity) throw new Error("User not Authenticated")

            const user = await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject))
            .first()
        
            if(!user)  throw new Error("User not found")
        
        
        const snippetId = await ctx.db.insert("snippets",{
            userId:identity.subject,
            userName :user.name,
            code:args.code,
            language:args.language,
            title:args.title
        })
        return snippetId;

    }
})