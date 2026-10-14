import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Orders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const API_BASE_URL = "http://localhost:3000";

  // =====================================================
  // AUTH HEADERS
  // =====================================================

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
  // GET CUSTOMER NAME
  // =====================================================

  const getCustomerName = (order) => {
    if (!order) return "Customer";

    if (
      order.userId &&
      typeof order.userId === "object"
    ) {
      return (
        order.userId.name ||
        order.userId.email ||
        "Customer"
      );
    }

    return (
      order.customerName ||
      order.userName ||
      "Customer"
    );
  };

  // =====================================================
  // GET CUSTOMER EMAIL
  // =====================================================

  const getCustomerEmail = (order) => {
    if (!order) return "";

    if (
      order.userId &&
      typeof order.userId === "object"
    ) {
      return order.userId.email || "";
    }

    return order.email || "";
  };

  // =====================================================
  // GET CUSTOMER ID
  // =====================================================

  const getCustomerId = (order) => {
    if (!order) return "-";

    if (
      order.userId &&
      typeof order.userId === "object"
    ) {
      return order.userId._id || "-";
    }

    if (typeof order.userId === "string") {
      return order.userId;
    }

    return "-";
  };

  // =====================================================
  // GET RESTAURANT NAME
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
  // GET RESTAURANT ID
  // =====================================================

  const getRestaurantId = (order) => {
    if (!order) return "-";

    if (
      order.restaurantId &&
      typeof order.restaurantId === "object"
    ) {
      return order.restaurantId._id || "-";
    }

    if (typeof order.restaurantId === "string") {
      return order.restaurantId;
    }

    return "-";
  };

  // =====================================================
  // GET FOOD NAMES
  // =====================================================

  const getFoodNames = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "-";
    }

    return items
      .map((item) => item.foodName || "Food Item")
      .join(", ");
  };

  // =====================================================
  // FETCH ALL ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/admin/orders`,
        {
          headers: getHeaders(),
        }
      );

      console.log(
        "ORDERS API RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        setOrders(
          Array.isArray(response.data.data)
            ? response.data.data
            : []
        );
      } else {
        setOrders([]);
        setError(
          response.data?.message ||
            "Failed to fetch orders"
        );
      }
    } catch (err) {
      console.error(
        "Orders fetch error:",
        err
      );

      setOrders([]);

      setError(
        err.response?.data?.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    if (status === "Accepted") {
      return "Confirmed";
    }

    return status || "Pending";
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "pending";

      case "Accepted":
        return "confirmed";

      case "Preparing":
        return "preparing";

      case "Out for Delivery":
        return "delivery";

      case "Delivered":
        return "delivered";

      case "Cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "Pending"
      ).length,

      confirmed: orders.filter(
        (order) =>
          order.status === "Accepted"
      ).length,

      preparing: orders.filter(
        (order) =>
          order.status === "Preparing"
      ).length,

      delivery: orders.filter(
        (order) =>
          order.status ===
          "Out for Delivery"
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status === "Delivered"
      ).length,

      cancelled: orders.filter(
        (order) =>
          order.status === "Cancelled"
      ).length,
    };
  }, [orders]);

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(
        order._id || ""
      ).toLowerCase();

      const customer =
        getCustomerName(order).toLowerCase();

      const customerEmail =
        getCustomerEmail(order).toLowerCase();

      const customerId =
        getCustomerId(order).toLowerCase();

      const restaurant =
        getRestaurantName(order).toLowerCase();

      const restaurantId =
        getRestaurantId(order).toLowerCase();

      const foodNames =
        getFoodNames(order.items).toLowerCase();

      const matchesSearch =
        !searchValue ||
        orderId.includes(searchValue) ||
        customer.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        customerId.includes(searchValue) ||
        restaurant.includes(searchValue) ||
        restaurantId.includes(searchValue) ||
        foodNames.includes(searchValue);

      let matchesStatus = true;

      if (statusFilter !== "All") {
        const backendStatus =
          statusFilter === "Confirmed"
            ? "Accepted"
            : statusFilter;

        matchesStatus =
          order.status === backendStatus;
      }

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  const viewOrderDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/admin/orders/${id}`,
        {
          headers: getHeaders(),
        }
      );

      if (response.data?.success) {
        setSelectedOrder(
          response.data.data
        );
      } else {
        setSelectedOrder(
          response.data?.data || null
        );
      }
    } catch (err) {
      console.error(
        "Order details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to fetch order details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const updateOrderStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      await axios.patch(
        `${API_BASE_URL}/orders/${id}/status`,
        {
          status,
        },
        {
          headers: getHeaders(),
        }
      );

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order._id === id
                ? {
                    ...order,
                    status,
                  }
                : order
          )
      );

      setSelectedOrder(
        (previousOrder) =>
          previousOrder &&
          previousOrder._id === id
            ? {
                ...previousOrder,
                status,
              }
            : previousOrder
      );
    } catch (err) {
      console.error(
        "Update status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const cancelOrder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");

      await axios.patch(
        `${API_BASE_URL}/orders/${id}/cancel`,
        {},
        {
          headers: getHeaders(),
        }
      );

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order._id === id
                ? {
                    ...order,
                    status: "Cancelled",
                  }
                : order
          )
      );

      setSelectedOrder(
        (previousOrder) =>
          previousOrder &&
          previousOrder._id === id
            ? {
                ...previousOrder,
                status: "Cancelled",
              }
            : previousOrder
      );
    } catch (err) {
      console.error(
        "Cancel order error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

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
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // ITEMS COUNT
  // =====================================================

  const getItemsCount = (items) => {
    if (!Array.isArray(items)) {
      return 0;
    }

    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );
  };

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const statusOptions = [
    "Pending",
    "Accepted",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="orders-page">

      {/* HEADER */}

      <div className="orders-header">

        <div className="orders-header-left">

          <div className="quickserve-label">
            QUICKSERVE ADMIN
          </div>

          <h1>
            🛒 <span>Orders Management</span>
          </h1>

          <p>
            Manage and monitor all QuickServe orders
          </p>

        </div>

        <div className="orders-header-actions">

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
        <div className="orders-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="orders-stat-grid">

        <div className="order-stat-card">
          <div className="stat-icon">
            🛒
          </div>

          <div>
            <p>Total Orders</p>
            <h2>
              {statistics.total}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <p>Pending</p>
            <h2>
              {statistics.pending}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            ✓
          </div>

          <div>
            <p>Confirmed</p>
            <h2>
              {statistics.confirmed}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            🍳
          </div>

          <div>
            <p>Preparing</p>
            <h2>
              {statistics.preparing}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            🛵
          </div>

          <div>
            <p>Out for Delivery</p>
            <h2>
              {statistics.delivery}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            ✓
          </div>

          <div>
            <p>Delivered</p>
            <h2>
              {statistics.delivered}
            </h2>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon">
            !
          </div>

          <div>
            <p>Cancelled</p>
            <h2>
              {statistics.cancelled}
            </h2>
          </div>
        </div>

      </div>

      {/* SEARCH */}

      <div className="orders-toolbar">

        <div className="search-wrapper">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            className="orders-search-input"
            placeholder="Search by Order ID, Customer, Restaurant or Food"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="orders-status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Confirmed">
            Confirmed
          </option>

          <option value="Preparing">
            Preparing
          </option>

          <option value="Out for Delivery">
            Out for Delivery
          </option>

          <option value="Delivered">
            Delivered
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {/* TABLE */}

      <div className="orders-table-card">

        <div className="table-heading">

          <h2>Orders List</h2>

          <span>
            {filteredOrders.length} orders found
          </span>

        </div>

        {loading ? (
          <div className="orders-loading">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">

            <div className="empty-icon">
              🛒
            </div>

            <h3>
              No Orders Found
            </h3>

            <p>
              No orders match your
              search or selected filter.
            </p>

          </div>
        ) : (
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Food Items</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order._id}
                    >

                      {/* ORDER ID */}

                      <td>
                        <strong className="order-id">
                          {formatOrderId(
                            order._id
                          )}
                        </strong>
                      </td>

                      {/* CUSTOMER */}

                      <td>

                        <div className="customer-cell">

                          <div className="customer-avatar">
                            {getCustomerName(
                              order
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getCustomerName(
                                order
                              )}
                            </strong>

                            <small>
                              {getCustomerEmail(
                                order
                              )}
                            </small>
                          </div>

                        </div>

                      </td>

                      {/* RESTAURANT */}

                      <td>

                        <div className="restaurant-cell">

                          <strong>
                            {getRestaurantName(
                              order
                            )}
                          </strong>

                          <small>
                            {getRestaurantId(
                              order
                            )}
                          </small>

                        </div>

                      </td>

                      {/* FOOD ITEMS */}

                      <td>

                        <div className="food-cell">

                          {Array.isArray(
                            order.items
                          ) &&
                          order.items.length > 0 ? (
                            order.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  className="food-item-row"
                                  key={
                                    item._id ||
                                    item.menuId ||
                                    index
                                  }
                                >

                                  <strong>
                                    {item.foodName ||
                                      "Food Item"}
                                  </strong>

                                  <span>
                                    ₹
                                    {Number(
                                      item.price ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>

                                </div>
                              )
                            )
                          ) : (
                            "-"
                          )}

                        </div>

                      </td>

                      {/* QTY */}

                      <td>
                        <strong>
                          {getItemsCount(
                            order.items
                          )}
                        </strong>
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <strong>
                          {formatAmount(
                            order.totalAmount
                          )}
                        </strong>
                      </td>

                      {/* PAYMENT */}

                      <td>

                        <span
                          className={`payment-badge ${
                            order.paymentStatus ===
                            "Paid"
                              ? "paid"
                              : order.paymentStatus ===
                                "Failed"
                              ? "failed"
                              : "payment-pending"
                          }`}
                        >
                          {order.paymentStatus ||
                            "Pending"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="date-cell">

                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <small>
                            {formatTime(
                              order.createdAt
                            )}
                          </small>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="action-buttons">

                          <button
                            className="view-button"
                            onClick={() =>
                              viewOrderDetails(
                                order._id
                              )
                            }
                          >
                            View
                          </button>

                          {order.status !==
                            "Delivered" &&
                            order.status !==
                              "Cancelled" && (

                              <select
                                className="status-select"
                                value={
                                  order.status ||
                                  "Pending"
                                }
                                disabled={
                                  updatingId ===
                                  order._id
                                }
                                onChange={(e) =>
                                  updateOrderStatus(
                                    order._id,
                                    e.target.value
                                  )
                                }
                              >

                                {statusOptions.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {status ===
                                      "Accepted"
                                        ? "Confirmed"
                                        : status}
                                    </option>
                                  )
                                )}

                              </select>

                            )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Order Details
                </h2>

                <p>
                  {formatOrderId(
                    selectedOrder._id
                  )}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>

            {detailsLoading ? (

              <div className="orders-loading">
                Loading details...
              </div>

            ) : (

              <div className="modal-content">

                {/* DETAILS */}

                <div className="detail-grid">

                  <div className="detail-box">

                    <span>
                      Order ID
                    </span>

                    <strong>
                      {formatOrderId(
                        selectedOrder._id
                      )}
                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedOrder.createdAt
                      )}
                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Customer
                    </span>

                    <strong>
                      {getCustomerName(
                        selectedOrder
                      )}
                    </strong>

                    <small>
                      {getCustomerEmail(
                        selectedOrder
                      )}
                    </small>

                  </div>

                  <div className="detail-box">

                    <span>
                      Restaurant
                    </span>

                    <strong>
                      {getRestaurantName(
                        selectedOrder
                      )}
                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      {formatAmount(
                        selectedOrder.totalAmount
                      )}
                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {selectedOrder.paymentStatus ||
                        "Pending"}
                    </strong>

                  </div>

                </div>

                {/* STATUS */}

                <div className="details-section">

                  <h3>
                    Order Status
                  </h3>

                  <div className="status-update-row">

                    <span
                      className={`status-badge ${getStatusClass(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusLabel(
                        selectedOrder.status
                      )}
                    </span>

                    {selectedOrder.status !==
                      "Delivered" &&
                      selectedOrder.status !==
                        "Cancelled" && (

                        <select
                          className="modal-status-select"
                          value={
                            selectedOrder.status ||
                            "Pending"
                          }
                          disabled={
                            updatingId ===
                            selectedOrder._id
                          }
                          onChange={(e) =>
                            updateOrderStatus(
                              selectedOrder._id,
                              e.target.value
                            )
                          }
                        >

                          {statusOptions.map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {status ===
                                "Accepted"
                                  ? "Confirmed"
                                  : status}
                              </option>
                            )
                          )}

                        </select>

                      )}

                  </div>

                </div>

                {/* FOOD ITEMS */}

                <div className="details-section">

                  <h3>
                    Ordered Food Items
                  </h3>

                  {Array.isArray(
                    selectedOrder.items
                  ) &&
                  selectedOrder.items.length >
                    0 ? (

                    <div className="items-list">

                      {selectedOrder.items.map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            className="order-item"
                            key={
                              item._id ||
                              item.menuId ||
                              index
                            }
                          >

                            <div>

                              <strong>
                                {item.foodName ||
                                  "Food Item"}
                              </strong>

                              <span>
                                Qty:{" "}
                                {item.quantity ||
                                  0}
                              </span>

                            </div>

                            <strong>
                              {formatAmount(
                                Number(
                                  item.price ||
                                    0
                                ) *
                                  Number(
                                    item.quantity ||
                                      0
                                  )
                              )}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p>
                      No food items available.
                    </p>

                  )}

                </div>

                {/* ACTIONS */}

                <div className="modal-actions">

                  {selectedOrder.status !==
                    "Delivered" &&
                    selectedOrder.status !==
                      "Cancelled" && (

                      <button
                        className="cancel-order-button"
                        disabled={
                          updatingId ===
                          selectedOrder._id
                        }
                        onClick={() =>
                          cancelOrder(
                            selectedOrder._id
                          )
                        }
                      >
                        Cancel Order
                      </button>

                    )}

                  <button
                    className="close-button"
                    onClick={() =>
                      setSelectedOrder(null)
                    }
                  >
                    Close
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .orders-page {
          min-height: 100vh;
          padding: 28px;
          background: #f7f8fa;
          color: #111827;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .orders-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .orders-header-left {
          display: flex;
          flex-direction: column;
        }

        .quickserve-label {
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .orders-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
          font-weight: 700;
          color: #111827 !important;
        }

        .orders-header h1 span {
          color: #111827 !important;
        }

        .orders-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .orders-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 26px;
        }

        .dashboard-button {
          height: 43px;
          padding: 0 20px;
          border: none;
          border-radius: 9px;
          background: #1e293b;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 3px 8px rgba(15, 23, 42, 0.12);
        }

        .dashboard-button:hover {
          background: #111827;
          transform: translateY(-1px);
        }

        .dashboard-button:active {
          transform: translateY(0);
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .orders-error {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          border-radius: 10px;
          padding: 12px 15px;
          margin-bottom: 20px;
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .orders-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(175px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .order-stat-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 100px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .order-stat-card p {
          margin: 0 0 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .order-stat-card h2 {
          margin: 0;
          font-size: 23px;
          color: #111827;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .orders-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .orders-search-input {
          width: 100%;
          height: 46px;
          border: 1px solid #374151;
          border-radius: 10px;
          outline: none;
          padding: 0 15px 0 42px;
          background: #24272c;
          color: #ffffff;
          font-size: 14px;
        }

        .orders-search-input::placeholder {
          color: #b8bec8;
          opacity: 1;
        }

        .orders-search-input:focus {
          border-color: #6b7280;
          background: #2a2d32;
        }

        .orders-status-filter {
          height: 46px;
          min-width: 180px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 13px;
          background: #fff;
          color: #374151;
          outline: none;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .orders-table-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .table-heading {
          padding: 19px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-heading h2 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #111827;
        }

        .table-heading span {
          color: #6b7280;
          font-size: 12px;
        }

        .orders-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1250px;
        }

        .orders-table th {
          text-align: left;
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 13px 15px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .orders-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #f0f1f3;
          font-size: 13px;
          color: #374151;
          vertical-align: middle;
        }

        .orders-table tbody tr:hover {
          background: #fafafa;
        }

        .order-id {
          color: #111827;
        }

        /* =====================================================
           CUSTOMER
        ===================================================== */

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 170px;
        }

        .customer-avatar {
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

        .customer-cell div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .customer-cell strong {
          color: #111827;
        }

        .customer-cell small {
          color: #9ca3af;
          font-size: 10px;
        }

        /* =====================================================
           RESTAURANT
        ===================================================== */

        .restaurant-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 130px;
        }

        .restaurant-cell strong {
          color: #111827;
        }

        .restaurant-cell small {
          color: #9ca3af;
          font-size: 9px;
        }

        /* =====================================================
           FOOD
        ===================================================== */

        .food-cell {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 160px;
          max-width: 220px;
        }

        .food-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .food-item-row strong {
          color: #111827;
          font-size: 12px;
        }

        .food-item-row span {
          color: #6b7280;
          font-size: 11px;
          white-space: nowrap;
        }

        /* =====================================================
           DATE
        ===================================================== */

        .date-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          white-space: nowrap;
        }

        .date-cell small {
          color: #9ca3af;
          font-size: 10px;
        }

        /* =====================================================
           BADGES
        ===================================================== */

        .status-badge,
        .payment-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-badge.confirmed {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .status-badge.preparing {
          background: #fefce8;
          color: #a16207;
        }

        .status-badge.delivery {
          background: #f5f3ff;
          color: #6d28d9;
        }

        .status-badge.delivered {
          background: #f0fdf4;
          color: #15803d;
        }

        .status-badge.cancelled {
          background: #fff1f2;
          color: #be123c;
        }

        .payment-badge.paid {
          background: #f0fdf4;
          color: #15803d;
        }

        .payment-badge.failed {
          background: #fff1f2;
          color: #be123c;
        }

        .payment-badge.payment-pending {
          background: #fff7ed;
          color: #c2410c;
        }

        /* =====================================================
           ACTION
        ===================================================== */

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .view-button {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #374151;
          border-radius: 7px;
          padding: 7px 11px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .view-button:hover {
          background: #f3f4f6;
        }

        .status-select {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #374151;
          border-radius: 7px;
          padding: 6px 7px;
          font-size: 11px;
          outline: none;
          cursor: pointer;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .orders-loading,
        .orders-empty {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          padding: 30px;
        }

        .orders-empty h3 {
          margin: 10px 0 5px;
          color: #374151;
        }

        .orders-empty p {
          margin: 0;
          font-size: 13px;
        }

        .empty-icon {
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
           MODAL
        ===================================================== */

        .order-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .order-modal {
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0 0 4px;
          color: #111827;
        }

        .modal-header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #f3f4f6;
          font-size: 21px;
          cursor: pointer;
        }

        .modal-content {
          padding: 22px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .detail-box {
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .detail-box span {
          color: #9ca3af;
          font-size: 11px;
        }

        .detail-box strong {
          color: #111827;
          font-size: 13px;
        }

        .detail-box small {
          color: #9ca3af;
        }

        .details-section {
          margin-top: 22px;
        }

        .details-section h3 {
          margin: 0 0 12px;
          font-size: 15px;
          color: #111827;
        }

        .status-update-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-status-select {
          height: 35px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          padding: 0 10px;
          background: #fff;
        }

        .items-list {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }

        .order-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 15px;
          border-bottom: 1px solid #f0f1f3;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-item strong {
          color: #111827;
        }

        .order-item span {
          color: #9ca3af;
          font-size: 11px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 25px;
        }

        .cancel-order-button,
        .close-button {
          border: none;
          border-radius: 8px;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-order-button {
          background: #fff1f2;
          color: #be123c;
        }

        .close-button {
          background: #111827;
          color: #fff;
        }

        button:disabled,
        select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .orders-page {
            padding: 18px;
          }

          .orders-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .orders-toolbar {
            flex-direction: column;
          }

          .orders-status-filter {
            width: 100%;
          }

        }

        @media (max-width: 600px) {

          .orders-header {
            flex-direction: column;
          }

          .orders-header-actions {
            padding-top: 0;
            width: 100%;
          }

          .dashboard-button {
            width: 100%;
          }

          .orders-stat-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .order-modal-overlay {
            padding: 10px;
          }

          .modal-content {
            padding: 16px;
          }

        }

      `}</style>

    </div>
  );
}

export default Orders;