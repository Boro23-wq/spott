import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import ExerciseCard from "../../components/ui/ExerciseCard";
import ExerciseBottomSheet from "../../components/ui/ExerciseBottomSheet";
import { supabase } from "../../lib/supabase";

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

const CATEGORIES = [
  "All",
  "strength",
  "cardio",
  "powerlifting",
  "olympic weightlifting",
  "plyometrics",
  "stretching",
  "strongman",
];

const EQUIPMENT = [
  "All",
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Body Only",
  "Kettlebell",
  "Bands",
  "Foam Roll",
  "Medicine Ball",
  "None",
];

export default function WorkoutScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [category, setCategory] = useState("All");
  const [equipment, setEquipment] = useState("All");

  useEffect(() => {
    loadExercises();
  }, [category, equipment]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 1) handleSearch(query);
      else if (query.length === 0) loadExercises();
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const loadExercises = async () => {
    setLoading(true);
    let q = supabase.from("exercises").select("*").limit(50);
    if (category !== "All") q = q.ilike("category", category);
    if (equipment !== "All") q = q.ilike("equipment", equipment);
    const { data } = await q;
    setExercises((data || []) as Exercise[]);
    setLoading(false);
  };

  const handleSearch = async (text: string) => {
    setLoading(true);
    let q = supabase
      .from("exercises")
      .select("*")
      .or(
        `name.ilike.%${text}%,category.ilike.%${text}%,equipment.ilike.%${text}%`,
      )
      .limit(50);
    if (category !== "All") q = q.ilike("category", category);
    if (equipment !== "All") q = q.ilike("equipment", equipment);
    const { data } = await q;
    setExercises((data || []) as Exercise[]);
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

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.chipText,
                category === cat && styles.chipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Equipment Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {EQUIPMENT.map((eq) => (
          <TouchableOpacity
            key={eq}
            style={[styles.chip, equipment === eq && styles.chipActive]}
            onPress={() => setEquipment(eq)}
          >
            <Text
              style={[
                styles.chipText,
                equipment === eq && styles.chipTextActive,
              ]}
            >
              {eq}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            console.log("Selected:", ex.name);
            setSelected(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    padding: 16,
  },

  search: {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 8,
  },

  filterRow: {
    marginBottom: 8,
    flexGrow: 0,
  },

  filterContent: {
    gap: 8,
    paddingRight: 16,
    paddingVertical: 2,
    alignItems: "center",
  },

  chip: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 38,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  chipActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },

  chipText: {
    color: "#6B6B6B",
    fontSize: 13,
    lineHeight: 16,
    textTransform: "capitalize",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  list: {
    paddingBottom: 20,
  },
});
