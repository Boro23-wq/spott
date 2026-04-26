import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";

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

type Props = {
  exercise: Exercise | null;
  onClose: () => void;
  onAddToWorkout: (exercise: Exercise) => void;
};

export default function ExerciseBottomSheet({
  exercise,
  onClose,
  onAddToWorkout,
}: Props) {
  return (
    <Modal
      visible={!!exercise}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.name}>{exercise?.name}</Text>
          <View style={styles.tagsRow}>
            {exercise?.category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.category}</Text>
              </View>
            )}
            {exercise?.equipment && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.equipment}</Text>
              </View>
            )}
            {exercise?.difficulty && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.difficulty}</Text>
              </View>
            )}
          </View>

          {exercise?.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Muscles</Text>
              <Text style={styles.muscles}>
                {exercise.primaryMuscles.join(", ")}
              </Text>
            </View>
          )}

          {exercise?.secondaryMuscles &&
            exercise.secondaryMuscles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                <Text style={styles.musclesSecondary}>
                  {exercise.secondaryMuscles.join(", ")}
                </Text>
              </View>
            )}

          {exercise?.instructions && exercise.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to perform</Text>
              {exercise.instructions.map((step, index) => (
                <View key={index} style={styles.step}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => exercise && onAddToWorkout(exercise)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add to Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#6B6B6B",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: { color: "#6B6B6B", fontSize: 12, textTransform: "capitalize" },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  muscles: { color: "#FF6B6B", fontSize: 14, textTransform: "capitalize" },
  musclesSecondary: {
    color: "#FFD166",
    fontSize: 14,
    textTransform: "capitalize",
  },
  step: { flexDirection: "row", gap: 12, marginBottom: 10 },
  stepNumber: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "bold",
    width: 20,
  },
  stepText: { color: "#AAAAAA", fontSize: 14, flex: 1, lineHeight: 20 },
  addButton: {
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
