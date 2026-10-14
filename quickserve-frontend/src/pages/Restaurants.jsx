import { useEffect, useState } from "react";
import axios from "axios";

function Restaurants({ onBack }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    phone: "",
    address: "",
    image: "",
  });

  // =========================================
  // FETCH RESTAURANTS
  // =========================================

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/restaurants",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setRestaurants(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setRestaurants(response.data);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error(
        "Restaurants API Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin access required.");
      } else {
        setError("Unable to load restaurants.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // =========================================
  // COUNTS
  // =========================================

  const totalRestaurants = restaurants.length;

  const activeRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === true
  ).length;

  const inactiveRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === false
  ).length;

  // =========================================
  // FILTER
  // =========================================

  const filteredRestaurants = restaurants.filter(
    (restaurant) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        restaurant.name
          ?.toLowerCase()
          .includes(searchText) ||
        restaurant.owner
          ?.toLowerCase()
          .includes(searchText) ||
        restaurant.phone
          ?.toString()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          restaurant.status === true) ||
        (statusFilter === "inactive" &&
          restaurant.status === false);

      return matchesSearch && matchesStatus;
    }
  );

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // ADD
  // =========================================

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      name: "",
      owner: "",
      phone: "",
      address: "",
      image: "",
    });

    setError("");
    setShowForm(true);
  };

  // =========================================
  // EDIT
  // =========================================

  const handleEdit = (restaurant) => {
    setEditingId(restaurant._id);

    setFormData({
      name: restaurant.name || "",
      owner: restaurant.owner || "",
      phone: restaurant.phone || "",
      address: restaurant.address || "",
      image: restaurant.image || "",
    });

    setError("");
    setShowForm(true);
  };

  // =========================================
  // CANCEL
  // =========================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);

    setFormData({
      name: "",
      owner: "",
      phone: "",
      address: "",
      image: "",
    });
  };

  // =========================================
  // CREATE / UPDATE
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.owner.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (editingId) {
        await axios.patch(
          `http://localhost:3000/restaurants/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/restaurants",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      handleCancel();
      await fetchRestaurants();
    } catch (error) {
      console.error(
        "Save Restaurant Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(
          message || "Unable to save restaurant."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // STATUS CHANGE
  // =========================================

  const handleStatusChange = async (
    id,
    currentStatus
  ) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3000/restaurants/${id}/status`,
        {
          status: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchRestaurants();
    } catch (error) {
      console.error(
        "Status Update Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to update restaurant status."
      );
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/restaurants/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchRestaurants();
    } catch (error) {
      console.error(
        "Delete Restaurant Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete restaurant."
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loaderIcon}>
          🍽️
        </div>

        <h2 style={styles.loadingTitle}>
          Loading Restaurants...
        </h2>

        <p style={styles.loadingText}>
          Please wait while we fetch restaurants.
        </p>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div style={styles.container}>

      {/* =====================================
          HEADER - STATIC
      ====================================== */}

      <div style={styles.header}>

        <div>
          <div style={styles.pageLabel}>
            QUICKSERVE ADMIN
          </div>

          <h1 style={styles.title}>
            🍽️ Restaurants
          </h1>

          <p style={styles.subtitle}>
            Manage restaurants, owners and availability
          </p>
        </div>

        <div style={styles.headerActions}>

          <button
            onClick={fetchRestaurants}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

          <button
            onClick={handleAdd}
            style={styles.addButton}
          >
            + Add Restaurant
          </button>

          <button
            onClick={onBack}
            style={styles.backButton}
          >
            ← Dashboard
          </button>

        </div>

      </div>

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div style={styles.error}>

          <span>⚠️</span>

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            style={styles.errorClose}
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================
          STATS - STATIC
      ====================================== */}

      <div style={styles.statsGrid}>

        {/* TOTAL */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#eff6ff",
            }}
          >
            🏪
          </div>

          <div>
            <p style={styles.statLabel}>
              Total Restaurants
            </p>

            <h2 style={styles.statNumber}>
              {totalRestaurants}
            </h2>
          </div>

        </div>

        {/* ACTIVE */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#ecfdf5",
            }}
          >
            ✓
          </div>

          <div>
            <p style={styles.statLabel}>
              Active
            </p>

            <h2 style={styles.statNumber}>
              {activeRestaurants}
            </h2>
          </div>

        </div>

        {/* INACTIVE */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fef2f2",
            }}
          >
            !
          </div>

          <div>
            <p style={styles.statLabel}>
              Inactive
            </p>

            <h2 style={styles.statNumber}>
              {inactiveRestaurants}
            </h2>
          </div>

        </div>

        {/* OWNERS */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fff7ed",
            }}
          >
            👥
          </div>

          <div>
            <p style={styles.statLabel}>
              Owners
            </p>

            <h2 style={styles.statNumber}>
              {totalRestaurants}
            </h2>
          </div>

        </div>

      </div>

      {/* =====================================
          ONLY THIS AREA SCROLLS
      ====================================== */}

      <div style={styles.restaurantScrollArea}>

        {/* ===================================
            SEARCH + FILTER
        ==================================== */}

        <div style={styles.filterCard}>

          <div style={styles.searchBox}>

            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by restaurant, owner or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.searchInput}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                style={styles.clearSearch}
              >
                ×
              </button>
            )}

          </div>

          <div style={styles.filters}>

            <button
              onClick={() =>
                setStatusFilter("all")
              }
              style={
                statusFilter === "all"
                  ? styles.filterActive
                  : styles.filterButton
              }
            >
              All ({totalRestaurants})
            </button>

            <button
              onClick={() =>
                setStatusFilter("active")
              }
              style={
                statusFilter === "active"
                  ? styles.filterActive
                  : styles.filterButton
              }
            >
              🟢 Active ({activeRestaurants})
            </button>

            <button
              onClick={() =>
                setStatusFilter("inactive")
              }
              style={
                statusFilter === "inactive"
                  ? styles.filterActive
                  : styles.filterButton
              }
            >
              🔴 Inactive ({inactiveRestaurants})
            </button>

          </div>

        </div>

        {/* ===================================
            RESTAURANT LIST HEADER
        ==================================== */}

        <div style={styles.listHeader}>

          <div>

            <h2 style={styles.listTitle}>
              Restaurant List
            </h2>

            <p style={styles.listSubtitle}>
              Showing{" "}
              <span style={styles.countNormal}>
                {filteredRestaurants.length}
              </span>{" "}
              of{" "}
              <span style={styles.countNormal}>
                {restaurants.length}
              </span>{" "}
              restaurants
            </p>

          </div>

        </div>

        {/* ===================================
            NO DATA
        ==================================== */}

        {filteredRestaurants.length === 0 ? (

          <div style={styles.emptyCard}>

            <div style={styles.emptyIcon}>
              🍽️
            </div>

            <h2 style={styles.emptyTitle}>
              No Restaurants Found
            </h2>

            <p style={styles.emptyText}>
              Try changing your search or filter.
            </p>

            <button
              onClick={handleAdd}
              style={styles.addButton}
            >
              + Add Restaurant
            </button>

          </div>

        ) : (

          /* =================================
             RESTAURANT LIST
          ================================== */

          <div style={styles.restaurantGrid}>

            {filteredRestaurants.map(
              (restaurant, index) => (

                <div
                  key={restaurant._id}
                  style={styles.restaurantCard}
                >

                  {/* IMAGE */}

                  <div style={styles.imageContainer}>

                    {restaurant.image ? (

                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        style={styles.restaurantImage}
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div
                        style={
                          styles.imagePlaceholder
                        }
                      >
                        🍽️
                      </div>

                    )}

                    {/* STATUS */}

                    <span
                      style={
                        restaurant.status
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {restaurant.status
                        ? "● Active"
                        : "● Inactive"}
                    </span>

                  </div>

                  {/* CONTENT */}

                  <div style={styles.cardContent}>

                    {/* NAME */}

                    <div style={styles.nameSection}>

                      <div>

                        <h3
                          style={
                            styles.restaurantName
                          }
                        >
                          {restaurant.name ||
                            "Unnamed Restaurant"}
                        </h3>

                        <span
                          style={
                            styles.restaurantId
                          }
                        >
                          ID: #
                          {restaurant._id?.slice(
                            -5
                          )}
                        </span>

                      </div>

                      <span
                        style={styles.cardNumber}
                      >
                        #{index + 1}
                      </span>

                    </div>

                    {/* INFORMATION */}

                    <div style={styles.infoBlock}>

                      {/* OWNER */}

                      <div style={styles.infoRow}>

                        <div
                          style={
                            styles.infoIconBox
                          }
                        >
                          👤
                        </div>

                        <div>
                          <div
                            style={
                              styles.infoLabel
                            }
                          >
                            Owner
                          </div>

                          <div
                            style={
                              styles.infoValue
                            }
                          >
                            {restaurant.owner ||
                              "N/A"}
                          </div>
                        </div>

                      </div>

                      {/* PHONE */}

                      <div style={styles.infoRow}>

                        <div
                          style={
                            styles.infoIconBox
                          }
                        >
                          📞
                        </div>

                        <div>
                          <div
                            style={
                              styles.infoLabel
                            }
                          >
                            Phone
                          </div>

                          <div
                            style={
                              styles.infoValue
                            }
                          >
                            {restaurant.phone ||
                              "N/A"}
                          </div>
                        </div>

                      </div>

                      {/* ADDRESS */}

                      <div
                        style={{
                          ...styles.infoRow,
                          flex: 1.5,
                        }}
                      >

                        <div
                          style={
                            styles.infoIconBox
                          }
                        >
                          📍
                        </div>

                        <div>
                          <div
                            style={
                              styles.infoLabel
                            }
                          >
                            Address
                          </div>

                          <div
                            style={
                              styles.infoValue
                            }
                          >
                            {restaurant.address ||
                              "N/A"}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div style={styles.cardActions}>

                      <button
                        onClick={() =>
                          handleEdit(restaurant)
                        }
                        style={styles.editButton}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            restaurant._id,
                            restaurant.status
                          )
                        }
                        style={
                          restaurant.status
                            ? styles.deactivateButton
                            : styles.activateButton
                        }
                      >
                        {restaurant.status
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            restaurant._id
                          )
                        }
                        style={styles.deleteButton}
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ====================================== */}

      {showForm && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <p style={styles.modalLabel}>
                  QUICKSERVE
                </p>

                <h2 style={styles.modalTitle}>
                  {editingId
                    ? "Edit Restaurant"
                    : "Add Restaurant"}
                </h2>

              </div>

              <button
                onClick={handleCancel}
                style={styles.modalClose}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* IMAGE PREVIEW */}

              <div style={styles.previewArea}>

                {formData.image ? (

                  <img
                    src={formData.image}
                    alt="Preview"
                    style={styles.previewImage}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                ) : (

                  <div
                    style={
                      styles.previewPlaceholder
                    }
                  >
                    🍽️
                  </div>

                )}

              </div>

              {/* FORM */}

              <div style={styles.modalGrid}>

                {/* NAME */}

                <div style={styles.field}>

                  <label style={styles.label}>
                    Restaurant Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Wai Garden"
                    style={styles.input}
                  />

                </div>

                {/* OWNER */}

                <div style={styles.field}>

                  <label style={styles.label}>
                    Owner Name *
                  </label>

                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Patil"
                    style={styles.input}
                  />

                </div>

                {/* PHONE */}

                <div style={styles.field}>

                  <label style={styles.label}>
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    maxLength="10"
                    style={styles.input}
                  />

                </div>

                {/* IMAGE */}

                <div style={styles.field}>

                  <label style={styles.label}>
                    Image URL
                  </label>

                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    style={styles.input}
                  />

                </div>

                {/* ADDRESS */}

                <div
                  style={{
                    ...styles.field,
                    gridColumn: "1 / -1",
                  }}
                >

                  <label style={styles.label}>
                    Address *
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete restaurant address"
                    rows="3"
                    style={styles.textarea}
                  />

                </div>

              </div>

              {/* FORM ERROR */}

              {error && (

                <div style={styles.modalError}>
                  ⚠️ {error}
                </div>

              )}

              {/* MODAL ACTIONS */}

              <div style={styles.modalActions}>

                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "✓ Update Restaurant"
                    : "+ Create Restaurant"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = {

  // =========================================
  // MAIN
  // =========================================

  container: {
    height: "100vh",
    boxSizing: "border-box",
    padding: "24px 30px",
    background: "#f8fafc",
    overflow: "hidden",
  },

  // =========================================
  // HEADER
  // =========================================

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  pageLabel: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#2563eb",
    marginBottom: "4px",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  refreshButton: {
    padding: "9px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  addButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    boxShadow:
      "0 4px 10px rgba(37,99,235,0.18)",
  },

  backButton: {
    padding: "9px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    background: "#1e293b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  // =========================================
  // ERROR
  // =========================================

  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 13px",
    marginBottom: "15px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "12px",
  },

  errorClose: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    fontSize: "19px",
    cursor: "pointer",
    color: "#b91c1c",
  },

  // =========================================
  // STATS
  // =========================================

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "17px",
  },

  statCard: {
    background: "#fff",
    padding: "14px 16px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #eef2f7",
    boxShadow:
      "0 3px 10px rgba(15,23,42,0.04)",
  },

  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b",
  },

  statNumber: {
    margin: "2px 0 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
  },

  // =========================================
  // SCROLL AREA
  // =========================================

  restaurantScrollArea: {
    height: "calc(100vh - 230px)",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "7px",
    paddingBottom: "25px",
  },

  // =========================================
  // SEARCH
  // =========================================

  filterCard: {
    background: "#fff",
    border: "1px solid #eef2f7",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    boxShadow:
      "0 3px 10px rgba(15,23,42,0.04)",
  },

  searchBox: {
    flex: 1,
    minWidth: "260px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "9px",
    fontSize: "14px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 36px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
  },

  clearSearch: {
    position: "absolute",
    right: "9px",
    top: "4px",
    border: "none",
    background: "transparent",
    fontSize: "19px",
    cursor: "pointer",
    color: "#64748b",
  },

  filters: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },

  filterButton: {
    padding: "8px 11px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#475569",
    fontWeight: "600",
    fontSize: "11px",
  },

  filterActive: {
    padding: "8px 11px",
    border: "none",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
  },

  // =========================================
  // LIST HEADER
  // =========================================

  listHeader: {
    marginBottom: "12px",
  },

  listTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "750",
    color: "#111827",
  },

  listSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  countNormal: {
    fontWeight: "500",
    color: "#475569",
  },

  // =========================================
  // RESTAURANT GRID
  // =========================================

  restaurantGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },

  // =========================================
  // RESTAURANT CARD
  // =========================================

  restaurantCard: {
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    border: "1px solid #e8edf3",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.05)",
  },

  imageContainer: {
    height: "100%",
    minHeight: "175px",
    position: "relative",
    background: "#f1f5f9",
  },

  restaurantImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    minHeight: "175px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    background: "#f1f5f9",
  },

  statusActive: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#dcfce7",
    color: "#15803d",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "10px",
    fontWeight: "700",
  },

  statusInactive: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "10px",
    fontWeight: "700",
  },

  // =========================================
  // CARD CONTENT
  // =========================================

  cardContent: {
    padding: "15px 18px",
    minWidth: 0,
  },

  nameSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },

  restaurantName: {
    margin: 0,
    textAlign: "left",
    fontSize: "18px",
    lineHeight: "1.25",
    fontWeight: "700",
    color: "#111827",
  },

  restaurantId: {
    display: "block",
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  cardNumber: {
    fontSize: "10px",
    color: "#94a3b8",
    background: "#f8fafc",
    padding: "4px 7px",
    borderRadius: "5px",
    whiteSpace: "nowrap",
  },

  // =========================================
  // INFO
  // =========================================

  infoBlock: {
    marginTop: "12px",
    padding: "11px 0",
    borderTop: "1px solid #eef2f7",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    minWidth: 0,
    flex: 1,
  },

  infoIconBox: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    flexShrink: 0,
  },

  infoLabel: {
    fontSize: "9px",
    color: "#94a3b8",
    marginBottom: "2px",
  },

  infoValue: {
    fontSize: "12px",
    color: "#475569",
    fontWeight: "600",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },

  // =========================================
  // ACTIONS
  // =========================================

  cardActions: {
    display: "flex",
    gap: "7px",
    marginTop: "11px",
  },

  editButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "10px",
  },

  activateButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    background: "#ecfdf5",
    color: "#15803d",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "10px",
  },

  deactivateButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    background: "#fff7ed",
    color: "#c2410c",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "10px",
  },

  deleteButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "10px",
  },

  // =========================================
  // EMPTY
  // =========================================

  emptyCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "55px 20px",
    textAlign: "center",
    border: "1px solid #eef2f7",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "5px",
  },

  emptyTitle: {
    margin: "5px 0",
    fontSize: "18px",
    color: "#111827",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "16px",
  },

  // =========================================
  // MODAL
  // =========================================

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "23px",
    boxSizing: "border-box",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  modalLabel: {
    margin: 0,
    fontSize: "9px",
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: "1.5px",
  },

  modalTitle: {
    margin: "3px 0 0",
    fontSize: "21px",
    color: "#111827",
  },

  modalClose: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "7px",
    background: "#f1f5f9",
    fontSize: "22px",
    cursor: "pointer",
  },

  previewArea: {
    width: "100%",
    height: "130px",
    background: "#f1f5f9",
    borderRadius: "9px",
    overflow: "hidden",
    marginBottom: "18px",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  previewPlaceholder: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "45px",
  },

  modalGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    padding: "10px 11px",
    border: "1px solid #dbe2ea",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  textarea: {
    padding: "10px 11px",
    border: "1px solid #dbe2ea",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  modalError: {
    marginTop: "13px",
    padding: "9px",
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: "7px",
    fontSize: "12px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "10px 16px",
    border: "1px solid #dbe2ea",
    borderRadius: "7px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  saveButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  // =========================================
  // LOADING
  // =========================================

  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },

  loaderIcon: {
    fontSize: "42px",
    marginBottom: "8px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#334155",
  },

  loadingText: {
    fontSize: "12px",
    color: "#64748b",
  },
};

export default Restaurants;