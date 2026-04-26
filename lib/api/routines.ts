import { supabase } from "../supabase";

export async function getRoutines(clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const { data, error } = await supabase
    .from("routines")
    .select(
      `
      id,
      name,
      notes,
      created_at,
      routine_exercises (
        id,
        exercise_id,
        exercise_name,
        sets,
        reps,
        rpe,
        order_index
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function saveRoutine(
  clerkId: string,
  name: string,
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
    rpe: number;
    orderIndex: number;
  }[],
) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) throw new Error("User not found");

  const { data: routine, error } = await supabase
    .from("routines")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error) throw error;

  const { error: exError } = await supabase.from("routine_exercises").insert(
    exercises.map((e) => ({
      routine_id: routine.id,
      exercise_id: e.exerciseId,
      exercise_name: e.exerciseName,
      sets: e.sets,
      reps: e.reps,
      rpe: e.rpe,
      order_index: e.orderIndex,
    })),
  );

  if (exError) throw exError;
  return routine;
}

export async function deleteRoutine(routineId: string) {
  await supabase.from("routine_exercises").delete().eq("routine_id", routineId);

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", routineId);

  if (error) throw error;
}
