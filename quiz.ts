import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const startQuiz = mutation({
  args: {
    category: v.string(),
    difficulty: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get questions for the quiz
    const questions = await ctx.db
      .query("questions")
      .filter((q) => q.eq(q.field("category"), args.category))
      .filter((q) => q.eq(q.field("difficulty"), args.difficulty))
      .collect();
    
    // Shuffle and take 10 questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
    const questionIds = shuffledQuestions.map(q => q._id);
    
    // Create quiz session
    const sessionId = await ctx.db.insert("quizSessions", {
      userId: args.userId,
      category: args.category,
      difficulty: args.difficulty,
      questions: questionIds,
      answers: [],
      score: 0,
      totalQuestions: questionIds.length,
      startedAt: Date.now(),
    });
    
    return sessionId;
  },
});

export const getQuizSession = query({
  args: { sessionId: v.id("quizSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;
    
    // Get the questions for this session
    const questions = await Promise.all(
      session.questions.map(id => ctx.db.get(id))
    );
    
    return {
      ...session,
      questions: questions.filter(q => q !== null),
    };
  },
});

export const submitAnswer = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    questionIndex: v.number(),
    answer: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Quiz session not found");
    
    // Update answers array
    const newAnswers = [...session.answers];
    newAnswers[args.questionIndex] = args.answer;
    
    await ctx.db.patch(args.sessionId, {
      answers: newAnswers,
    });
    
    return "Answer submitted";
  },
});

export const completeQuiz = mutation({
  args: { sessionId: v.id("quizSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Quiz session not found");
    
    // Get questions to calculate score
    const questions = await Promise.all(
      session.questions.map(id => ctx.db.get(id))
    );
    
    let score = 0;
    questions.forEach((question, index) => {
      if (question && session.answers[index] === question.correctAnswer) {
        score++;
      }
    });
    
    // Update session with final score
    await ctx.db.patch(args.sessionId, {
      score,
      completedAt: Date.now(),
    });
    
    // Update user stats if userId exists
    if (session.userId) {
      const existingStats = await ctx.db
        .query("userStats")
        .filter((q) => q.eq(q.field("userId"), session.userId))
        .first();
      
      if (existingStats) {
        await ctx.db.patch(existingStats._id, {
          totalQuizzes: existingStats.totalQuizzes + 1,
          totalScore: existingStats.totalScore + score,
          bestScore: Math.max(existingStats.bestScore, score),
          lastQuizDate: Date.now(),
        });
      } else {
        await ctx.db.insert("userStats", {
          userId: session.userId,
          totalQuizzes: 1,
          totalScore: score,
          bestScore: score,
          streak: 1,
          lastQuizDate: Date.now(),
        });
      }
    }
    
    return { score, totalQuestions: session.totalQuestions };
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .collect();
    
    // Sort by best score, then by total score
    const sorted = stats.sort((a, b) => {
      if (b.bestScore !== a.bestScore) {
        return b.bestScore - a.bestScore;
      }
      return b.totalScore - a.totalScore;
    });
    
    return sorted.slice(0, args.limit || 10);
  },
});