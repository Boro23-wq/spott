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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useWorkout } from "../lib/context/WorkoutContext";
import { saveWorkout } from "../lib/api/workouts";
import { useUser } from "@clerk/clerk-expo";

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const {
    exercises,
    addSet,
    updateSet,
    deleteSet,
    deleteExercise,
    endWorkout,
    lastSession,
  } = useWorkout();

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [customTimerInput, setCustomTimerInput] = useState("");
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Workout duration timer
  useEffect(() => {
    workoutTimerRef.current = setInterval(() => {
      setWorkoutSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSetComplete = (
    exerciseId: string,
    setId: string,
    completed: boolean,
  ) => {
    updateSet(exerciseId, setId, "completed", !completed);
    if (!completed) setTimerSeconds(90);
    else setTimerSeconds(0);
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    Alert.alert("Delete Set", "Remove this set?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteSet(exerciseId, setId),
      },
    ]);
  };

  const handleDeleteExercise = (exerciseId: string, name: string) => {
    Alert.alert("Remove Exercise", `Remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteExercise(exerciseId),
      },
    ]);
  };

  const handleSetCustomTimer = () => {
    const seconds = parseInt(customTimerInput) * 60;
    if (!isNaN(seconds) && seconds > 0) {
      setTimerSeconds(seconds);
      setShowTimerModal(false);
      setCustomTimerInput("");
    }
  };

  const handleEndWorkout = () => {
    Alert.alert("End Workout", "What would you like to do?", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Save & End",
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
      {
        text: "Discard Workout",
        style: "destructive",
        onPress: () => {
          endWorkout();
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Active Workout</Text>
          <Text style={styles.duration}>{formatDuration(workoutSeconds)}</Text>
        </View>
        <TouchableOpacity style={styles.endButton} onPress={handleEndWorkout}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      {timerSeconds > 0 && (
        <View style={styles.timerBanner}>
          <Text style={styles.timerText}>Rest: {timerSeconds}s</Text>
          <View style={styles.timerActions}>
            <TouchableOpacity
              style={styles.timerChip}
              onPress={() => setTimerSeconds((prev) => prev + 15)}
            >
              <Text style={styles.timerChipText}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTimerSeconds(0)}>
              <Text style={styles.timerSkip}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Timer Presets */}
      <View style={styles.timerPresets}>
        <Text style={styles.timerPresetLabel}>Rest:</Text>
        {[60, 90, 120, 180].map((sec) => (
          <TouchableOpacity
            key={sec}
            style={[
              styles.presetChip,
              timerSeconds === sec && styles.presetChipActive,
            ]}
            onPress={() => setTimerSeconds(sec)}
          >
            <Text
              style={[
                styles.presetChipText,
                timerSeconds === sec && styles.presetChipTextActive,
              ]}
            >
              {sec / 60 < 1 ? `${sec}s` : `${sec / 60}m`}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => setShowTimerModal(true)}
        >
          <Text style={styles.presetChipText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {exercises.length === 0 && (
          <Text style={styles.empty}>Tap + Add Exercise to get started</Text>
        )}

        {exercises.map((exercise) => (
          <View key={exercise.exerciseId} style={styles.exerciseBlock}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <TouchableOpacity
                onPress={() =>
                  handleDeleteExercise(
                    exercise.exerciseId,
                    exercise.exerciseName,
                  )
                }
              >
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { width: 20 }]}>Set</Text>
              <Text style={styles.setHeaderText}>KG</Text>
              <Text style={styles.setHeaderText}>Reps</Text>
              <Text style={styles.setHeaderText}>RPE</Text>
              <Text style={styles.setHeaderText}>Done</Text>
              <Text style={{ width: 30 }} />
            </View>

            {exercise.sets.map((set, index) => {
              const prev = lastSession[exercise.exerciseId]?.[index];
              return (
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
                    placeholder={prev ? String(prev.weight) : "0"}
                    placeholderTextColor={prev ? "#FF6B6B" : "#6B6B6B"}
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
                    placeholder={prev ? String(prev.reps) : "0"}
                    placeholderTextColor={prev ? "#FF6B6B" : "#6B6B6B"}
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
                    placeholder={prev ? String(prev.rpe) : "7"}
                    placeholderTextColor={prev ? "#FF6B6B" : "#6B6B6B"}
                    editable={!set.completed}
                  />
                  <TouchableOpacity
                    style={[
                      styles.doneButton,
                      set.completed && styles.doneButtonActive,
                    ]}
                    onPress={() =>
                      handleSetComplete(
                        exercise.exerciseId,
                        set.id,
                        set.completed,
                      )
                    }
                  >
                    <Text style={styles.doneButtonText}>
                      {set.completed ? "✓" : "○"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSet(exercise.exerciseId, set.id)}
                    style={styles.deleteSetButton}
                  >
                    <Text style={styles.deleteSetText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.exerciseId)}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Exercise Button */}
      <TouchableOpacity
        style={styles.addExerciseButton}
        onPress={() => router.push("/exercise-picker")}
      >
        <Text style={styles.addExerciseText}>+ Add Exercise</Text>
      </TouchableOpacity>

      {/* Custom Timer Modal */}
      <Modal
        visible={showTimerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTimerModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Rest Timer</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Minutes (e.g. 2)"
              placeholderTextColor="#6B6B6B"
              keyboardType="numeric"
              value={customTimerInput}
              onChangeText={setCustomTimerInput}
              autoFocus
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSetCustomTimer}
            >
              <Text style={styles.modalButtonText}>Set Timer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  duration: { color: "#FF6B6B", fontSize: 14, marginTop: 2 },
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
  timerActions: { flexDirection: "row", gap: 12, alignItems: "center" },
  timerChip: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerChipText: { color: "#FFFFFF", fontSize: 12 },
  timerSkip: { color: "#6B6B6B", fontSize: 14 },
  timerPresets: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  timerPresetLabel: { color: "#6B6B6B", fontSize: 12 },
  presetChip: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: { backgroundColor: "#FF6B6B" },
  presetChipText: { color: "#6B6B6B", fontSize: 12 },
  presetChipTextActive: { color: "#FFFFFF" },
  scroll: { flex: 1, padding: 20 },
  empty: {
    color: "#6B6B6B",
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
  },
  exerciseBlock: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
    flex: 1,
  },
  deleteText: { color: "#FF4444", fontSize: 13 },
  setHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
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
  setNumber: {
    color: "#6B6B6B",
    fontSize: 14,
    width: 20,
    textAlign: "center",
  },
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
  deleteSetButton: {
    width: 30,
    alignItems: "center",
  },
  deleteSetText: { color: "#FF4444", fontSize: 14 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 40,
  },
  modalContent: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modalInput: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#FF6B6B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: { color: "#FFFFFF", fontWeight: "600" },
});
