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

export async function getLastSession(clerkId: string, exerciseId: string) {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (userError || !userData) return null;

  const userId = userData.id;

  const { data: userWorkouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (workoutsError || !userWorkouts || userWorkouts.length === 0) return null;

  const workoutIds = userWorkouts.map((w) => w.id);

  const { data, error } = await supabase
    .from("workout_sets")
    .select("reps, weight, rpe, set_number, workout_id")
    .eq("exercise_id", exerciseId)
    .in("workout_id", workoutIds)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) return null;

  const lastWorkoutId = data[0].workout_id;
  return data.filter((s) => s.workout_id === lastWorkoutId);
}

export async function getUserStats(clerkId: string) {
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!userData) return null;

  const { data: workouts } = await supabase
    .from("workouts")
    .select("completed_at")
    .eq("user_id", userData.id)
    .order("completed_at", { ascending: false });

  if (!workouts) return null;

  const total = workouts.length;

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = workouts.filter(
    (w) => new Date(w.completed_at) > weekAgo,
  ).length;

  // Streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDays = workouts.map((w) => {
    const d = new Date(w.completed_at);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const uniqueDays = [...new Set(workoutDays)].sort((a, b) => b - a);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (uniqueDays[i] === expected.getTime()) {
      streak++;
    } else break;
  }

  return { total, thisWeek, streak };
}
