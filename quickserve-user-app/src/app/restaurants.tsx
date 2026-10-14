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

type Restaurant = {
  _id: string;
  name: string;
  address?: string;
  image?: string;
  status?: boolean;
};

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    try {
      const response = await api.get("/restaurants");
      const result = response.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setRestaurants(list.filter((item: Restaurant) => item.status !== false));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Restaurants load झाले नाहीत. Backend आणि API IP तपासा.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRestaurants();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FC8019" />
        <Text style={styles.subtitle}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Restaurants 🍽️</Text>
      <Text style={styles.subtitle}>Discover food near you</Text>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRestaurants();
            }}
            colors={["#FC8019"]}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
  router.push({
    pathname: "/menu",
    params: {
      restaurantId: item._id,
      restaurantName: item.name,
      restaurantImage: item.image || "",
    },
  })
}
          >
            <View style={styles.iconBox}>
              <Text style={styles.foodIcon}>🍴</Text>
            </View>

            <View style={styles.details}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>
                {item.address || "Address not available"}
              </Text>
              <Text style={styles.link}>View Menu →</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No restaurants available</Text>
            <Text style={styles.subtitle}>
              Add restaurants through your backend or admin dashboard.
            </Text>
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
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },
  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#FFF0E2",
    alignItems: "center",
    justifyContent: "center",
  },
  foodIcon: {
    fontSize: 30,
  },
  details: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  address: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },
  link: {
    fontSize: 14,
    color: "#FC8019",
    fontWeight: "bold",
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  backButton: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#FC8019",
    fontWeight: "600",
  },
});