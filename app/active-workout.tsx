import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { useWorkout } from "../lib/context/WorkoutContext";
import { saveWorkout } from "../lib/api/workouts";
import { useUser } from "@clerk/clerk-expo";

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[] | null;
  secondaryMuscles: string[] | null;
  instructions: string[] | null;
  difficulty: string | null;
};

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { exercises, addExercise, addSet, updateSet, endWorkout } =
    useWorkout();
  const [timerSeconds, setTimerSeconds] = useState(0);
  const { user } = useUser();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerSeconds]);

  const handleEndWorkout = () => {
    Alert.alert("End Workout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          try {
            if (user && exercises.length > 0) {
              await saveWorkout(user.id, exercises);
            }
          } catch (err) {
            console.log("Error saving workout:", err);
          } finally {
            endWorkout();
            router.back();
          }
        },
      },
    ]);
  };

  const handleSetComplete = (exerciseId: string, setId: string) => {
    updateSet(exerciseId, setId, "completed", true);
    setTimerSeconds(90);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Active Workout</Text>
          <TouchableOpacity style={styles.endButton} onPress={handleEndWorkout}>
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Rest Timer */}
        {timerSeconds > 0 && (
          <View style={styles.timerBanner}>
            <Text style={styles.timerText}>Rest: {timerSeconds}s</Text>
            <TouchableOpacity onPress={() => setTimerSeconds(0)}>
              <Text style={styles.timerSkip}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.scroll}>
          {exercises.length === 0 && (
            <Text style={styles.empty}>Tap + to add your first exercise</Text>
          )}

          {exercises.map((exercise) => (
            <View key={exercise.exerciseId} style={styles.exerciseBlock}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>

              {/* Set headers */}
              <View style={styles.setHeader}>
                <Text style={styles.setHeaderText}>Set</Text>
                <Text style={styles.setHeaderText}>KG</Text>
                <Text style={styles.setHeaderText}>Reps</Text>
                <Text style={styles.setHeaderText}>RPE</Text>
                <Text style={styles.setHeaderText}>Done</Text>
              </View>

              {exercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{index + 1}</Text>
                  <TextInput
                    style={[
                      styles.setInput,
                      set.completed && styles.completedInput,
                    ]}
                    value={set.weight > 0 ? String(set.weight) : ""}
                    onChangeText={(v) =>
                      updateSet(
                        exercise.exerciseId,
                        set.id,
                        "weight",
                        Number(v),
                      )
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6B6B6B"
                    editable={!set.completed}
                  />
                  <TextInput
                    style={[
                      styles.setInput,
                      set.completed && styles.completedInput,
                    ]}
                    value={set.reps > 0 ? String(set.reps) : ""}
                    onChangeText={(v) =>
                      updateSet(exercise.exerciseId, set.id, "reps", Number(v))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6B6B6B"
                    editable={!set.completed}
                  />
                  <TextInput
                    style={[
                      styles.setInput,
                      set.completed && styles.completedInput,
                    ]}
                    value={set.rpe > 0 ? String(set.rpe) : ""}
                    onChangeText={(v) =>
                      updateSet(exercise.exerciseId, set.id, "rpe", Number(v))
                    }
                    keyboardType="numeric"
                    placeholder="7"
                    placeholderTextColor="#6B6B6B"
                    editable={!set.completed}
                  />
                  <TouchableOpacity
                    style={[
                      styles.doneButton,
                      set.completed && styles.doneButtonActive,
                    ]}
                    onPress={() =>
                      handleSetComplete(exercise.exerciseId, set.id)
                    }
                  >
                    <Text style={styles.doneButtonText}>
                      {set.completed ? "✓" : "○"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exercise.exerciseId)}
              >
                <Text style={styles.addSetText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => router.push("/exercise-picker")}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  endButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: { color: "#FFFFFF", fontWeight: "600" },
  timerBanner: {
    backgroundColor: "#1F1F1F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  timerText: { color: "#FF6B6B", fontSize: 16, fontWeight: "bold" },
  timerSkip: { color: "#6B6B6B", fontSize: 14 },
  scroll: { flex: 1, padding: 20 },
  empty: { color: "#6B6B6B", textAlign: "center", marginTop: 60, fontSize: 16 },
  exerciseBlock: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setHeaderText: {
    color: "#6B6B6B",
    fontSize: 12,
    flex: 1,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  setNumber: { color: "#6B6B6B", fontSize: 14, width: 20, textAlign: "center" },
  setInput: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 14,
  },
  completedInput: { opacity: 0.4 },
  doneButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonActive: { backgroundColor: "#6BCB77" },
  doneButtonText: { color: "#FFFFFF", fontSize: 16 },
  addSetButton: { marginTop: 8 },
  addSetText: { color: "#FF6B6B", fontSize: 14 },
  addExerciseButton: {
    backgroundColor: "#FF6B6B",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addExerciseText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
