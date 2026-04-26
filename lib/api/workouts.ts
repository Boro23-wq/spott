import { supabase } from "../supabase";

type SetInput = {
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
};

type ExerciseInput = {
  exerciseId: string;
  exerciseName: string;
  sets: (SetInput & { id: string })[];
};

export async function saveWorkout(clerkId: string, exercises: ExerciseInput[]) {
  // First get user from db
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (userError || !user) {
    // Create user if doesn't exist
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ clerk_id: clerkId, email: "" })
      .select("id")
      .single();

    if (createError) throw createError;
    return saveWorkoutForUser(newUser.id, exercises);
  }

  return saveWorkoutForUser(user.id, exercises);
}

async function saveWorkoutForUser(userId: string, exercises: ExerciseInput[]) {
  // Create workout
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      name: "Workout",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (workoutError) throw workoutError;

  // Save all sets
  const sets = exercises.flatMap((exercise) =>
    exercise.sets
      .filter((s) => s.completed)
      .map((set, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.exerciseId,
        set_number: index + 1,
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe,
      })),
  );

  if (sets.length > 0) {
    const { error: setsError } = await supabase
      .from("workout_sets")
      .insert(sets);

    if (setsError) throw setsError;
  }

  return workout;
}
