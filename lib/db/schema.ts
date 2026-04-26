import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull(),
  experienceLevel: text("experience_level"),
  goal: text("goal"),
  daysPerWeek: integer("days_per_week"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category"),
  equipment: text("equipment"),
  primaryMuscles: text("primary_muscles").array(),
  secondaryMuscles: text("secondary_muscles").array(),
  instructions: text("instructions").array(),
  difficulty: text("difficulty"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name"),
  notes: text("notes"),
  duration: integer("duration"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id").references(() => workouts.id),
  exerciseId: uuid("exercise_id").references(() => exercises.id),
  setNumber: integer("set_number"),
  reps: integer("reps"),
  weight: real("weight"),
  rpe: integer("rpe"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routines = pgTable("routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routineExercises = pgTable("routine_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id").references(() => routines.id),
  exerciseId: uuid("exercise_id").references(() => exercises.id),
  exerciseName: text("exercise_name").notNull(),
  sets: integer("sets").default(3),
  reps: integer("reps").default(10),
  rpe: integer("rpe").default(7),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
