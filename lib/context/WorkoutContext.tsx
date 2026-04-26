import { createContext, useContext, useState, ReactNode } from "react";

type Set = {
  id: string;
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
};

type WorkoutExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
};

type WorkoutContextType = {
  isActive: boolean;
  exercises: WorkoutExercise[];
  startWorkout: () => void;
  endWorkout: () => void;
  addExercise: (id: string, name: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: keyof Set,
    value: number | boolean,
  ) => void;
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const startWorkout = () => {
    setIsActive(true);
    setExercises([]);
  };

  const endWorkout = () => {
    setIsActive(false);
    setExercises([]);
  };

  const addExercise = (id: string, name: string) => {
    setExercises((prev) => {
      if (prev.find((e) => e.exerciseId === id)) return prev;
      return [
        ...prev,
        {
          exerciseId: id,
          exerciseName: name,
          sets: [
            {
              id: Date.now().toString(),
              reps: 0,
              weight: 0,
              rpe: 7,
              completed: false,
            },
          ],
        },
      ];
    });
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: Date.now().toString(),
              reps: 0,
              weight: 0,
              rpe: 7,
              completed: false,
            },
          ],
        };
      }),
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: keyof Set,
    value: number | boolean,
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => {
            if (s.id !== setId) return s;
            return { ...s, [field]: value };
          }),
        };
      }),
    );
  };

  return (
    <WorkoutContext.Provider
      value={{
        isActive,
        exercises,
        startWorkout,
        endWorkout,
        addExercise,
        addSet,
        updateSet,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
