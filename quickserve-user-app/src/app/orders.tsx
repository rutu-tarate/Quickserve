import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../services/api";

type OrderItem = {
  foodName: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  items?: OrderItem[];
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders/my");
      const result = response.data;

      const orderList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setOrders(orderList);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Could not load orders. Please login and try again.";

      Alert.alert("Orders", Array.isArray(message) ? message.join("\n") : message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [])
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.orderTitle}>
          Order #{item._id.slice(-6).toUpperCase()}
        </Text>
        <Text style={styles.status}>{item.status || "Pending"}</Text>
      </View>

      {item.items?.map((food, index) => (
        <Text key={`${item._id}-${index}`} style={styles.food}>
          {food.foodName} × {food.quantity} — ₹
          {Number(food.price || 0) * Number(food.quantity || 0)}
        </Text>
      ))}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>₹{item.totalAmount ?? 0}</Text>
      </View>

      <Text style={styles.payment}>
        Payment: {item.paymentStatus || "Pending"}
      </Text>

      {item.createdAt ? (
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FC8019" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Orders 📦</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={
          orders.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            colors={["#FC8019"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Your placed orders will appear here.
            </Text>
            <Pressable
              style={styles.shopButton}
              onPress={() => router.replace("/home")}
            >
              <Text style={styles.shopButtonText}>Explore Restaurants</Text>
            </Pressable>
          </View>
        }
      />

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.backText}>← Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 55,
  },
  heading: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#222",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
  },
  status: {
    color: "#FC8019",
    fontWeight: "bold",
  },
  food: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 14,
  },
  totalLabel: {
    fontSize: 15,
    color: "#555",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  payment: {
    marginTop: 10,
    color: "#666",
    fontSize: 13,
  },
  date: {
    marginTop: 6,
    color: "#888",
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 55,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: "#FC8019",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  backButton: {
    padding: 15,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backText: {
    color: "#FC8019",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
});