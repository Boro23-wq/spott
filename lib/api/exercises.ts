import { supabase } from "../supabase";

export async function getAllExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .limit(50);

  if (error) throw error;
  return data;
}

export async function searchExercises(query: string) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .or(
      `name.ilike.%${query}%,category.ilike.%${query}%,equipment.ilike.%${query}%`,
    )
    .limit(50);

  if (error) throw error;
  return data;
}
