import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard({ onLogout, onNavigate }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    deliveryPartners: 0,
    totalRevenue: 0,
    blockedRestaurants: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Dashboard Response:",
        response.data
      );

      if (response.data?.success) {
        setStats({
          totalUsers:
            response.data.data?.totalUsers || 0,

          totalRestaurants:
            response.data.data?.totalRestaurants || 0,

          totalOrders:
            response.data.data?.totalOrders || 0,

          deliveryPartners:
            response.data.data?.deliveryPartners || 0,

          totalRevenue:
            response.data.data?.totalRevenue || 0,

          blockedRestaurants:
            response.data.data?.blockedRestaurants || 0,
        });
      } else {
        setError(
          "Failed to load dashboard data."
        );
      }

    } catch (error) {
      console.error(
        "Dashboard API Error:",
        error.response?.data ||
          error.message
      );

      if (error.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        setError(
          "Access denied. Admin access required."
        );
      } else {
        setError(
          "Unable to load dashboard data."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");

    if (onLogout) {
      onLogout();
    }
  };

  const handleModuleClick = (module) => {
    console.log(
      "Selected Module:",
      module
    );

    if (onNavigate) {
      onNavigate(module);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2>
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            QuickServe Admin Dashboard
          </h1>

          <p style={styles.subtitle}>
            Manage users, restaurants,
            orders and more
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logout}
        >
          Logout
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* DASHBOARD OVERVIEW */}

      <h2 style={styles.sectionTitle}>
        Dashboard Overview
      </h2>

      <div style={styles.grid}>

        {/* USERS */}

        <div style={styles.card}>
          <h3>
            👥 Total Users
          </h3>

          <p style={styles.number}>
            {stats.totalUsers}
          </p>
        </div>

        {/* RESTAURANTS */}

        <div style={styles.card}>
          <h3>
            🍽️ Total Restaurants
          </h3>

          <p style={styles.number}>
            {stats.totalRestaurants}
          </p>
        </div>

        {/* ORDERS */}

        <div style={styles.card}>
          <h3>
            📦 Total Orders
          </h3>

          <p style={styles.number}>
            {stats.totalOrders}
          </p>
        </div>

        {/* DELIVERY */}

        <div style={styles.card}>
          <h3>
            🛵 Delivery Partners
          </h3>

          <p style={styles.number}>
            {stats.deliveryPartners}
          </p>
        </div>

        {/* REVENUE */}

        <div style={styles.card}>
          <h3>
            💰 Total Revenue
          </h3>

          <p style={styles.number}>
            ₹{stats.totalRevenue}
          </p>
        </div>

        {/* BLOCKED RESTAURANTS */}

        <div style={styles.card}>
          <h3>
            🚫 Blocked Restaurants
          </h3>

          <p style={styles.number}>
            {stats.blockedRestaurants}
          </p>
        </div>

      </div>

      {/* MANAGEMENT */}

      <h2 style={styles.sectionTitle}>
        Management
      </h2>

      <div style={styles.managementGrid}>

        {/* USERS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick("users")
          }
        >
          <div style={styles.icon}>
            👥
          </div>

          <h3>
            Users Management
          </h3>

          <p>
            View, manage and
            block/unblock users
          </p>

          <button style={styles.viewButton}>
            Manage Users →
          </button>
        </div>

        {/* RESTAURANTS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "restaurants"
            )
          }
        >
          <div style={styles.icon}>
            🍽️
          </div>

          <h3>
            Restaurants Management
          </h3>

          <p>
            Manage restaurants
            and their status
          </p>

          <button style={styles.viewButton}>
            Manage Restaurants →
          </button>
        </div>

        {/* DELIVERY */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "delivery"
            )
          }
        >
          <div style={styles.icon}>
            🛵
          </div>

          <h3>
            Delivery Partners
          </h3>

          <p>
            Manage delivery
            partners
          </p>

          <button style={styles.viewButton}>
            Manage Delivery →
          </button>
        </div>

        {/* ORDERS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "orders"
            )
          }
        >
          <div style={styles.icon}>
            📦
          </div>

          <h3>
            Orders Management
          </h3>

          <p>
            View and manage
            customer orders
          </p>

          <button style={styles.viewButton}>
            Manage Orders →
          </button>
        </div>

        {/* PAYMENTS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "payments"
            )
          }
        >
          <div style={styles.icon}>
            💳
          </div>

          <h3>
            Payments & Revenue
          </h3>

          <p>
            Track payments
            and revenue
          </p>

          <button style={styles.viewButton}>
            View Revenue →
          </button>
        </div>

        {/* REPORTS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "reports"
            )
          }
        >
          <div style={styles.icon}>
            📊
          </div>

          <h3>
            Reports
          </h3>

          <p>
            View system reports
            and analytics
          </p>

          <button style={styles.viewButton}>
            View Reports →
          </button>
        </div>

        {/* COMPLAINTS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "complaints"
            )
          }
        >
          <div style={styles.icon}>
            📢
          </div>

          <h3>
            Complaints
          </h3>

          <p>
            Manage customer
            complaints
          </p>

          <button style={styles.viewButton}>
            View Complaints →
          </button>
        </div>

        {/* COUPONS */}

        <div
          style={styles.managementCard}
          onClick={() =>
            handleModuleClick(
              "coupons"
            )
          }
        >
          <div style={styles.icon}>
            🎁
          </div>

          <h3>
            Coupons & Offers
          </h3>

          <p>
            Create and manage
            offers and coupons
          </p>

          <button style={styles.viewButton}>
            Manage Coupons →
          </button>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f6fa",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },

  logout: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },

  sectionTitle: {
    marginTop: "35px",
    marginBottom: "18px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.08)",
  },

  number: {
    fontSize: "30px",
    fontWeight: "bold",
    margin: "10px 0 0 0",
  },

  managementGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    paddingBottom: "30px",
  },

  managementCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "0.2s",
  },

  icon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  viewButton: {
    marginTop: "15px",
    padding: "9px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f6fa",
  },

  error: {
    marginTop: "20px",
    padding: "12px",
    background: "#fee2e2",
    color: "#dc2626",
    borderRadius: "6px",
  },
};

export default Dashboard;