import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[] | null;
  difficulty: string | null;
};

type Props = {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
};

export default function ExerciseCard({ exercise, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(exercise)}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.category} · {exercise.equipment}
        </Text>
        {exercise.primaryMuscles && (
          <Text style={styles.muscles}>
            {exercise.primaryMuscles.join(", ")}
          </Text>
        )}
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {exercise.difficulty || "intermediate"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flex: 1, marginRight: 12 },
  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  meta: {
    color: "#6B6B6B",
    fontSize: 12,
    marginTop: 4,
    textTransform: "capitalize",
  },
  muscles: {
    color: "#FF6B6B",
    fontSize: 11,
    marginTop: 4,
    textTransform: "capitalize",
  },
  badge: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#6B6B6B",
    fontSize: 11,
    textTransform: "capitalize",
  },
});
