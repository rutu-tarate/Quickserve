
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../services/api";

type Food = {
  _id: string;
  foodName: string;
  price: number;
  image?: string;
  description?: string;
};

type CartRecord = {
  _id: string;
  menuId: string | { _id: string };
  quantity: number;
};

type CartRow = CartRecord & {
  food?: Food;
};

const unwrap = (response: any): any[] => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const menuIdOf = (item: CartRecord) =>
  typeof item.menuId === "string" ? item.menuId : item.menuId?._id;

export default function CartScreen() {
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const loadCart = async () => {
    try {
      const [cartResponse, menuResponse] = await Promise.all([
        api.get("/cart"),
        api.get("/menu"),
      ]);

      const cartItems: CartRecord[] = unwrap(cartResponse);
      const foods: Food[] = unwrap(menuResponse);

      const rows: CartRow[] = cartItems.map((item) => ({
        ...item,
        food: foods.find((food) => food._id === menuIdOf(item)),
      }));

      setItems(rows);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Cart load झाला नाही. Login आणि backend तपासा.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : message
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadCart();
    }, [])
  );

  const updateQuantity = async (item: CartRow, quantity: number) => {
    if (busyId) return;

    try {
      setBusyId(item._id);

      if (quantity < 1) {
        await api.delete(`/cart/${item._id}`);
      } else {
        await api.patch(`/cart/${item._id}`, { quantity });
      }

      await loadCart();
    } catch (error: any) {
      Alert.alert(
        "QuickServe",
        error?.response?.data?.message || "Cart update झाला नाही."
      );
    } finally {
      setBusyId("");
    }
  };

  const removeItem = (item: CartRow) => {
    Alert.alert(
      "Remove item",
      `${item.food?.foodName || "This item"} cart मधून remove करायचा आहे?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => updateQuantity(item, 0),
        },
      ]
    );
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.food?.price) || 0) * item.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FC8019" />
        <Text style={styles.muted}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.heading}>My Cart 🛒</Text>
        <View style={{ width: 45 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.muted}>
            Add your favourite food from a restaurant.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/restaurants")}
          >
            <Text style={styles.primaryText}>Explore Restaurants</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.itemCount}>
                {totalQuantity} item(s) in your cart
              </Text>
            }
            renderItem={({ item }) => {
              const food = item.food;

              return (
                <View style={styles.card}>
                  {food?.image ? (
                    <Image
                      source={{ uri: food.image }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={{ fontSize: 32 }}>🍽️</Text>
                    </View>
                  )}

                  <View style={styles.details}>
                    <Text style={styles.foodName}>
                      {food?.foodName || "Food item"}
                    </Text>

                    <Text style={styles.price}>
                      ₹{Number(food?.price) || 0}
                    </Text>

                    <View style={styles.controls}>
                      <Pressable
                        disabled={!!busyId}
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item, item.quantity - 1)
                        }
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>

                      <Text style={styles.qtyNumber}>
                        {item.quantity}
                      </Text>

                      <Pressable
                        disabled={!!busyId}
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.lineTotal}>
                      Item total: ₹
                      {(Number(food?.price) || 0) * item.quantity}
                    </Text>

                    <Pressable onPress={() => removeItem(item)}>
                      <Text style={styles.remove}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              <View style={styles.bill}>
                <Text style={styles.billHeading}>Bill Details</Text>

                <View style={styles.billRow}>
                  <Text style={styles.muted}>Item total</Text>
                  <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.muted}>Delivery fee</Text>
                  <Text style={styles.billValue}>Calculated at checkout</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.billRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
                </View>

                <Text style={styles.note}>
                  Final amount may include delivery fees and applicable taxes.
                </Text>
              </View>
            }
          />

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.bottomPrice}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  back: { color: "#FC8019", fontSize: 16, fontWeight: "bold" },
  heading: { color: "#222222", fontSize: 21, fontWeight: "bold" },
  list: { padding: 16, paddingBottom: 120 },
  itemCount: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 12,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
    elevation: 1,
  },
  image: { width: 100, height: 110, borderRadius: 10 },
  imagePlaceholder: {
    width: 100,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#FFF0E2",
    alignItems: "center",
    justifyContent: "center",
  },
  details: { flex: 1 },
  foodName: { fontSize: 16, fontWeight: "bold", color: "#222222" },
  price: { fontSize: 15, fontWeight: "bold", marginTop: 6, color: "#333333" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FC8019",
    borderRadius: 7,
    marginTop: 10,
  },
  qtyButton: { paddingHorizontal: 11, paddingVertical: 4 },
  qtyText: { color: "#FC8019", fontSize: 21, fontWeight: "bold" },
  qtyNumber: {
    color: "#222222",
    fontSize: 15,
    fontWeight: "bold",
    minWidth: 22,
    textAlign: "center",
  },
  lineTotal: { marginTop: 8, color: "#555555", fontSize: 13 },
  remove: { color: "#D93025", marginTop: 8, fontWeight: "600" },
  bill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
  },
  billHeading: {
    fontSize: 18,
    color: "#222222",
    fontWeight: "bold",
    marginBottom: 15,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 7,
    gap: 12,
  },
  billValue: { color: "#333333", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#EEEEEE", marginVertical: 8 },
  totalLabel: { color: "#222222", fontSize: 16, fontWeight: "bold" },
  totalValue: { color: "#222222", fontSize: 18, fontWeight: "bold" },
  note: { fontSize: 12, color: "#888888", marginTop: 10, lineHeight: 18 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 3,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: "#FC8019",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: "#777777", fontSize: 13 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIcon: { fontSize: 65, marginBottom: 15 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#FC8019",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 22,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "bold" },
});
