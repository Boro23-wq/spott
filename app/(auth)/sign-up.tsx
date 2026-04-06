import { useSignUp } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: result.createdSessionId });
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a code to {email}</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            placeholderTextColor="#6B6B6B"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <Button
            title={loading ? "Verifying..." : "Verify Email"}
            onPress={handleVerify}
          />
        </View>
      </View>
    );
  }

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
          title={loading ? "Creating account..." : "Sign Up"}
          onPress={handleSignUp}
        />

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.linkText}>
            Already have an account?
            <Text style={styles.linkAccent}> Sign In</Text>
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
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#6B6B6B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
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
