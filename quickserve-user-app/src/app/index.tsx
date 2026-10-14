
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Required", "Email आणि password टाक.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { access_token, user } = response.data;

      if (!access_token) {
        throw new Error("Backend ने login token दिला नाही.");
      }

      await AsyncStorage.setItem("token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      router.replace("/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Backend connection तपास.";

      Alert.alert(
        "Login Failed",
        Array.isArray(message) ? message.join("\n") : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>QuickServe 🍴</Text>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to order your favourite food</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/register")}>
          <Text style={styles.register}>
            Don't have an account? Register
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: 28,
  },
  title: { fontSize: 27, fontWeight: "800", color: "#222222" },
  subtitle: { color: "#777777", marginTop: 8, marginBottom: 28 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    color: "#222222",
  },
  button: {
    backgroundColor: "#FF6B35",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  register: {
    textAlign: "center",
    marginTop: 24,
    color: "#FF6B35",
    fontWeight: "700",
  },
});
