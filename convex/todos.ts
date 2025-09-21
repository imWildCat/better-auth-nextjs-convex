import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identiy = await authComponent.safeGetAuthUser(ctx);
    if (!identiy) {
      throw new Error("Not authenticated with safeGetAuthUser");
    }
    console.log("identiy for create:", identiy);
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    const now = Date.now();
    await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      userId: identiy._id!,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const identity = await authComponent.safeGetAuthUser(ctx);
    if (!identity) {
      throw new Error("Not authenticated with safeGetAuthUser");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== (identity._id ?? identity.userId)) {
      throw new Error("Todo not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const identity = await authComponent.safeGetAuthUser(ctx);
    if (!identity) {
      throw new Error("Not authenticated with safeGetAuthUser");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== (identity._id ?? identity.userId)) {
      throw new Error("Todo not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
