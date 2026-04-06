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
