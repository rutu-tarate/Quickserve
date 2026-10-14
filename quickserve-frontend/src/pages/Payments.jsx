import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Payments({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // =====================================================
  // API
  // =====================================================

  const API_BASE_URL = "http://localhost:3000";

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  const getCustomerName = (order) => {
    if (!order) return "Customer";

    if (order.userId && typeof order.userId === "object") {
      return (
        order.userId.name ||
        order.userId.email ||
        "Customer"
      );
    }

    return order.customerName || order.userName || "Customer";
  };

  // =====================================================
  // CUSTOMER EMAIL
  // =====================================================

  const getCustomerEmail = (order) => {
    if (!order) return "";

    if (order.userId && typeof order.userId === "object") {
      return order.userId.email || "";
    }

    return order.email || "";
  };

  // =====================================================
  // RESTAURANT NAME
  // =====================================================

  const getRestaurantName = (order) => {
    if (!order) return "-";

    if (
      order.restaurantId &&
      typeof order.restaurantId === "object"
    ) {
      return (
        order.restaurantId.name ||
        order.restaurantId.restaurantName ||
        "-"
      );
    }

    return order.restaurantName || "-";
  };

  // =====================================================
  // FETCH PAYMENT DETAILS
  // =====================================================

  const fetchPaymentDetails = async (ordersData) => {
    if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return [];
    }

    const updatedOrders = await Promise.all(
      ordersData.map(async (order) => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/payment/${order._id}`,
            {
              headers: getHeaders(),
            }
          );

          const paymentData = response.data || {};

          return {
            ...order,
            paymentDetails: paymentData,

            razorpayPaymentId:
              paymentData.transactionId || null,

            paidAt: paymentData.paidAt || null,
          };
        } catch (paymentError) {
          console.warn(
            `Payment details not found for order ${order._id}`,
            paymentError
          );

          return {
            ...order,
            paymentDetails: null,
            razorpayPaymentId: null,
            paidAt: null,
          };
        }
      })
    );

    return updatedOrders;
  };

  // =====================================================
  // FETCH ORDERS / PAYMENTS
  // =====================================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/admin/orders`,
        {
          headers: getHeaders(),
        }
      );

      console.log("ORDERS API RESPONSE:", response.data);

      if (response.data?.success) {
        const ordersData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const ordersWithPayments =
          await fetchPaymentDetails(ordersData);

        console.log(
          "ORDERS WITH PAYMENT DETAILS:",
          ordersWithPayments
        );

        setOrders(ordersWithPayments);
      } else {
        setOrders([]);

        setError(
          response.data?.message ||
            "Failed to fetch payment data"
        );
      }
    } catch (err) {
      console.error("Payments fetch error:", err);

      setOrders([]);

      setError(
        err.response?.data?.message ||
          "Failed to fetch payment data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =====================================================
  // FORMAT ORDER ID
  // =====================================================

  const formatOrderId = (id) => {
    if (!id) return "-";

    return `#${String(id)
      .slice(-6)
      .toUpperCase()}`;
  };

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =====================================================
  // TRANSACTION ID
  // =====================================================

  const getTransactionId = (order) => {
    return (
      order?.razorpayPaymentId ||
      order?.paymentDetails?.transactionId ||
      order?.transactionId ||
      "-"
    );
  };

  // =====================================================
  // PAYMENT DATE
  // =====================================================

  const getPaymentDate = (order) => {
    if (order?.paidAt) {
      return order.paidAt;
    }

    if (order?.paymentDetails?.paidAt) {
      return order.paymentDetails.paidAt;
    }

    return null;
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (order) => {
    if (order?.paymentStatus) {
      return order.paymentStatus;
    }

    if (order?.paymentDetails?.paymentStatus) {
      const status = order.paymentDetails.paymentStatus;

      if (status === "SUCCESS") {
        return "Paid";
      }

      if (status === "FAILED") {
        return "Failed";
      }

      if (status === "PENDING") {
        return "Pending";
      }
    }

    return "Pending";
  };

  // =====================================================
  // PAYMENT CLASS
  // =====================================================

  const getPaymentClass = (status) => {
    switch (status) {
      case "Paid":
        return "paid";

      case "Failed":
        return "failed";

      case "Pending":
        return "pending";

      default:
        return "pending";
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const paidOrders = orders.filter(
      (order) => getPaymentStatus(order) === "Paid"
    );

    const pendingOrders = orders.filter(
      (order) => getPaymentStatus(order) === "Pending"
    );

    const failedOrders = orders.filter(
      (order) => getPaymentStatus(order) === "Failed"
    );

    const totalRevenue = orders
      .filter(
        (order) =>
          order.status === "Delivered" &&
          getPaymentStatus(order) === "Paid"
      )
      .reduce(
        (total, order) =>
          total + Number(order.totalAmount || 0),
        0
      );

    const totalPaid = paidOrders.reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

    const totalPending = pendingOrders.reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

    const totalFailed = failedOrders.reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

    return {
      totalPayments: orders.length,
      paidPayments: paidOrders.length,
      pendingPayments: pendingOrders.length,
      failedPayments: failedOrders.length,
      totalRevenue,
      totalPaid,
      totalPending,
      totalFailed,
    };
  }, [orders]);

  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(order._id || "").toLowerCase();

      const customer =
        getCustomerName(order).toLowerCase();

      const email =
        getCustomerEmail(order).toLowerCase();

      const restaurant =
        getRestaurantName(order).toLowerCase();

      const paymentStatus =
        getPaymentStatus(order).toLowerCase();

      const transactionId =
        getTransactionId(order).toLowerCase();

      const matchesSearch =
        !searchValue ||
        orderId.includes(searchValue) ||
        customer.includes(searchValue) ||
        email.includes(searchValue) ||
        restaurant.includes(searchValue) ||
        paymentStatus.includes(searchValue) ||
        transactionId.includes(searchValue);

      const matchesPayment =
        paymentFilter === "All" ||
        getPaymentStatus(order) === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [orders, search, paymentFilter]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="payments-page">

      {/* HEADER */}
      <div className="payments-header">
        <div className="payments-header-top">

          <div className="payments-title-wrapper">
            <h1>💳 Payments & Revenue</h1>

            <p>
              Manage payments and monitor QuickServe revenue
            </p>
          </div>

          <button
            className="dashboard-button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="payments-error">
          {error}
        </div>
      )}

      {/* REVENUE CARDS */}
      <div className="payments-stat-grid">

        <div className="payment-stat-card">
          <div className="payment-stat-icon revenue-icon">
            ₹
          </div>

          <div>
            <p>Total Revenue</p>
            <h2>
              {formatAmount(statistics.totalRevenue)}
            </h2>
            <small>Delivered & paid orders</small>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon">
            💳
          </div>

          <div>
            <p>Total Payments</p>
            <h2>{statistics.totalPayments}</h2>
            <small>All payment records</small>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon paid-icon">
            ✓
          </div>

          <div>
            <p>Paid Payments</p>
            <h2>{statistics.paidPayments}</h2>
            <small>
              {formatAmount(statistics.totalPaid)}
            </small>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon pending-icon">
            ⏳
          </div>

          <div>
            <p>Pending Payments</p>
            <h2>{statistics.pendingPayments}</h2>
            <small>
              {formatAmount(statistics.totalPending)}
            </small>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon failed-icon">
            !
          </div>

          <div>
            <p>Failed Payments</p>
            <h2>{statistics.failedPayments}</h2>
            <small>
              {formatAmount(statistics.totalFailed)}
            </small>
          </div>
        </div>

      </div>

      {/* REVENUE SUMMARY */}
      <div className="revenue-summary">

        <div className="revenue-summary-header">

          <div>
            <h2>Revenue Summary</h2>

            <p>
              Quick overview of payment performance
            </p>
          </div>

          <div className="revenue-total">
            <span>Total Revenue</span>

            <strong>
              {formatAmount(statistics.totalRevenue)}
            </strong>
          </div>

        </div>

        <div className="revenue-summary-grid">

          <div className="revenue-summary-item">
            <span>Paid Amount</span>

            <strong className="text-paid">
              {formatAmount(statistics.totalPaid)}
            </strong>
          </div>

          <div className="revenue-summary-item">
            <span>Pending Amount</span>

            <strong className="text-pending">
              {formatAmount(statistics.totalPending)}
            </strong>
          </div>

          <div className="revenue-summary-item">
            <span>Failed Amount</span>

            <strong className="text-failed">
              {formatAmount(statistics.totalFailed)}
            </strong>
          </div>

        </div>
      </div>

      {/* SEARCH / FILTER */}
      <div className="payments-toolbar">

        <div className="payment-search-wrapper">

          <span className="payment-search-icon">
            🔍
          </span>

          <input
            type="text"
            className="payments-search-input"
            placeholder="Search by Order ID, Customer or Restaurant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <select
          className="payment-status-filter"
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

      </div>

      {/* PAYMENTS TABLE */}
      <div className="payments-table-card">

        <div className="payments-table-heading">

          <div>
            <h2>Payments List</h2>

            <span>
              {filteredPayments.length} payments found
            </span>
          </div>

        </div>

        {loading ? (

          <div className="payments-loading">
            Loading payments...
          </div>

        ) : filteredPayments.length === 0 ? (

          <div className="payments-empty">

            <div className="payment-empty-icon">
              💳
            </div>

            <h3>No Payments Found</h3>

            <p>
              No payments match your search or selected filter.
            </p>

          </div>

        ) : (

          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Amount</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Transaction ID</th>
                  <th>Payment Date & Time</th>
                </tr>
              </thead>

              <tbody>

                {filteredPayments.map((order) => (

                  <tr key={order._id}>

                    <td>
                      <strong className="payment-order-id">
                        {formatOrderId(order._id)}
                      </strong>
                    </td>

                    <td>

                      <div className="payment-customer-cell">

                        <div className="payment-customer-avatar">
                          {getCustomerName(order)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getCustomerName(order)}
                          </strong>

                          <small>
                            {getCustomerEmail(order)}
                          </small>
                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="payment-restaurant-cell">
                        <strong>
                          {getRestaurantName(order)}
                        </strong>
                      </div>

                    </td>

                    <td>
                      <strong className="payment-amount">
                        {formatAmount(order.totalAmount)}
                      </strong>
                    </td>

                    <td>

                      <span
                        className={`order-status-small ${String(
                          order.status || ""
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {order.status || "Pending"}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`payment-status-badge ${getPaymentClass(
                          getPaymentStatus(order)
                        )}`}
                      >
                        {getPaymentStatus(order)}
                      </span>

                    </td>

                    <td>

                      {getTransactionId(order) !== "-" ? (

                        <div className="transaction-cell">

                          <span className="transaction-icon">
                            #
                          </span>

                          <span
                            className="transaction-id"
                            title={getTransactionId(order)}
                          >
                            {getTransactionId(order)}
                          </span>

                        </div>

                      ) : (

                        <span className="not-available">
                          -
                        </span>

                      )}

                    </td>

                    <td>

                      <div className="payment-date-time-cell">

                        {getPaymentDate(order) ? (

                          <>
                            <strong>
                              {formatDate(
                                getPaymentDate(order)
                              )}
                            </strong>

                            <small>
                              {formatTime(
                                getPaymentDate(order)
                              )}
                            </small>
                          </>

                        ) : (

                          <span className="not-available">
                            -
                          </span>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .payments-page {
          min-height: 100vh;
          padding: 28px;
          background: #f7f8fa;
          color: #111827;
        }

        /* HEADER */

        .payments-header {
          margin-bottom: 25px;
        }

        .payments-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
        }

        .payments-title-wrapper {
          min-width: 0;
        }

        .payments-header h1 {
          margin: 0 0 5px;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .payments-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* DASHBOARD */

        .dashboard-button {
          border: none;
          background: #1e293b;
          color: #ffffff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 14px 22px;
          border-radius: 10px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.12);
        }

        .dashboard-button:hover {
          background: #172033;
          transform: translateY(-1px);
        }

        .dashboard-button:active {
          transform: translateY(0);
        }

        /* ERROR */

        .payments-error {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          border-radius: 10px;
          padding: 12px 15px;
          margin-bottom: 20px;
        }

        /* STATISTICS */

        .payments-stat-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(190px, 1fr)
          );
          gap: 14px;
          margin-bottom: 22px;
        }

        .payment-stat-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 112px;
        }

        .payment-stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 11px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .revenue-icon {
          background: #ecfdf5;
          color: #059669;
          font-weight: 700;
        }

        .paid-icon {
          background: #f0fdf4;
          color: #15803d;
          font-weight: 700;
        }

        .pending-icon {
          background: #fff7ed;
          color: #c2410c;
        }

        .failed-icon {
          background: #fff1f2;
          color: #be123c;
          font-weight: 700;
        }

        .payment-stat-card p {
          margin: 0 0 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .payment-stat-card h2 {
          margin: 0 0 4px;
          font-size: 21px;
          color: #111827;
        }

        .payment-stat-card small {
          color: #9ca3af;
          font-size: 10px;
        }

        /* REVENUE SUMMARY */

        .revenue-summary {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 22px;
        }

        .revenue-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eef0f2;
        }

        .revenue-summary-header h2 {
          margin: 0 0 5px;
          font-size: 18px;
          color: #111827;
        }

        .revenue-summary-header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .revenue-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .revenue-total span {
          color: #9ca3af;
          font-size: 11px;
        }

        .revenue-total strong {
          color: #059669;
          font-size: 22px;
        }

        .revenue-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          padding-top: 18px;
        }

        .revenue-summary-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .revenue-summary-item span {
          color: #6b7280;
          font-size: 12px;
        }

        .revenue-summary-item strong {
          font-size: 16px;
        }

        .text-paid {
          color: #15803d;
        }

        .text-pending {
          color: #c2410c;
        }

        .text-failed {
          color: #be123c;
        }

        /* SEARCH */

        .payments-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .payment-search-wrapper {
          flex: 1;
          position: relative;
        }

        .payment-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .payments-search-input {
          width: 100%;
          height: 46px;
          border: 1px solid #374151;
          border-radius: 10px;
          outline: none;
          padding: 0 15px 0 42px;
          background: #24272c;
          color: #fff;
          font-size: 14px;
        }

        .payments-search-input::placeholder {
          color: #b8bec8;
          opacity: 1;
        }

        .payments-search-input:focus {
          border-color: #6b7280;
          background: #2a2d32;
        }

        .payment-status-filter {
          height: 46px;
          min-width: 180px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 13px;
          background: #fff;
          color: #374151;
          outline: none;
        }

        /* TABLE */

        .payments-table-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .payments-table-heading {
          padding: 19px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .payments-table-heading h2 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #111827;
        }

        .payments-table-heading span {
          color: #6b7280;
          font-size: 12px;
        }

        .payments-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1250px;
        }

        .payments-table th {
          text-align: left;
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .04em;
          padding: 13px 15px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .payments-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #f0f1f3;
          font-size: 13px;
          color: #374151;
          vertical-align: middle;
        }

        .payments-table tbody tr:hover {
          background: #fafafa;
        }

        .payment-order-id {
          color: #111827;
        }

        /* CUSTOMER */

        .payment-customer-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 190px;
        }

        .payment-customer-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #eef0f3;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .payment-customer-cell div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .payment-customer-cell strong {
          color: #111827;
        }

        .payment-customer-cell small {
          color: #9ca3af;
          font-size: 10px;
        }

        /* RESTAURANT */

        .payment-restaurant-cell {
          min-width: 140px;
        }

        .payment-restaurant-cell strong {
          color: #111827;
        }

        /* AMOUNT */

        .payment-amount {
          color: #111827;
          white-space: nowrap;
        }

        /* PAYMENT STATUS */

        .payment-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .payment-status-badge.paid {
          background: #f0fdf4;
          color: #15803d;
        }

        .payment-status-badge.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .payment-status-badge.failed {
          background: #fff1f2;
          color: #be123c;
        }

        /* ORDER STATUS */

        .order-status-small {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .order-status-small.delivered {
          background: #f0fdf4;
          color: #15803d;
        }

        .order-status-small.cancelled {
          background: #fff1f2;
          color: #be123c;
        }

        .order-status-small.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .order-status-small.accepted {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .order-status-small.preparing {
          background: #fefce8;
          color: #a16207;
        }

        .order-status-small.out-for-delivery {
          background: #f5f3ff;
          color: #6d28d9;
        }

        /* TRANSACTION */

        .transaction-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 150px;
        }

        .transaction-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .transaction-id {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #374151;
          font-size: 11px;
          font-weight: 600;
        }

        .not-available {
          color: #9ca3af;
        }

        /* DATE */

        .payment-date-time-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 145px;
        }

        .payment-date-time-cell strong {
          color: #374151;
          font-size: 12px;
          white-space: nowrap;
        }

        .payment-date-time-cell small {
          color: #9ca3af;
          font-size: 11px;
          white-space: nowrap;
        }

        /* EMPTY */

        .payments-loading,
        .payments-empty {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          padding: 30px;
        }

        .payments-empty h3 {
          margin: 10px 0 5px;
          color: #374151;
        }

        .payments-empty p {
          margin: 0;
          font-size: 13px;
        }

        .payment-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .payments-page {
            padding: 18px;
          }

          .payments-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .payments-toolbar {
            flex-direction: column;
          }

          .payment-status-filter {
            width: 100%;
          }

          .revenue-summary-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .revenue-total {
            align-items: flex-start;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .payments-page {
            padding: 15px;
          }

          .payments-stat-grid {
            grid-template-columns: 1fr;
          }

          .revenue-summary-grid {
            grid-template-columns: 1fr;
          }

          /* HEADER STAYS STATIC IN ONE ROW */

          .payments-header-top {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
          }

          .payments-title-wrapper {
            flex: 1;
            min-width: 0;
          }

          .payments-header h1 {
            font-size: 21px;
            line-height: 1.3;
            margin: 0 0 5px;
            white-space: nowrap;
          }

          .payments-header p {
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
          }

          /* DASHBOARD STAYS RIGHT SIDE */

          .dashboard-button {
            align-self: flex-start;
            flex-shrink: 0;
            padding: 11px 14px;
            font-size: 12px;
            border-radius: 8px;
          }

          /* SEARCH COMES BELOW HEADER */

          .payments-toolbar {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            width: 100%;
            margin-bottom: 18px;
          }

          .payment-search-wrapper {
            width: 100%;
            flex: none;
          }

          .payments-search-input {
            width: 100%;
            height: 46px;
          }

          .payment-status-filter {
            width: 100%;
            height: 46px;
          }

          /* REVENUE */

          .revenue-summary {
            padding: 16px;
          }

          .revenue-summary-header {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .revenue-total {
            align-items: flex-start;
          }

          .revenue-total strong {
            font-size: 20px;
          }

          /* TABLE */

          .payments-table-card {
            border-radius: 10px;
          }

          .payments-table-heading {
            padding: 16px;
          }

          .payments-table-wrapper {
            overflow-x: auto;
            width: 100%;
          }

          .payments-table {
            min-width: 1250px;
          }

        }

      `}</style>

    </div>
  );
}

export default Payments;