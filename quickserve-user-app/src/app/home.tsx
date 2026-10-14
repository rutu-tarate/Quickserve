
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import api from "../services/api";

const categories = [
  { name: "All", emoji: "🍽️" },
  { name: "Paneer", emoji: "🍛" },
  { name: "Burger", emoji: "🍔" },
  { name: "Cake", emoji: "🍰" },
  { name: "Pizza", emoji: "🍕" },
];

type Restaurant = {
  _id?: string;
  id?: string;
  name: string;
  address?: string;
  location?: string;
  rating?: number;
};

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
};

const popularFoods: Food[] = [
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Delicious Paneer Butter Masala",
    price: 280,
    emoji: "🍛",
  },
  {
    id: "paneer-kaju-masala",
    name: "Paneer Kaju Masala",
    description: "Rich creamy paneer curry",
    price: 320,
    emoji: "🥘",
  },
  {
    id: "veg-burger",
    name: "Veg Burger",
    description: "Fresh and tasty burger",
    price: 120,
    emoji: "🍔",
  },
];

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      setLoading(true);

      const response = await api.get("/restaurants");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];

      setRestaurants(data);
    } catch (error) {
      console.log("Restaurants error:", error);
      Alert.alert(
        "Connection issue",
        "Restaurants load झाले नाहीत. Backend आणि API URL तपास."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRestaurants = restaurants.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  function openRestaurant(item: Restaurant) {
    const id = item._id || item.id;

    if (!id) {
      Alert.alert("Error", "Restaurant ID उपलब्ध नाही.");
      return;
    }

    router.push({
      pathname: "/menu",
      params: {
        restaurantId: id,
        restaurantName: item.name,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>QuickServe 🍴</Text>
            <Text style={styles.location}>📍 Wai, Maharashtra</Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileEmoji}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="Restaurant name or a dish..."
            placeholderTextColor="#858585"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Pressable
          style={styles.vegRow}
          onPress={() => setVegOnly(!vegOnly)}
        >
          <Text style={styles.vegText}>
            🟢 VEG ONLY {vegOnly ? "✓" : ""}
          </Text>
          <Text style={styles.vegToggle}>
            {vegOnly ? "ON" : "OFF"}
          </Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => setCategory(item.name)}
              style={[
                styles.category,
                category === item.name && styles.categoryActive,
              ]}
            >
              <Text style={styles.categoryEmoji}>{item.emoji}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.offer}>
          <Text style={styles.offerSmall}>QUICKSERVE SPECIAL</Text>
          <Text style={styles.offerTitle}>Delicious food, delivered!</Text>
          <Text style={styles.offerSubtitle}>
            Explore your favourite restaurants
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restaurants near you 🏪</Text>
          <Pressable onPress={() => router.push("/restaurants")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FC6534"
            style={{ margin: 25 }}
          />
        ) : filteredRestaurants.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>
              {search
                ? "No matching restaurants found."
                : "No restaurants available right now."}
            </Text>
            <Pressable onPress={loadRestaurants}>
              <Text style={styles.seeAll}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredRestaurants.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) =>
              item._id || item.id || `${item.name}-${index}`
            }
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.restaurantCard}
                onPress={() => openRestaurant(item)}
              >
                <View style={styles.restaurantImage}>
                  <Text style={styles.restaurantEmoji}>🍴</Text>
                </View>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.address} numberOfLines={1}>
                    📍 {item.address || item.location || "Wai"}
                  </Text>
                  <Text style={styles.rating}>
                    ⭐ {item.rating ?? "New"} · 25–35 min
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular food 🍴</Text>
        </View>

        {popularFoods
          .filter((food) => {
            const matchesSearch = food.name
              .toLowerCase()
              .includes(search.toLowerCase());

            const matchesCategory =
              category === "All" ||
              food.name.toLowerCase().includes(category.toLowerCase());

            return matchesSearch && matchesCategory;
          })
          .map((food) => (
            <View style={styles.foodCard} key={food.id}>
              <View style={styles.foodImage}>
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
              </View>

              <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodDescription}>
                  {food.description}
                </Text>
                <Text style={styles.price}>₹{food.price}</Text>
              </View>

              <Pressable
                style={styles.addButton}
                onPress={() =>
                  Alert.alert(
                    "Select restaurant",
                    "Actual menu मधून item add करण्यासाठी restaurant निवड."
                  )
                }
              >
                <Text style={styles.addText}>+ ADD</Text>
              </Pressable>
            </View>
          ))}

        <View style={styles.bottomLinks}>
          <Pressable onPress={() => router.push("/cart")}>
            <Text style={styles.bottomLink}>🛒 View Cart</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/orders")}>
            <Text style={styles.bottomLink}>📦 My Orders</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 25, fontWeight: "900", color: "#222222" },
  location: { marginTop: 5, color: "#777777", fontSize: 13 },
  profileButton: {
    backgroundColor: "#FFF0E9",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  profileEmoji: { fontSize: 23 },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    height: 54,
  },
  searchIcon: { fontSize: 28, color: "#FC6534", marginRight: 8 },
  search: { flex: 1, fontSize: 15, color: "#222222" },
  vegRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 14,
    alignItems: "center",
  },
  vegText: { color: "#333333", fontWeight: "700" },
  vegToggle: {
    color: "#FC6534",
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#FC6534",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categories: { paddingHorizontal: 12, paddingVertical: 20, gap: 12 },
  category: {
    width: 76,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  categoryActive: { backgroundColor: "#FFF0E9" },
  categoryEmoji: { fontSize: 32 },
  categoryName: { marginTop: 6, color: "#333333", fontWeight: "600" },
  offer: {
    backgroundColor: "#FFF0E9",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    minHeight: 130,
    justifyContent: "center",
  },
  offerSmall: { color: "#FC6534", fontWeight: "800", fontSize: 11 },
  offerTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
    color: "#252525",
  },
  offerSubtitle: { marginTop: 6, color: "#777777" },
  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 26,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: "#222222" },
  seeAll: { color: "#FC6534", fontWeight: "800" },
  restaurantCard: {
    width: 245,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    marginRight: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  restaurantImage: {
    height: 125,
    backgroundColor: "#FFF0E9",
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantEmoji: { fontSize: 54 },
  restaurantInfo: { padding: 12 },
  restaurantName: { fontSize: 17, fontWeight: "900", color: "#222222" },
  address: { marginTop: 7, color: "#777777", fontSize: 12 },
  rating: { marginTop: 9, color: "#444444", fontWeight: "700" },
  empty: { alignItems: "center", padding: 25 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: "#777777", marginVertical: 12 },
  foodCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  foodImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: "#FFF0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  foodEmoji: { fontSize: 38 },
  foodDetails: { flex: 1, paddingHorizontal: 12 },
  foodName: { fontSize: 15, fontWeight: "900", color: "#222222" },
  foodDescription: { marginTop: 5, fontSize: 11, color: "#888888" },
  price: { marginTop: 7, fontWeight: "900", fontSize: 16 },
  addButton: {
    backgroundColor: "#FC6534",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 24,
  },
  bottomLink: { color: "#FC6534", fontWeight: "800" },
});
