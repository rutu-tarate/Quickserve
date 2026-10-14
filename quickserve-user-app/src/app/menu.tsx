import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../services/api";

type FoodItem = {
  _id: string;
  foodName: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  restaurantId: string | { _id: string };
};

type CartEntry = {
  _id: string;
  menuId: string | { _id: string };
  quantity: number;
};

type SelectedItem = {
  cartId: string;
  quantity: number;
};

export default function MenuScreen() {
  const params = useLocalSearchParams<{
    restaurantId?: string;
    restaurantName?: string;
  }>();

  const restaurantId = Array.isArray(params.restaurantId)
    ? params.restaurantId[0]
    : params.restaurantId;

  const restaurantName = Array.isArray(params.restaurantName)
    ? params.restaurantName[0]
    : params.restaurantName || "Restaurant";

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Record<string, SelectedItem>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const getId = (value: string | { _id: string } | undefined) => {
    if (!value) return "";
    return typeof value === "object" ? value._id : value;
  };

  // Load menu from backend
  const loadMenu = useCallback(async () => {
    try {
      const response = await api.get("/menu");
      const result = response.data;

      const allFoods: FoodItem[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      const filteredFoods = restaurantId
        ? allFoods.filter(
            (food) =>
              getId(food.restaurantId) === String(restaurantId),
          )
        : allFoods;

      setFoods(filteredFoods);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Menu load झाले नाही. Backend connection तपासा.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : String(message),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  // Load saved cart from backend
  const loadCart = useCallback(async () => {
    try {
      const response = await api.get("/cart");
      const result = response.data;

      const entries: CartEntry[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      const map: Record<string, SelectedItem> = {};

      entries.forEach((entry) => {
        const foodId = getId(entry.menuId);

        if (!foodId) return;

        // Keep a single cart record for each food item.
        if (map[foodId]) {
          map[foodId].quantity += Number(entry.quantity || 0);
        } else {
          map[foodId] = {
            cartId: entry._id,
            quantity: Number(entry.quantity || 0),
          };
        }
      });

      setSelectedItems(map);
    } catch {
      // Login may be required to load the cart.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMenu();
      loadCart();
    }, [loadMenu, loadCart]),
  );

  // Food categories
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          foods
            .map((food) => food.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    ],
    [foods],
  );

  const visibleFoods =
    selectedCategory === "All"
      ? foods
      : foods.filter((food) => food.category === selectedCategory);

  // Cart summary
  const cartCount = Object.values(selectedItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const cartTotal = foods.reduce((sum, food) => {
    const quantity = selectedItems[food._id]?.quantity || 0;
    return sum + Number(food.price) * quantity;
  }, 0);

  // Prevent repeated requests for the same food
  const setBusy = (foodId: string, busy: boolean) => {
    setBusyIds((current) =>
      busy
        ? current.includes(foodId)
          ? current
          : [...current, foodId]
        : current.filter((id) => id !== foodId),
    );
  };

  // ADD button: create cart record
  const addToCart = async (food: FoodItem) => {
    if (busyIds.includes(food._id)) return;

    setBusy(food._id, true);

    try {
      const response = await api.post("/cart", {
        menuId: food._id,
        quantity: 1,
      });

      const savedCart = response.data?.data;

      if (!savedCart?._id) {
        await loadCart();
        Alert.alert("QuickServe", "Cart refresh करून पुन्हा तपासा.");
        return;
      }

      setSelectedItems((current) => ({
        ...current,
        [food._id]: {
          cartId: savedCart._id,
          quantity: 1,
        },
      }));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Item add झाला नाही. Login आणि backend तपासा.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : String(message),
      );
    } finally {
      setBusy(food._id, false);
    }
  };

  // PLUS button: increase quantity in database
  const increaseQuantity = async (food: FoodItem) => {
    if (busyIds.includes(food._id)) return;

    const current = selectedItems[food._id];
    if (!current) {
      await addToCart(food);
      return;
    }

    setBusy(food._id, true);

    try {
      const response = await api.patch(`/cart/${current.cartId}`, {
        quantity: current.quantity + 1,
      });

      const updated = response.data?.data;

      setSelectedItems((previous) => ({
        ...previous,
        [food._id]: {
          cartId: updated?._id || current.cartId,
          quantity: Number(updated?.quantity ?? current.quantity + 1),
        },
      }));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Quantity update झाली नाही.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : String(message),
      );
    } finally {
      setBusy(food._id, false);
    }
  };

  // MINUS button: decrease quantity or remove the item
  const decreaseQuantity = async (food: FoodItem) => {
    if (busyIds.includes(food._id)) return;

    const current = selectedItems[food._id];
    if (!current) return;

    setBusy(food._id, true);

    try {
      if (current.quantity <= 1) {
        await api.delete(`/cart/${current.cartId}`);

        setSelectedItems((previous) => {
          const updated = { ...previous };
          delete updated[food._id];
          return updated;
        });
      } else {
        const response = await api.patch(`/cart/${current.cartId}`, {
          quantity: current.quantity - 1,
        });

        const updated = response.data?.data;

        setSelectedItems((previous) => ({
          ...previous,
          [food._id]: {
            cartId: updated?._id || current.cartId,
            quantity: Number(updated?.quantity ?? current.quantity - 1),
          },
        }));
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Quantity कमी करता आली नाही.";

      Alert.alert(
        "QuickServe",
        Array.isArray(message) ? message.join("\n") : String(message),
      );
    } finally {
      setBusy(food._id, false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FC8019" />
        <Text style={styles.muted}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurantName}
        </Text>

        <Pressable
          style={styles.headerCart}
          onPress={() => router.push("/cart")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={visibleFoods}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadMenu();
              loadCart();
            }}
            colors={["#FC8019"]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.vegBadge}>
                🌿 Freshly prepared food
              </Text>

              <Text style={styles.heroTitle}>{restaurantName}</Text>

              <Text style={styles.heroSubtitle}>
                Delicious food delivered to your doorstep
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoPill}>⭐ 4.4 Rating</Text>
                <Text style={styles.infoPill}>🕒 25–35 mins</Text>
              </View>
            </View>

            <View style={styles.offer}>
              <Text style={styles.offerTitle}>🏷️ Special Offers</Text>
              <Text style={styles.offerText}>
                Explore the menu and find your favourites!
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Recommended for you</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
            >
              {categories.map((category) => {
                const selected = selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.category,
                      selected && styles.selectedCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.selectedCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedItems[item._id];
          const quantity = selected?.quantity || 0;
          const busy = busyIds.includes(item._id);

          return (
            <View style={styles.foodCard}>
              <View style={styles.foodDetails}>
                <Text style={styles.vegLabel}>🟢 VEG</Text>

                <Text style={styles.foodName}>{item.foodName}</Text>

                <Text style={styles.price}>
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </Text>

                {!!item.description && (
                  <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                  </Text>
                )}
              </View>

              <View style={styles.imageColumn}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.foodImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.foodPlaceholder}>
                    <Text style={styles.placeholderEmoji}>🍽️</Text>
                  </View>
                )}

                {/* ADD changes into - quantity + */}
                {quantity === 0 ? (
                  <Pressable
                    style={[
                      styles.addButton,
                      busy && styles.disabledButton,
                    ]}
                    disabled={busy}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.addText}>
                      {busy ? "ADDING..." : "+ ADD"}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.quantityControl,
                      busy && styles.disabledButton,
                    ]}
                  >
                    <Pressable
                      style={styles.quantityAction}
                      disabled={busy}
                      onPress={() => decreaseQuantity(item)}
                    >
                      <Text style={styles.quantityActionText}>−</Text>
                    </Pressable>

                    <Text style={styles.quantityNumber}>
                      {quantity}
                    </Text>

                    <Pressable
                      style={styles.quantityAction}
                      disabled={busy}
                      onPress={() => increaseQuantity(item)}
                    >
                      <Text style={styles.quantityActionText}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No menu items found</Text>
            <Text style={styles.muted}>
              या restaurant साठी menu items उपलब्ध नाहीत.
              Backend मधील restaurantId आणि menu data तपासा.
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                loadMenu();
              }}
            >
              <Text style={styles.retryText}>Refresh Menu</Text>
            </Pressable>
          </View>
        }
      />

      {/* Show the bottom bar only when cart has items */}
      {cartCount > 0 && (
        <Pressable
          style={styles.viewCart}
          onPress={() => router.push("/cart")}
        >
          <View style={styles.cartSummary}>
            <Text style={styles.viewCartText}>
              {cartCount} {cartCount === 1 ? "item" : "items"} added
            </Text>
            <Text style={styles.cartTotal}>
              ₹{cartTotal.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.continueRow}>
            <Text style={styles.continueText}>Continue →</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  headerBack: {
    paddingVertical: 5,
  },
  backText: {
    color: "#FC8019",
    fontSize: 16,
    fontWeight: "bold",
  },
  restaurantName: {
    flex: 1,
    fontSize: 19,
    fontWeight: "bold",
    color: "#222222",
  },
  headerCart: {
    padding: 4,
    position: "relative",
  },
  cartIcon: {
    fontSize: 25,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#FC8019",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    flexGrow: 1,
  },
  hero: {
    paddingTop: 22,
    paddingBottom: 18,
  },
  vegBadge: {
    color: "#198754",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#292D3A",
    marginTop: 10,
  },
  heroSubtitle: {
    color: "#777777",
    marginTop: 7,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 15,
  },
  infoPill: {
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    color: "#444444",
    overflow: "hidden",
  },
  offer: {
    backgroundColor: "#FFF4E9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 24,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  offerText: {
    color: "#666666",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 12,
  },
  categories: {
    marginBottom: 12,
    maxHeight: 48,
  },
  category: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 24,
    marginRight: 9,
  },
  selectedCategory: {
    backgroundColor: "#FC8019",
    borderColor: "#FC8019",
  },
  categoryText: {
    color: "#444444",
    fontWeight: "600",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
  foodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    gap: 12,
  },
  foodDetails: {
    flex: 1,
  },
  vegLabel: {
    fontSize: 12,
    color: "#198754",
    marginBottom: 8,
  },
  foodName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#292929",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 9,
  },
  description: {
    fontSize: 13,
    color: "#888888",
    marginTop: 8,
    lineHeight: 19,
  },
  imageColumn: {
    width: 125,
    alignItems: "center",
  },
  foodImage: {
    width: 125,
    height: 105,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  foodPlaceholder: {
    width: 125,
    height: 105,
    borderRadius: 12,
    backgroundColor: "#FFF0E2",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: {
    fontSize: 42,
  },
  addButton: {
    width: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FC8019",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: -13,
    elevation: 3,
    alignItems: "center",
  },
  addText: {
    color: "#FC8019",
    fontWeight: "bold",
  },
  quantityControl: {
    width: 115,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FC8019",
    borderRadius: 8,
    marginTop: -13,
    elevation: 3,
  },
  quantityAction: {
    width: 34,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityActionText: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FC8019",
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },
  disabledButton: {
    opacity: 0.5,
  },
  empty: {
    alignItems: "center",
    padding: 24,
    marginTop: 15,
  },
  emptyEmoji: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333333",
  },
  muted: {
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#FC8019",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewCart: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: "#FC8019",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartSummary: {
    flex: 1,
  },
  viewCartText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  cartTotal: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  continueRow: {
    paddingLeft: 12,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});