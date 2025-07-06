import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as Haptics from "expo-haptics";

export default function QuizScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const quizSession = useQuery(
    api.quiz.getQuizSession,
    sessionId ? { sessionId: sessionId as Id<"quizSessions"> } : "skip"
  );
  const submitAnswer = useMutation(api.quiz.submitAnswer);
  const completeQuiz = useMutation(api.quiz.completeQuiz);

  const currentQuestion = quizSession?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quizSession?.questions.length || 0) - 1;

  useEffect(() => {
    if (quizSession && userAnswers.length < quizSession.questions.length) {
      setUserAnswers(new Array(quizSession.questions.length).fill(-1));
    }
  }, [quizSession]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null || !sessionId) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // Submit the answer
      await submitAnswer({
        sessionId: sessionId as Id<"quizSessions">,
        questionIndex: currentQuestionIndex,
        answer: selectedAnswer,
      });

      // Update local answers array
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setUserAnswers(newAnswers);

      if (isLastQuestion) {
        // Complete the quiz
        const result = await completeQuiz({
          sessionId: sessionId as Id<"quizSessions">,
        });
        setShowResult(true);
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      Alert.alert("లోపం", "జవాబు సేవ్ చేయడంలో లోపం జరిగింది");
    }
  };

  const handleFinishQuiz = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.push("/");
  };

  if (!quizSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>క్విజ్ లోడ్ అవుతోంది...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult) {
    const score = userAnswers.reduce((total, answer, index) => {
      const question = quizSession.questions[index];
      return total + (answer === question?.correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / quizSession.questions.length) * 100);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>క్విజ్ పూర్తయింది! 🎉</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {score} / {quizSession.questions.length}
              </Text>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewTitle}>సమీక్ష:</Text>
              {quizSession.questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question?.correctAnswer;
                
                return (
                  <View key={index} style={styles.reviewItem}>
                    <Text style={styles.reviewQuestion}>
                      {index + 1}. {question?.question}
                    </Text>
                    <Text style={[
                      styles.reviewAnswer,
                      isCorrect ? styles.correctAnswer : styles.wrongAnswer
                    ]}>
                      మీ జవాబు: {question?.options[userAnswer] || "ఎంపిక చేయలేదు"}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.correctAnswerText}>
                        సరైన జవాబు: {question?.options[question.correctAnswer]}
                      </Text>
                    )}
                    {question?.explanation && (
                      <Text style={styles.explanation}>
                        వివరణ: {question.explanation}
                      </Text>
                    )}
                    {question?.verse && (
                      <Text style={styles.verse}>
                        వచనం: {question.verse}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.finishButton} onPress={handleFinishQuiz}>
              <Text style={styles.finishButtonText}>హోమ్‌కు వెళ్లండి</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>ప్రశ్న లోడ్ అవుతోంది...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              ప్రశ్న {currentQuestionIndex + 1} / {quizSession.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentQuestionIndex + 1) / quizSession.questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.verse && (
            <Text style={styles.verseText}>వచనం: {currentQuestion.verse}</Text>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.disabledButton,
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? "క్విజ్ పూర్తి చేయండి" : "తదుపరి ప్రశ్న"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  header: {
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495E",
    textAlign: "center",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498DB",
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    lineHeight: 28,
    textAlign: "center",
  },
  verseText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedOption: {
    borderColor: "#3498DB",
    backgroundColor: "#EBF3FD",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 22,
  },
  selectedOptionText: {
    color: "#3498DB",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#27AE60",
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#BDC3C7",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 40,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#27AE60",
    textAlign: "center",
    marginBottom: 30,
  },
  scoreContainer: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3498DB",
  },
  reviewContainer: {
    width: "100%",
    marginBottom: 30,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  reviewItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewAnswer: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  correctAnswer: {
    color: "#27AE60",
  },
  wrongAnswer: {
    color: "#E74C3C",
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "500",
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 20,
  },
  verse: {
    fontSize: 12,
    color: "#95A5A6",
    fontWeight: "500",
    marginTop: 4,
  },
  finishButton: {
    backgroundColor: "#3498DB",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});