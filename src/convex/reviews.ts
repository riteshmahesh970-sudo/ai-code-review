import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    repoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const reviewId = await ctx.db.insert("reviews", {
      userId: identity.subject,
      repoUrl: args.repoUrl,
      status: "pending",
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

export const updateStatus = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("reasoning"),
      v.literal("auditing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { status: args.status });
  },
});

export const complete = mutation({
  args: {
    reviewId: v.id("reviews"),
    executionMetadata: v.object({
      tokensConsumed: v.number(),
      latencyMs: v.number(),
      agentsInvoked: v.array(v.string()),
      cacheHit: v.boolean(),
    }),
    reviewSummary: v.object({
      status: v.union(
        v.literal("APPROVED"),
        v.literal("CHANGES_REQUESTED"),
        v.literal("CRITICAL_BLOCKER"),
      ),
      confidenceScore: v.number(),
    }),
    deterministicMetrics: v.object({
      cyclomaticComplexityDelta: v.number(),
      testCoverageImpact: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, {
      status: "completed",
      executionMetadata: args.executionMetadata,
      reviewSummary: args.reviewSummary,
      deterministicMetrics: args.deterministicMetrics,
    });
  },
});

export const addFinding = mutation({
  args: {
    reviewId: v.id("reviews"),
    findingId: v.string(),
    severity: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH"),
      v.literal("CRITICAL"),
    ),
    filePath: v.string(),
    lineNumber: v.number(),
    category: v.union(
      v.literal("SECURITY"),
      v.literal("PERFORMANCE"),
      v.literal("LOGIC"),
      v.literal("STYLE"),
    ),
    description: v.string(),
    suggestedFix: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("findings", {
      reviewId: args.reviewId,
      findingId: args.findingId,
      severity: args.severity,
      filePath: args.filePath,
      lineNumber: args.lineNumber,
      category: args.category,
      description: args.description,
      suggestedFix: args.suggestedFix,
    });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return reviews;
  },
});

export const get = query({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return null;

    const findings = await ctx.db
      .query("findings")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .collect();

    return { ...review, findings };
  },
});
