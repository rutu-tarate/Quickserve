import { useEffect, useState } from "react";
import axios from "axios";

function Users({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [updatingId, setUpdatingId] = useState(null);

  // =========================================
  // FETCH USERS
  // =========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Users API Response:", response.data);

      const userData =
        response.data?.data ||
        response.data?.users ||
        response.data;

      if (Array.isArray(userData)) {
        setUsers(userData);
      } else {
        setUsers([]);
        setError("Users data format is invalid.");
      }
    } catch (error) {
      console.error(
        "Users API Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin access required.");
      } else {
        setError("Unable to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GET USER STATUS
  // =========================================

  const getUserStatus = (user) => {
    if (typeof user.status === "boolean") {
      return user.status;
    }

    if (typeof user.isActive === "boolean") {
      return user.isActive;
    }

    return true;
  };

  // =========================================
  // CHANGE USER STATUS
  // =========================================

  const handleStatusChange = async (user) => {
    try {
      setUpdatingId(user._id);

      const token = localStorage.getItem("token");

      const currentStatus = getUserStatus(user);
      const newStatus = !currentStatus;

      await axios.patch(
        `http://localhost:3000/admin/users/${user._id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                status: newStatus,
                isActive: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update User Status Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Unable to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================
  // FILTER
  // =========================================

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.mobile?.toString().includes(searchText);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    const isActive = getUserStatus(user);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && isActive) ||
      (statusFilter === "BLOCKED" && !isActive);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );
  });

  // =========================================
  // STATS
  // =========================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => getUserStatus(user)
  ).length;

  const blockedUsers = users.filter(
    (user) => !getUserStatus(user)
  ).length;

  const deliveryCount = users.filter(
    (user) => user.role === "DELIVERY"
  ).length;

  // =========================================
  // ROLE NAME
  // =========================================

  const getRoleName = (role) => {
    switch (role) {
      case "DELIVERY":
        return "Delivery";

      case "RESTAURANT":
        return "Restaurant";

      case "CUSTOMER":
        return "Customer";

      default:
        return role || "User";
    }
  };

  // =========================================
  // ROLE STYLE
  // =========================================

  const getRoleStyle = (role) => {
    switch (role) {
      case "DELIVERY":
        return {
          background: "#fff7ed",
          color: "#c2410c",
        };

      case "RESTAURANT":
        return {
          background: "#f3e8ff",
          color: "#7e22ce",
        };

      default:
        return {
          background: "#eff6ff",
          color: "#2563eb",
        };
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
          Loading users...
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
          STATIC TOP AREA
      ====================================== */}

      <div style={styles.staticTop}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>
            <p style={styles.smallTitle}>
              QUICKSERVE ADMIN
            </p>

            <h1 style={styles.title}>
              Users
            </h1>

            <p style={styles.subtitle}>
              Manage all QuickServe users
            </p>
          </div>

          <div style={styles.headerButtons}>

            <button
              onClick={fetchUsers}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>

            <button
              onClick={onBack}
              style={styles.backButton}
            >
              ← Dashboard
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.error}>

            <span>
              ⚠️ {error}
            </span>

            <button
              onClick={() => setError("")}
              style={styles.closeError}
            >
              ×
            </button>

          </div>
        )}

        {/* =================================
            STATS
        ================================== */}

        <div style={styles.stats}>

          {/* TOTAL */}

          <div style={styles.card}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#eff6ff",
              }}
            >
              👥
            </div>

            <div>

              <p style={styles.cardLabel}>
                Total Users
              </p>

              <h2 style={styles.cardNumber}>
                {totalUsers}
              </h2>

            </div>

          </div>

          {/* ACTIVE */}

          <div style={styles.card}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#ecfdf5",
              }}
            >
              ✓
            </div>

            <div>

              <p style={styles.cardLabel}>
                Active
              </p>

              <h2 style={styles.cardNumber}>
                {activeUsers}
              </h2>

            </div>

          </div>

          {/* BLOCKED */}

          <div style={styles.card}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#fef2f2",
              }}
            >
              !
            </div>

            <div>

              <p style={styles.cardLabel}>
                Blocked
              </p>

              <h2 style={styles.cardNumber}>
                {blockedUsers}
              </h2>

            </div>

          </div>

          {/* DELIVERY */}

          <div style={styles.card}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#fff7ed",
              }}
            >
              🛵
            </div>

            <div>

              <p style={styles.cardLabel}>
                Delivery
              </p>

              <h2 style={styles.cardNumber}>
                {deliveryCount}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          SCROLL AREA
      ====================================== */}

      <div style={styles.scrollArea}>

        {/* =================================
            SEARCH + FILTER
        ================================== */}

        <div style={styles.filterBox}>

          {/* SEARCH */}

          <div style={styles.searchBox}>

            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.input}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                style={styles.clear}
              >
                ×
              </button>
            )}

          </div>

          {/* ROLE */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            style={styles.select}
          >

            <option value="ALL">
              All Roles
            </option>

            <option value="CUSTOMER">
              Customer
            </option>

            <option value="DELIVERY">
              Delivery
            </option>

            <option value="RESTAURANT">
              Restaurant
            </option>

          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={styles.select}
          >

            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="BLOCKED">
              Blocked
            </option>

          </select>

        </div>

        {/* =================================
            USER LIST HEADER
        ================================== */}

        <div style={styles.listHeader}>

          <div style={styles.listTitleWrapper}>

            <div style={styles.listIcon}>
              👥
            </div>

            <div>

              <h2 style={styles.tableTitle}>
                User List
              </h2>

              <p style={styles.tableSubtitle}>
                Showing{" "}
                <strong>
                  {filteredUsers.length}
                </strong>{" "}
                of {users.length} users
              </p>

            </div>

          </div>

        </div>

        {/* =================================
            TABLE
        ================================== */}

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  #
                </th>

                <th style={styles.th}>
                  USER
                </th>

                <th style={styles.th}>
                  CONTACT
                </th>

                <th style={styles.th}>
                  ROLE
                </th>

                <th style={styles.th}>
                  STATUS
                </th>

                <th style={styles.th}>
                  ACTION
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={styles.empty}
                  >

                    <div style={styles.emptyIcon}>
                      👥
                    </div>

                    <h3 style={styles.emptyTitle}>
                      No users found
                    </h3>

                    <p style={styles.emptyText}>
                      Try changing your search
                      or filters.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredUsers.map(
                  (user, index) => {

                    const isActive =
                      getUserStatus(user);

                    return (

                      <tr
                        key={user._id}
                        style={styles.tableRow}
                      >

                        {/* NUMBER */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span style={styles.number}>
                            {index + 1}
                          </span>

                        </td>

                        {/* USER */}

                        <td style={styles.td}>

                          <div style={styles.user}>

                            <div style={styles.avatar}>

                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}

                            </div>

                            <div>

                              <div style={styles.name}>
                                {user.name || "N/A"}
                              </div>

                              <div style={styles.id}>
                                ID:{" "}
                                {user._id?.slice(-6)}
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td style={styles.td}>

                          <div style={styles.email}>
                            {user.email || "N/A"}
                          </div>

                          <div style={styles.phone}>
                            {user.mobile || "N/A"}
                          </div>

                        </td>

                        {/* ROLE */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span
                            style={{
                              ...styles.role,
                              ...getRoleStyle(
                                user.role
                              ),
                            }}
                          >

                            {getRoleName(
                              user.role
                            )}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <span
                            style={
                              isActive
                                ? styles.active
                                : styles.blocked
                            }
                          >

                            <span
                              style={
                                isActive
                                  ? styles.activeDot
                                  : styles.blockedDot
                              }
                            ></span>

                            {isActive
                              ? "Active"
                              : "Blocked"}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                          }}
                        >

                          <button
                            disabled={
                              updatingId ===
                              user._id
                            }
                            onClick={() =>
                              handleStatusChange(
                                user
                              )
                            }
                            style={{
                              ...styles.actionButton,

                              background:
                                isActive
                                  ? "#fff1f2"
                                  : "#ecfdf5",

                              color:
                                isActive
                                  ? "#e11d48"
                                  : "#15803d",

                              opacity:
                                updatingId ===
                                user._id
                                  ? 0.6
                                  : 1,
                            }}
                          >

                            {updatingId ===
                            user._id
                              ? "Updating..."
                              : isActive
                              ? "Block"
                              : "Unblock"}

                          </button>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


// =========================================
// STYLES
// =========================================

const styles = {

  // =======================================
  // MAIN CONTAINER
  // =======================================

  container: {
    height: "100vh",
    background: "#f8fafc",
    padding: "22px 28px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  // =======================================
  // STATIC TOP
  // =======================================

  staticTop: {
    flexShrink: 0,
  },

  // =======================================
  // SCROLL AREA
  // =======================================

  scrollArea: {
    height: "calc(100vh - 225px)",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "5px",
    paddingBottom: "20px",
    boxSizing: "border-box",
  },

  // =======================================
  // HEADER
  // =======================================

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "17px",
    gap: "20px",
  },

  smallTitle: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#2563eb",
  },

  title: {
    margin: "4px 0 0",
    fontSize: "25px",
    fontWeight: "750",
    color: "#0f172a",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  headerButtons: {
    display: "flex",
    gap: "9px",
  },

  refreshButton: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  backButton: {
    border: "none",
    background: "#0f172a",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  // =======================================
  // ERROR
  // =======================================

  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "13px",
  },

  closeError: {
    border: "none",
    background: "transparent",
    color: "#b91c1c",
    fontSize: "19px",
    cursor: "pointer",
  },

  // =======================================
  // STATS
  // =======================================

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "15px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: "11px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.035)",
  },

  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "17px",
    flexShrink: 0,
  },

  cardLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
  },

  cardNumber: {
    margin: "2px 0 0",
    fontSize: "21px",
    fontWeight: "600",
    color: "#0f172a",
  },

  // =======================================
  // SEARCH + FILTER
  // =======================================

  filterBox: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: "11px",
    padding: "11px",
    display: "flex",
    gap: "9px",
    marginBottom: "13px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    flexWrap: "wrap",
  },

  searchBox: {
    position: "relative",
    flex: 1,
    minWidth: "250px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "9px",
    fontSize: "13px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 36px",
    border: "1px solid #dbe2ea",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
  },

  clear: {
    position: "absolute",
    right: "8px",
    top: "4px",
    border: "none",
    background: "transparent",
    fontSize: "19px",
    color: "#64748b",
    cursor: "pointer",
  },

  select: {
    padding: "9px 11px",
    border: "1px solid #dbe2ea",
    borderRadius: "7px",
    background: "#fff",
    color: "#334155",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    minWidth: "125px",
  },

  // =======================================
  // USER LIST HEADER
  // =======================================

  listHeader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10px",
    padding: "10px 15px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: "4px solid #2563eb",
    borderRadius: "9px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.035)",
  },

  listTitleWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    textAlign: "center",
  },

  listIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },

  tableTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },

  tableSubtitle: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "11px",
    textAlign: "center",
  },

  // =======================================
  // TABLE
  // =======================================

  tableContainer: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: "11px",
    overflowX: "auto",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
    marginBottom: "20px",
  },

  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
  },

  th: {
    padding: "11px 13px",
    textAlign: "center",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "10px 13px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "12px",
    color: "#334155",
  },

  tableRow: {
    transition: "0.2s",
  },

  number: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "11px",
  },

  // =======================================
  // USER
  // =======================================

  user: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
  },

  name: {
    fontWeight: "650",
    color: "#111827",
    fontSize: "12px",
  },

  id: {
    marginTop: "2px",
    color: "#94a3b8",
    fontSize: "9px",
  },

  email: {
    color: "#475569",
    marginBottom: "3px",
    fontSize: "11px",
  },

  phone: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  // =======================================
  // ROLE
  // =======================================

  role: {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: "18px",
    fontSize: "9px",
    fontWeight: "700",
  },

  // =======================================
  // STATUS
  // =======================================

  active: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 9px",
    borderRadius: "18px",
    background: "#ecfdf5",
    color: "#15803d",
    fontSize: "10px",
    fontWeight: "700",
  },

  blocked: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 9px",
    borderRadius: "18px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "10px",
    fontWeight: "700",
  },

  activeDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  blockedDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#ef4444",
  },

  // =======================================
  // ACTION
  // =======================================

  actionButton: {
    border: "none",
    borderRadius: "6px",
    padding: "6px 11px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =======================================
  // EMPTY
  // =======================================

  empty: {
    textAlign: "center",
    padding: "45px 20px",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "7px",
  },

  emptyTitle: {
    margin: 0,
    color: "#334155",
    fontSize: "16px",
  },

  emptyText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  // =======================================
  // LOADING
  // =======================================

  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    color: "#64748b",
  },

  loader: {
    width: "30px",
    height: "30px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    marginBottom: "10px",
  },

  loadingText: {
    fontSize: "13px",
    margin: 0,
  },
};

export default Users;