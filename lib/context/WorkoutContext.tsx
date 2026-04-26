import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  startedAt: Date | null;
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
  deleteSet: (exerciseId: string, setId: string) => void;
  deleteExercise: (exerciseId: string) => void;
  lastSession: Record<string, any[]>;
  setLastSessionData: (exerciseId: string, data: any[]) => void;
  pendingExercise: { id: string; name: string } | null;
  setPendingExercise: (ex: { id: string; name: string } | null) => void;
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

const STORAGE_KEY = "spott_active_workout";

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [lastSession, setLastSession] = useState<Record<string, any[]>>({});
  const [pendingExercise, setPendingExercise] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const setLastSessionData = (exerciseId: string, data: any[]) => {
    setLastSession((prev) => ({ ...prev, [exerciseId]: data }));
  };

  // Load persisted workout on app start
  useEffect(() => {
    async function loadWorkout() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { isActive, exercises, startedAt } = JSON.parse(stored);
          setIsActive(isActive);
          setExercises(exercises);
          setStartedAt(startedAt ? new Date(startedAt) : null);
        }
      } catch (err) {
        console.log("Error loading workout:", err);
      }
    }
    loadWorkout();
  }, []);

  // Save workout to storage whenever it changes
  useEffect(() => {
    async function saveWorkout() {
      try {
        if (isActive) {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              isActive,
              exercises,
              startedAt,
            }),
          );
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        console.log("Error saving workout:", err);
      }
    }
    saveWorkout();
  }, [isActive, exercises, startedAt]);

  const startWorkout = () => {
    setIsActive(true);
    setExercises([]);
    setStartedAt(new Date());
  };

  const endWorkout = () => {
    setIsActive(false);
    setExercises([]);
    setStartedAt(null);
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
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: Date.now().toString(),
              reps: lastSet?.reps || 0,
              weight: lastSet?.weight || 0,
              rpe: lastSet?.rpe || 7,
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

  const deleteSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        if (e.sets.length === 1) return e;
        return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
      }),
    );
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  return (
    <WorkoutContext.Provider
      value={{
        isActive,
        exercises,
        startedAt,
        startWorkout,
        endWorkout,
        addExercise,
        addSet,
        updateSet,
        deleteSet,
        deleteExercise,
        lastSession,
        setLastSessionData,
        pendingExercise,
        setPendingExercise,
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
