
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function CheckoutScreen() {
  const { subtotal = "0" } = useLocalSearchParams<{ subtotal?: string }>();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.heading}>Delivery address</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter full delivery address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <View style={styles.summary}>
          <Text style={styles.heading}>Bill summary</Text>
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>₹{subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text>Delivery charges</Text>
            <Text>Calculated by backend</Text>
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            if (!address.trim()) {
              Alert.alert("Required", "Delivery address enter कर.");
              return;
            }

            if (!/^[6-9]\d{9}$/.test(phone)) {
              Alert.alert("Invalid number", "Valid 10-digit mobile number enter कर.");
              return;
            }

            Alert.alert(
              "Address ready",
              "Address भरला आहे. Order placement आणि payment जोडण्यासाठी backend order API configure करणे बाकी आहे."
            );
          }}
        >
          <Text style={styles.buttonText}>Continue to payment</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  back: { color: "#FC6534", fontWeight: "800" },
  title: { fontSize: 20, fontWeight: "900" },
  heading: { fontSize: 19, fontWeight: "900", marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    minHeight: 52,
    color: "#222222",
  },
  summary: {
    marginTop: 15,
    padding: 18,
    backgroundColor: "#FFF0E9",
    borderRadius: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 12,
  },
  button: {
    backgroundColor: "#FC6534",
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 25,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
});
