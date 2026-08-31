import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    reviews: defineTable({
      userId: v.string(),
      repoUrl: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("analyzing"),
        v.literal("reasoning"),
        v.literal("auditing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      executionMetadata: v.optional(
        v.object({
          tokensConsumed: v.number(),
          latencyMs: v.number(),
          agentsInvoked: v.array(v.string()),
          cacheHit: v.boolean(),
        }),
      ),
      reviewSummary: v.optional(
        v.object({
          status: v.union(
            v.literal("APPROVED"),
            v.literal("CHANGES_REQUESTED"),
            v.literal("CRITICAL_BLOCKER"),
          ),
          confidenceScore: v.number(),
        }),
      ),
      deterministicMetrics: v.optional(
        v.object({
          cyclomaticComplexityDelta: v.number(),
          testCoverageImpact: v.string(),
        }),
      ),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

    findings: defineTable({
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
    }).index("by_review", ["reviewId"])
    .index("by_severity", ["severity"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
