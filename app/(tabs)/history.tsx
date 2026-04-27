import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "../../lib/supabase";

type WorkoutSet = {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rpe: number;
  exercises: { name: string } | null;
};

type Workout = {
  id: string;
  name: string;
  completed_at: string;
  duration: number | null;
  workout_sets: WorkoutSet[];
};

export default function HistoryScreen() {
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!userData) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
    id,
    name,
    completed_at,
    duration,
    workout_sets (
      id,
      exercise_id,
      set_number,
      reps,
      weight,
      rpe,
      exercises (
        name
      )
    )
  `,
      )
      .eq("user_id", userData.id)
      .order("completed_at", { ascending: false });

    console.log("First workout:", JSON.stringify(data?.[0]));

    if (!error && data) setWorkouts(data as unknown as Workout[]);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user]),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalVolume = (sets: WorkoutSet[]) => {
    return sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
  };

  const groupSetsByExercise = (sets: WorkoutSet[]) => {
    const grouped: Record<string, WorkoutSet[]> = {};
    sets.forEach((set) => {
      if (!grouped[set.exercise_id]) grouped[set.exercise_id] = [];
      grouped[set.exercise_id].push(set);
    });
    return grouped;
  };

  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#FF6B6B" style={{ marginTop: 100 }} />
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workout History</Text>

      {workouts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your first workout to see history
          </Text>
        </View>
      ) : (
        workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() =>
              setExpanded(expanded === workout.id ? null : workout.id)
            }
            activeOpacity={0.8}
          >
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutDate}>
                  {formatDate(workout.completed_at)}
                </Text>
                <Text style={styles.workoutTime}>
                  {formatTime(workout.completed_at)}
                </Text>
              </View>
              <View style={styles.workoutStats}>
                <Text style={styles.statValue}>
                  {workout.workout_sets.length}
                </Text>
                <Text style={styles.statLabel}>sets</Text>
              </View>
              <View style={styles.workoutStats}>
                <Text style={styles.statValue}>
                  {getTotalVolume(workout.workout_sets).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>kg vol</Text>
              </View>
              <Text style={styles.chevron}>
                {expanded === workout.id ? "▲" : "▼"}
              </Text>
            </View>

            {expanded === workout.id && (
              <View style={styles.detail}>
                {Object.entries(groupSetsByExercise(workout.workout_sets)).map(
                  ([exerciseId, sets]) => (
                    <View key={exerciseId} style={styles.exerciseDetail}>
                      <Text style={styles.exerciseDetailName}>
                        {sets[0].exercises?.name || sets[0].exercise_id}
                      </Text>
                      <View style={styles.setsHeader}>
                        <Text style={styles.setsHeaderText}>Set</Text>
                        <Text style={styles.setsHeaderText}>KG</Text>
                        <Text style={styles.setsHeaderText}>Reps</Text>
                        <Text style={styles.setsHeaderText}>RPE</Text>
                      </View>
                      {sets.map((set, i) => (
                        <View key={set.id} style={styles.setRow}>
                          <Text style={styles.setText}>{i + 1}</Text>
                          <Text style={styles.setText}>{set.weight}</Text>
                          <Text style={styles.setText}>{set.reps}</Text>
                          <Text style={styles.setText}>{set.rpe}</Text>
                        </View>
                      ))}
                    </View>
                  ),
                )}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  content: { padding: 20 },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  empty: { alignItems: "center", marginTop: 60 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  emptySubtitle: {
    color: "#6B6B6B",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  workoutCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutDate: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  workoutTime: { color: "#6B6B6B", fontSize: 12, marginTop: 2 },
  workoutStats: { alignItems: "center" },
  statValue: { color: "#FF6B6B", fontSize: 16, fontWeight: "bold" },
  statLabel: { color: "#6B6B6B", fontSize: 11, marginTop: 2 },
  chevron: { color: "#6B6B6B", fontSize: 12 },
  detail: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 16,
  },
  exerciseDetail: { marginBottom: 16 },
  exerciseDetailName: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  setsHeaderText: {
    color: "#6B6B6B",
    fontSize: 11,
    flex: 1,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  setText: { color: "#FFFFFF", fontSize: 13, flex: 1, textAlign: "center" },
});
