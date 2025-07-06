import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  questions: defineTable({
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(), // index of correct option
    category: v.string(), // "Old Testament", "New Testament", "General"
    difficulty: v.string(), // "Easy", "Medium", "Hard"
    verse: v.optional(v.string()), // Bible verse reference
    explanation: v.optional(v.string()),
  }),
  
  quizSessions: defineTable({
    userId: v.optional(v.string()),
    category: v.string(),
    difficulty: v.string(),
    questions: v.array(v.id("questions")),
    answers: v.array(v.number()), // user's answers
    score: v.number(),
    totalQuestions: v.number(),
    completedAt: v.optional(v.number()),
    startedAt: v.number(),
  }),
  
  userStats: defineTable({
    userId: v.string(),
    totalQuizzes: v.number(),
    totalScore: v.number(),
    bestScore: v.number(),
    favoriteCategory: v.optional(v.string()),
    streak: v.number(),
    lastQuizDate: v.optional(v.number()),
  }),
});