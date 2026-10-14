import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type User = {
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch {
        Alert.alert("Error", "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "access_token", "user"]);
      router.replace("/");
    } catch {
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FC8019" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{user?.name || "QuickServe User"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "Not available"}</Text>

        <Text style={styles.label}>Mobile</Text>
        <Text style={styles.value}>{user?.mobile || "Not available"}</Text>

        <Text style={styles.label}>Account Type</Text>
        <Text style={styles.value}>{user?.role || "CUSTOMER"}</Text>
      </View>

      <Pressable
        style={styles.ordersButton}
        onPress={() => router.push("/orders")}
      >
        <Text style={styles.buttonText}>📦  My Orders</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.replace("/home")}>
        <Text style={styles.backText}>← Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
    paddingTop: 55,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    elevation: 3,
  },
  avatar: {
    fontSize: 55,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 22,
    color: "#222",
  },
  label: {
    alignSelf: "flex-start",
    color: "#777",
    fontSize: 13,
    marginTop: 12,
  },
  value: {
    alignSelf: "flex-start",
    color: "#222",
    fontSize: 16,
    marginTop: 4,
  },
  ordersButton: {
    backgroundColor: "#FC8019",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#D93636",
    padding: 16,
    borderRadius: 12,
    marginTop: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 16,
    alignItems: "center",
  },
  backText: {
    color: "#FC8019",
    fontSize: 16,
    fontWeight: "600",
  },
});