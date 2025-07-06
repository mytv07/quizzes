import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  
  const categories = useQuery(api.questions.getAllCategories);
  const addSampleQuestions = useMutation(api.questions.addSampleQuestions);
  const startQuiz = useMutation(api.quiz.startQuiz);

  const difficulties = ["సులభం", "మధ్యమం", "కష్టం"];

  const handleCategorySelect = (category: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
  };

  const handleDifficultySelect = (difficulty: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDifficulty(difficulty);
  };

  const handleStartQuiz = async () => {
    if (!selectedCategory || !selectedDifficulty) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const sessionId = await startQuiz({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        userId: "user_" + Math.random().toString(36).substr(2, 9), // Generate random user ID
      });
      
      router.push(`/quiz/${sessionId}`);
    } catch (error) {
      console.error("Failed to start quiz:", error);
    }
  };

  const handleAddSampleData = async () => {
    try {
      await addSampleQuestions();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to add sample questions:", error);
    }
  };

  if (categories === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>లోడ్ అవుతోంది...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>తెలుగు బైబిల్ క్విజ్</Text>
          <Text style={styles.subtitle}>మీ బైబిల్ జ్ఞానాన్ని పరీక్షించుకోండి</Text>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>ప్రశ్నలు లేవు</Text>
            <Text style={styles.emptySubtext}>మొదట కొన్ని ప్రశ్నలను జోడించండి</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddSampleData}>
              <Text style={styles.addButtonText}>నమూనా ప్రశ్నలను జోడించండి</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>వర్గం ఎంచుకోండి</Text>
              <View style={styles.optionsContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionButton,
                      selectedCategory === category && styles.selectedOption,
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedCategory === category && styles.selectedOptionText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>కష్టతనం ఎంచుకోండి</Text>
              <View style={styles.optionsContainer}>
                {difficulties.map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.optionButton,
                      selectedDifficulty === difficulty && styles.selectedOption,
                    ]}
                    onPress={() => handleDifficultySelect(difficulty)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedDifficulty === difficulty && styles.selectedOptionText,
                      ]}
                    >
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                (!selectedCategory || !selectedDifficulty) && styles.disabledButton,
              ]}
              onPress={handleStartQuiz}
              disabled={!selectedCategory || !selectedDifficulty}
            >
              <Text style={styles.startButtonText}>క్విజ్ ప్రారంభించండి</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() => router.push("/leaderboard")}
            >
              <Text style={styles.leaderboardButtonText}>లీడర్‌బోర్డ్ చూడండి</Text>
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: "center",
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#34495E",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
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
  },
  selectedOptionText: {
    color: "#3498DB",
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#27AE60",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
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
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  leaderboardButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#3498DB",
  },
  leaderboardButtonText: {
    color: "#3498DB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: "#E74C3C",
    padding: 16,
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
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});