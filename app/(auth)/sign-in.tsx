import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import Button from "../../components/ui/Button";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      await setActive({ session: result.createdSessionId });
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Spott</Text>
      <Text style={styles.tagline}>Progress you can finally see.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6B6B6B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6B6B6B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={loading ? "Signing in..." : "Sign In"}
          onPress={handleSignIn}
        />

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.linkText}>
            Don't have an account?
            <Text style={styles.linkAccent}> Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    color: "#FF6B6B",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
  },
  tagline: {
    color: "#6B6B6B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 48,
  },
  form: { gap: 12 },
  input: {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  link: { alignItems: "center", marginTop: 8 },
  linkText: { color: "#6B6B6B", fontSize: 14 },
  linkAccent: { color: "#FF6B6B", fontWeight: "600" },
});
