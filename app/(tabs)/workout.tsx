import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import ExerciseCard from "../../components/ui/ExerciseCard";
import ExerciseBottomSheet from "../../components/ui/ExerciseBottomSheet";
import { getAllExercises, searchExercises } from "../../lib/api/exercises";

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

export default function WorkoutScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 1) {
        handleSearch(query);
      } else if (query.length === 0) {
        loadExercises();
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await getAllExercises();
      console.log("Exercises loaded:", data?.length, data?.[0]);
      setExercises(data as Exercise[]);
    } catch (err) {
      console.log("Error loading exercises:", err);
    }
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
              onPress={(ex) => setSelected(ex as Exercise)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selected && (
        <ExerciseBottomSheet
          exercise={selected}
          onClose={() => setSelected(null)}
          onAddToWorkout={(ex) => {
            console.log("Adding to workout:", ex.name);
            setSelected(null);
          }}
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
