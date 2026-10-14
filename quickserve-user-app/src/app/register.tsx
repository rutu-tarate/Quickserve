import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleRegister = () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "Required",
        "Please fill all fields."
      );
      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    Alert.alert(
      "Registration Successful",
      "Your account has been created.",
      [
        {
          text: "Login",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BACK */}

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </Pressable>

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>
                🍴
              </Text>
            </View>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join QuickServe and order your favourite
              food
            </Text>
          </View>

          {/* NAME */}

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          {/* PHONE */}

          <Text style={styles.label}>
            Mobile Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* EMAIL */}

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* PASSWORD */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* CONFIRM PASSWORD */}

          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* REGISTER BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              Create Account
            </Text>
          </Pressable>

          {/* LOGIN */}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace("/")}
            >
              <Text style={styles.loginLink}>
                {" "}Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 25,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logoIcon: {
    fontSize: 34,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#FAFAFA",
    marginBottom: 18,
  },

  registerButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#777777",
    fontSize: 14,
  },

  loginLink: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "700",
  },
});