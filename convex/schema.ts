import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users:defineTable({
        userId:v.string(), // here v is validator of convex nd userId is our clerkId
        name:v.string(),
        email:v.string(),
        isPro:v.boolean(),
        proSince:v.optional(v.number()),
        lemonSqueezyCustomerId: v.optional(v.string()),
        lemonSqueezyOrderId: v.optional(v.string()),

    }).index("by_user_id",["userId"]),
    // in future when we want to fetch user we can call get user by_user_id

    codeExecutions:defineTable({
        userId:v.string(),
        language:v.string(),
        code:v.string(),
        output:v.optional(v.string()),
        error:v.optional(v.string()),

    }).index("by_user_id",["userId"]),

    snippets:defineTable({
        userId:v.string(),
        title:v.string(),
        language:v.string(),
        code:v.string(),
        userName:v.string(), //stores user name or easy access
    }).index("by_user_id",["userId"]),


    snippetComments:defineTable({
        snippetId:v.id("snippets"),// typesafe
        userId:v.string(),
        userName:v.string(),
        content:v.string(),// This woll store the Html content
    }).index("by_snippet_id",["snippetId"]),

    stars:defineTable({
        userId:v.id("users"),
        snippetId:v.id("snippets"),
    })
    // this will several indexes
    .index("by_user_id",["userId"])
    .index("by_snippet_id",["snippetId"])
    .index("by_userId_and_snippet_id",["userId","snippetId"])
    

})