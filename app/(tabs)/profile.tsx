import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getUserStats } from "../../lib/api/workouts";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, streak: 0 });
  const [units, setUnits] = useState<"kg" | "lbs">("kg");

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserStats(user.id).then((data) => {
          if (data) setStats(data);
        });
      }
    }, [user]),
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] ||
              user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
              "S"}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            "Athlete"}
        </Text>
        <Text style={styles.email}>
          {user?.emailAddresses?.[0]?.emailAddress}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>

      {/* Units Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons name="barbell-outline" size={20} color="#6B6B6B" />
          <Text style={styles.settingText}>Weight Units</Text>
        </View>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleOption, units === "kg" && styles.toggleActive]}
            onPress={() => setUnits("kg")}
          >
            <Text
              style={[
                styles.toggleText,
                units === "kg" && styles.toggleTextActive,
              ]}
            >
              KG
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              units === "lbs" && styles.toggleActive,
            ]}
            onPress={() => setUnits("lbs")}
          >
            <Text
              style={[
                styles.toggleText,
                units === "lbs" && styles.toggleTextActive,
              ]}
            >
              LBS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Version */}
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B6B6B"
          />
          <Text style={styles.settingText}>Version</Text>
        </View>
        <Text style={styles.settingValue}>1.0.0</Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#FF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold" },
  name: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  email: { color: "#6B6B6B", fontSize: 14, marginTop: 4 },
  statsRow: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statCard: { alignItems: "center" },
  statNumber: { color: "#FF6B6B", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#6B6B6B", fontSize: 12, marginTop: 4 },
  divider: { width: 1, backgroundColor: "#2A2A2A" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingRow: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { color: "#FFFFFF", fontSize: 15 },
  settingValue: { color: "#6B6B6B", fontSize: 14 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 2,
  },
  toggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleActive: { backgroundColor: "#FF6B6B" },
  toggleText: { color: "#6B6B6B", fontSize: 13, fontWeight: "600" },
  toggleTextActive: { color: "#FFFFFF" },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
    padding: 16,
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
  },
  signOutText: { color: "#FF4444", fontSize: 15, fontWeight: "600" },
});
