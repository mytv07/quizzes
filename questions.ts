import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getQuestionsByCategory = query({
  args: { 
    category: v.string(),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("questions")
      .filter((q) => q.eq(q.field("category"), args.category));
    
    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty));
    }
    
    const questions = await query.collect();
    
    // Shuffle and limit questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, args.limit || 10);
  },
});

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").collect();
    const categories = [...new Set(questions.map(q => q.category))];
    return categories;
  },
});

export const addSampleQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleQuestions = [
      {
        question: "దేవుడు ప్రపంచాన్ని ఎన్ని రోజుల్లో సృష్టించాడు?",
        options: ["5 రోజులు", "6 రోజులు", "7 రోజులు", "8 రోజులు"],
        correctAnswer: 1,
        category: "పాత నిబంధన",
        difficulty: "సులభం",
        verse: "ఆదికాండము 1:31",
        explanation: "దేవుడు 6 రోజుల్లో ప్రపంచాన్ని సృష్టించి, 7వ రోజు విశ్రమించాడు."
      },
      {
        question: "యేసు ఎక్కడ జన్మించాడు?",
        options: ["నజరేతు", "బేత్లెహేము", "జెరూసలేము", "కపర్నహూము"],
        correctAnswer: 1,
        category: "కొత్త నిబంధన",
        difficulty: "సులభం",
        verse: "మత్తయి 2:1",
        explanation: "యేసు బేత్లెహేములో జన్మించాడు, దావీదు పట్టణంలో."
      },
      {
        question: "మోషే ఎన్ని ఆజ్ఞలను పొందాడు?",
        options: ["8", "10", "12", "15"],
        correctAnswer: 1,
        category: "పాత నిబంధన",
        difficulty: "సులభం",
        verse: "నిర్గమకాండము 20",
        explanation: "మోషే సీనై పర్వతంపై దేవుని నుండి 10 ఆజ్ఞలను పొందాడు."
      },
      {
        question: "యేసు ఎంత మంది శిష్యులను ఎంపిక చేసుకున్నాడు?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        category: "కొత్త నిబంధన",
        difficulty: "సులభం",
        verse: "మత్తయి 10:1-4",
        explanation: "యేసు 12 మంది శిష్యులను ఎంపిక చేసుకున్నాడు."
      },
      {
        question: "దావీదు ఎవరిని చంపాడు?",
        options: ["గొల్యాతు", "సౌలు", "అబ్షాలోము", "యోనాతాను"],
        correctAnswer: 0,
        category: "పాత నిబంధన",
        difficulty: "మధ్యమం",
        verse: "1 సమూయేలు 17:50",
        explanation: "దావీదు రాయితో గొల్యాతు దైత్యుడిని చంపాడు."
      },
      {
        question: "యేసు మొదట ఎవరికి కనిపించాడు పునరుత్థానం తర్వాత?",
        options: ["పేతురు", "యోహాను", "మగ్దలేనే మరియ", "తోమా"],
        correctAnswer: 2,
        category: "కొత్త నిబంధన",
        difficulty: "మధ్యమం",
        verse: "యోహాను 20:14-18",
        explanation: "యేసు పునరుత్థానం తర్వాత మొదట మగ్దలేనే మరియకు కనిపించాడు."
      },
      {
        question: "నోవహు ఓడలో ఎంత రోజులు ఉన్నాడు?",
        options: ["40 రోజులు", "100 రోజులు", "150 రోజులు", "365 రోజులు"],
        correctAnswer: 2,
        category: "పాత నిబంధన",
        difficulty: "కష్టం",
        verse: "ఆదికాండము 7:24",
        explanation: "నీరు 150 రోజులు భూమిపై ఉండింది."
      },
      {
        question: "పౌలు ఎన్ని లేఖలు వ్రాసాడు?",
        options: ["12", "13", "14", "15"],
        correctAnswer: 1,
        category: "కొత్త నిబంధన",
        difficulty: "కష్టం",
        verse: "కొత్త నిబంధన",
        explanation: "పౌలు 13 లేఖలు వ్రాసాడు (హెబ్రీయులకు వ్రాసిన లేఖ వివాదాస్పదం)."
      }
    ];

    for (const question of sampleQuestions) {
      await ctx.db.insert("questions", question);
    }
    
    return "Sample questions added successfully!";
  },
});