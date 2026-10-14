import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Restaurants from "./pages/Restaurants";
import DeliveryPartners from "./pages/DeliveryPartners";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Complaints from "./pages/Complaints";
import CouponsOffers from "./pages/CouponsOffers";

function App() {
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("token")
      ? "dashboard"
      : "login"
  );

  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  const handleLoginSuccess = () => {
    setCurrentPage("dashboard");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminUser");

    setCurrentPage("login");
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  const goToDashboard = () => {
    setCurrentPage("dashboard");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  if (currentPage === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  if (currentPage === "dashboard") {
    return (
      <Dashboard
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }

  // =====================================================
  // USERS
  // =====================================================

  if (currentPage === "users") {
    return (
      <Users
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // RESTAURANTS
  // =====================================================

  if (currentPage === "restaurants") {
    return (
      <Restaurants
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // DELIVERY PARTNERS
  // =====================================================

  if (currentPage === "delivery") {
    return (
      <DeliveryPartners
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // ORDERS
  // =====================================================

  if (currentPage === "orders") {
    return (
      <Orders
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // PAYMENTS & REVENUE
  // =====================================================

  if (currentPage === "payments") {
    return (
      <Payments
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // REPORTS
  // =====================================================

  if (currentPage === "reports") {
    return (
      <Reports
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // COMPLAINTS
  // =====================================================

  if (currentPage === "complaints") {
    return (
      <Complaints
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // COUPONS & OFFERS
  // =====================================================

  if (currentPage === "coupons") {
    return (
      <CouponsOffers
        onBack={goToDashboard}
      />
    );
  }

  // =====================================================
  // DEFAULT
  // =====================================================

  return null;
}

export default App;