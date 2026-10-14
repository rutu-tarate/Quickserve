
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home" />
      <Stack.Screen name="restaurants" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
