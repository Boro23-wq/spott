import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useWorkout } from "../../lib/context/WorkoutContext";
import { useUser } from "@clerk/clerk-expo";
import { getRoutines, deleteRoutine } from "../../lib/api/routines";
import { getUserStats } from "../../lib/api/workouts";
import { Ionicons } from "@expo/vector-icons";

type Routine = {
  id: string;
  name: string;
  notes: string | null;
  routine_exercises: {
    id: string;
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    rpe: number;
  }[];
};

export default function HomeScreen() {
  const { startWorkout, isActive, addExercise } = useWorkout();
  const router = useRouter();
  const { user } = useUser();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, streak: 0 });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const loadRoutines = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getRoutines(user.id);
    setRoutines(data as Routine[]);
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user) return;
    const statsData = await getUserStats(user.id);
    if (statsData) {
      setStats(statsData);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
      loadStats();
    }, [user]),
  );

  const handleStartWorkout = () => {
    startWorkout();
    router.push("/active-workout");
  };

  const handleStartRoutine = (routine: Routine) => {
    startWorkout();
    routine.routine_exercises.forEach((ex) => {
      addExercise(ex.exercise_id || ex.id, ex.exercise_name);
    });
    router.push("/active-workout");
  };

  const handleDeleteRoutine = (routine: Routine) => {
    const { Alert } = require("react-native");
    Alert.alert("Delete Routine", `Delete "${routine.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteRoutine(routine.id);
          loadRoutines();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.name}>Let's Spott your progress</Text>
        </View>
      </View>

      <Button
        title={isActive ? "Resume Workout" : "Start Empty Workout"}
        onPress={handleStartWorkout}
      />

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Routines</Text>
        <TouchableOpacity onPress={() => router.push("/create-routine")}>
          <Ionicons name="add-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6B6B" style={{ marginTop: 20 }} />
      ) : routines.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No routines yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a routine to start faster next time
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-routine")}
          >
            <Text style={styles.createButtonText}>Create Routine</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        routines.map((routine) => (
          <Card key={routine.id} style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteRoutine(routine)}>
                <Ionicons name="trash-outline" size={18} color="#FF4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.routineExercises}>
              {routine.routine_exercises.map((e) => e.exercise_name).join(", ")}
            </Text>
            <TouchableOpacity
              style={styles.startRoutineButton}
              onPress={() => handleStartRoutine(routine)}
            >
              <Text style={styles.startRoutineText}>Start Routine</Text>
            </TouchableOpacity>
          </Card>
        ))
      )}

      <Card style={{ marginTop: 16 }}>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  emptyTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  emptySubtitle: { color: "#6B6B6B", fontSize: 14, marginTop: 4 },
  createButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  createButtonText: { color: "#FFFFFF", fontWeight: "600" },
  routineCard: { marginBottom: 12 },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routineName: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  routineExercises: {
    color: "#6B6B6B",
    fontSize: 13,
    textTransform: "capitalize",
    marginBottom: 12,
  },
  startRoutineButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  startRoutineText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  cardSubtitle: { color: "#6B6B6B", fontSize: 14, marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 8, marginVertical: 20 },
  statCard: { flex: 1, alignItems: "center" },
  statNumber: { color: "#FF6B6B", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#6B6B6B", fontSize: 12, marginTop: 4 },
});
