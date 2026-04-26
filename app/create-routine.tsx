import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useCallback } from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { saveRoutine } from "../lib/api/routines";
import { useFocusEffect } from "@react-navigation/native";
import { useWorkout } from "../lib/context/WorkoutContext";

type RoutineExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  rpe: number;
  orderIndex: number;
};

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const { pendingExercise, setPendingExercise } = useWorkout();

  const updateExercise = (
    index: number,
    field: keyof RoutineExercise,
    value: any,
  ) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== index) return e;
        return { ...e, [field]: value };
      }),
    );
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a routine name");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Error", "Add at least one exercise");
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      await saveRoutine(user.id, name, exercises);
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save routine");
    } finally {
      setSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (pendingExercise) {
        setExercises((prev) => [
          ...prev,
          {
            exerciseId: pendingExercise.id,
            exerciseName: pendingExercise.name,
            sets: 3,
            reps: 10,
            rpe: 7,
            orderIndex: prev.length,
          },
        ]);
        setPendingExercise(null);
      }
    }, [pendingExercise]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>New Routine</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <TextInput
          style={styles.nameInput}
          placeholder="Routine name (e.g. Push Day)"
          placeholderTextColor="#6B6B6B"
          value={name}
          onChangeText={setName}
        />

        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseBlock}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <TouchableOpacity onPress={() => removeExercise(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.numberInput}
                  value={String(exercise.sets)}
                  onChangeText={(v) =>
                    updateExercise(index, "sets", Number(v) || 1)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  value={String(exercise.reps)}
                  onChangeText={(v) =>
                    updateExercise(index, "reps", Number(v) || 1)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RPE</Text>
                <TextInput
                  style={styles.numberInput}
                  value={String(exercise.rpe)}
                  onChangeText={(v) =>
                    updateExercise(index, "rpe", Number(v) || 7)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "/exercise-picker",
              params: { mode: "routine" },
            })
          }
        >
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  title: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  saveText: { color: "#FF6B6B", fontSize: 16, fontWeight: "600" },
  scroll: { flex: 1, padding: 20 },
  nameInput: {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  exerciseBlock: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
    flex: 1,
  },
  removeText: { color: "#FF4444", fontSize: 13 },
  row: { flexDirection: "row", gap: 12 },
  inputGroup: { flex: 1, alignItems: "center" },
  inputLabel: { color: "#6B6B6B", fontSize: 12, marginBottom: 6 },
  numberInput: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    width: "100%",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderStyle: "dashed",
  },
  addButtonText: { color: "#FF6B6B", fontSize: 15 },
});
