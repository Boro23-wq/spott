import { View, Text, StyleSheet, ScrollView } from "react-native";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.name}>Let's Spott your progress</Text>
      </View>

      {/* Start Workout CTA */}
      <Button title="Start Workout" onPress={() => {}} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Streak 🔥</Text>
        </Card>
      </View>

      {/* Progress Card */}
      <Card>
        <Text style={styles.cardTitle}>Progress you can finally see</Text>
        <Text style={styles.cardSubtitle}>
          Complete your first workout to start tracking
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  greeting: { color: "#6B6B6B", fontSize: 14 },
  name: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginVertical: 20 },
  statCard: { flex: 1, alignItems: "center" },
  statNumber: { color: "#FF6B6B", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#6B6B6B", fontSize: 12, marginTop: 4 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  cardSubtitle: { color: "#6B6B6B", fontSize: 14, marginTop: 8 },
});
