import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import ExerciseCard from "../components/ui/ExerciseCard";
import { getAllExercises, searchExercises } from "../lib/api/exercises";
import { useWorkout } from "../lib/context/WorkoutContext";

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

export default function ExercisePickerScreen() {
  const router = useRouter();
  const { addExercise } = useWorkout();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 1) handleSearch(query);
      else if (query.length === 0) loadExercises();
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const loadExercises = async () => {
    setLoading(true);
    const data = await getAllExercises();
    setExercises(data as Exercise[]);
    setLoading(false);
  };

  const handleSearch = async (text: string) => {
    setLoading(true);
    const data = await searchExercises(text);
    setExercises(data as Exercise[]);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search exercises..."
        placeholderTextColor="#6B6B6B"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {loading ? (
        <ActivityIndicator color="#FF6B6B" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={(ex) => {
                addExercise(ex.id, ex.name);
                router.back();
              }}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414", padding: 16 },
  search: {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  list: { paddingBottom: 20 },
});
