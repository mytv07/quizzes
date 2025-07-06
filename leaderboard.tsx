import React from "react";
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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Haptics from "expo-haptics";

export default function LeaderboardScreen() {
  const router = useRouter();
  const leaderboard = useQuery(api.quiz.getLeaderboard, { limit: 20 });

  const handleGoBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  if (leaderboard === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>లీడర్‌బోర్డ్ లోడ్ అవుతోంది...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← వెనుకకు</Text>
          </TouchableOpacity>
          <Text style={styles.title}>లీడర్‌బోర్డ్</Text>
          <Text style={styles.subtitle}>అత్యుత్తమ స్కోర్‌లు</Text>
        </View>

        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>ఇంకా స్కోర్‌లు లేవు</Text>
            <Text style={styles.emptySubtext}>
              మొదటి క్విజ్ తీసుకుని లీడర్‌బోర్డ్‌లో మీ స్థానం సంపాదించండి!
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboardContainer}>
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const averageScore = user.totalQuizzes > 0 
                ? (user.totalScore / user.totalQuizzes).toFixed(1)
                : "0.0";

              return (
                <View key={user._id} style={[
                  styles.leaderboardItem,
                  rank <= 3 && styles.topThreeItem
                ]}>
                  <View style={styles.rankContainer}>
                    <View style={[
                      styles.rankBadge,
                      rank === 1 && styles.goldBadge,
                      rank === 2 && styles.silverBadge,
                      rank === 3 && styles.bronzeBadge,
                    ]}>
                      <Text style={[
                        styles.rankText,
                        rank <= 3 && styles.topThreeRankText
                      ]}>
                        {rank}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userId}>
                      వినియోగదారు #{user.userId.slice(-6)}
                    </Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>
                        అత్యుత్తమ స్కోర్: {user.bestScore}
                      </Text>
                      <Text style={styles.statText}>
                        మొత్తం క్విజ్‌లు: {user.totalQuizzes}
                      </Text>
                    </View>
                    <Text style={styles.averageText}>
                      సగటు స్కోర్: {averageScore}
                    </Text>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={styles.bestScore}>{user.bestScore}</Text>
                    <Text style={styles.totalScore}>
                      మొత్తం: {user.totalScore}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.newQuizButton} onPress={handleGoBack}>
          <Text style={styles.newQuizButtonText}>కొత్త క్విజ్ తీసుకోండి</Text>
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
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498DB",
    fontWeight: "600",
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
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
  },
  leaderboardContainer: {
    gap: 12,
    marginBottom: 30,
  },
  leaderboardItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topThreeItem: {
    borderWidth: 2,
    borderColor: "#F39C12",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  rankContainer: {
    marginRight: 16,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BDC3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  goldBadge: {
    backgroundColor: "#F1C40F",
  },
  silverBadge: {
    backgroundColor: "#95A5A6",
  },
  bronzeBadge: {
    backgroundColor: "#E67E22",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  topThreeRankText: {
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  statText: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  averageText: {
    fontSize: 12,
    color: "#3498DB",
    fontWeight: "500",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  bestScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27AE60",
  },
  totalScore: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  newQuizButton: {
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
  newQuizButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});