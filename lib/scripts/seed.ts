import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function fetchAllExercises() {
  console.log("Fetching exercises from Free Exercise DB...");

  const response = await fetch(
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json",
  );

  const data = await response.json();
  console.log(`Found ${data.length} exercises`);
  return data;
}

async function seed() {
  const { exercises } = await import("../db/schema");

  console.log("Starting seed...");
  const data = await fetchAllExercises();

  for (const exercise of data) {
    await db
      .insert(exercises)
      .values({
        name: exercise.name,
        category: exercise.category,
        equipment: Array.isArray(exercise.equipment)
          ? exercise.equipment[0] || "none"
          : exercise.equipment || "none",
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        instructions: exercise.instructions || [],
        difficulty: exercise.level || "intermediate",
      })
      .onConflictDoNothing();
  }

  console.log(`Successfully seeded ${data.length} exercises`);
  process.exit(0);
}

seed().catch(console.error);
