import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { WorkoutProvider } from "../lib/context/WorkoutContext";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="active-workout" options={{ headerShown: false }} />
      <Stack.Screen name="create-routine" options={{ headerShown: false }} />
      <Stack.Screen
        name="exercise-picker"
        options={{
          title: "Add Exercise",
          headerStyle: { backgroundColor: "#141414" },
          headerTintColor: "#FFFFFF",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <WorkoutProvider>
          <InitialLayout />
        </WorkoutProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
