import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

function Reports({ onBack }) {
  const API_BASE_URL = "http://localhost:3000";

  // =====================================================
  // DATE
  // =====================================================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // =====================================================
  // DATA
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // RESTAURANT SEARCH
  // =====================================================

  const [restaurantSearch, setRestaurantSearch] = useState("");

  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState("");

  const [appliedRestaurantId, setAppliedRestaurantId] =
    useState("");

  // =====================================================
  // DATE REFS
  // =====================================================

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // =====================================================
  // CALENDAR
  // =====================================================

  const openCalendar = (ref) => {
    if (!ref.current) return;

    try {
      if (typeof ref.current.showPicker === "function") {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    } catch (error) {
      ref.current.focus();
    }
  };

  // =====================================================
  // HEADERS
  // =====================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }

    return {
      "Content-Type": "application/json",
    };
  };

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/orders`,
        {
          headers: getHeaders(),
        }
      );

      console.log(
        "========== REPORT ORDERS API =========="
      );

      console.log(
        "FULL ORDER RESPONSE:",
        response.data
      );

      const responseData = response?.data;

      let orderData = [];

      if (Array.isArray(responseData?.data)) {
        orderData = responseData.data;
      } else if (Array.isArray(responseData?.orders)) {
        orderData = responseData.orders;
      } else if (Array.isArray(responseData?.results)) {
        orderData = responseData.results;
      } else if (Array.isArray(responseData)) {
        orderData = responseData;
      }

      console.log(
        "FINAL ORDERS ARRAY:",
        orderData
      );

      console.log(
        "TOTAL ORDERS FROM API:",
        orderData.length
      );

      // Debug restaurant + date information
      orderData.forEach((order, index) => {
        console.log(
          `ORDER ${index + 1} DATA:`,
          {
            orderId:
              order?._id ||
              order?.id ||
              order?.orderId,

            restaurant:
              order?.restaurant,

            restaurantDetails:
              order?.restaurantDetails,

            hotel:
              order?.hotel,

            hotelDetails:
              order?.hotelDetails,

            restaurantId:
              order?.restaurantId,

            restaurantID:
              order?.restaurantID,

            restaurant_id:
              order?.restaurant_id,

            extractedRestaurantId:
              getRestaurantId(order),

            extractedOrderDate:
              getDateOnly(
                getOrderDate(order)
              ),
          }
        );
      });

      return orderData;
    } catch (err) {
      console.error(
        "Orders report error:",
        err?.response?.data || err
      );

      return [];
    }
  };

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users`,
        {
          headers: getHeaders(),
        }
      );

      console.log(
        "REPORT USERS:",
        response.data
      );

      if (response.data?.success) {
        return Array.isArray(response.data.data)
          ? response.data.data
          : [];
      }

      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (err) {
      console.warn(
        "Users API unavailable:",
        err
      );

      return [];
    }
  };

  // =====================================================
  // FETCH RESTAURANTS
  // =====================================================

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/restaurants`,
        {
          headers: getHeaders(),
        }
      );

      console.log(
        "REPORT RESTAURANTS:",
        response.data
      );

      if (response.data?.success) {
        return Array.isArray(response.data.data)
          ? response.data.data
          : [];
      }

      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data?.restaurants)) {
        return response.data.restaurants;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (err) {
      console.warn(
        "Restaurants API unavailable:",
        err
      );

      return [];
    }
  };

  // =====================================================
  // FETCH ALL REPORT DATA
  // =====================================================

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ordersData,
        usersData,
        restaurantsData,
      ] = await Promise.all([
        fetchOrders(),
        fetchUsers(),
        fetchRestaurants(),
      ]);

      setOrders(ordersData);
      setUsers(usersData);
      setRestaurants(restaurantsData);
    } catch (err) {
      console.error(
        "Report fetch error:",
        err
      );

      setError(
        "Unable to load report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // =====================================================
  // GENERIC ID
  // =====================================================

  const getId = (item) => {
    if (!item) return "";

    if (
      typeof item === "string" ||
      typeof item === "number"
    ) {
      return String(item).trim();
    }

    return String(
      item?._id ||
        item?.id ||
        item?.restaurantId ||
        item?.restaurantID ||
        item?.restaurant_id ||
        ""
    ).trim();
  };

  // =====================================================
  // RESTAURANT ID FROM ORDER
  // =====================================================

  const getRestaurantId = (order) => {
    if (!order) return "";

    // All possible restaurant fields
    const restaurant =
      order?.restaurant ??
      order?.restaurantDetails ??
      order?.hotel ??
      order?.hotelDetails;

    // ===================================================
    // RESTAURANT IS OBJECT
    // ===================================================

    if (
      restaurant &&
      typeof restaurant === "object"
    ) {
      const id =
        restaurant?._id ||
        restaurant?.id ||
        restaurant?.restaurantId ||
        restaurant?.restaurantID ||
        restaurant?.restaurant_id ||
        restaurant?.value;

      if (id) {
        return String(id).trim();
      }
    }

    // ===================================================
    // RESTAURANT IS DIRECT STRING / NUMBER
    // ===================================================

    if (
      typeof restaurant === "string" ||
      typeof restaurant === "number"
    ) {
      return String(restaurant).trim();
    }

    // ===================================================
    // OTHER POSSIBLE ORDER FIELDS
    // ===================================================

    const directId =
      order?.restaurantId ??
      order?.restaurantID ??
      order?.restaurant_id ??
      order?.hotelId ??
      order?.hotelID ??
      order?.hotel_id;

    // Nested ID object
    if (
      directId &&
      typeof directId === "object"
    ) {
      return String(
        directId?._id ||
          directId?.id ||
          directId?.restaurantId ||
          directId?.restaurantID ||
          ""
      ).trim();
    }

    if (
      typeof directId === "string" ||
      typeof directId === "number"
    ) {
      return String(directId).trim();
    }

    return "";
  };

  // =====================================================
  // RESTAURANT NAME FROM ORDER
  // =====================================================

  const getRestaurantNameFromOrder = (
    order
  ) => {
    const restaurant =
      order?.restaurant ??
      order?.restaurantDetails ??
      order?.hotel ??
      order?.hotelDetails;

    if (
      restaurant &&
      typeof restaurant === "object"
    ) {
      return (
        restaurant?.name ||
        restaurant?.restaurantName ||
        restaurant?.hotelName ||
        "Restaurant"
      );
    }

    return (
      order?.restaurantName ||
      order?.restaurant_name ||
      order?.hotelName ||
      order?.hotel_name ||
      "Restaurant"
    );
  };

  // =====================================================
  // RESTAURANT LIST
  // =====================================================

  const restaurantList = useMemo(() => {
    const map = new Map();

    // Restaurants API
    restaurants.forEach(
      (restaurant) => {
        const id = getId(restaurant);

        if (!id) return;

        const name =
          restaurant?.name ||
          restaurant?.restaurantName ||
          restaurant?.hotelName ||
          "Restaurant";

        map.set(id, {
          id,
          name,
          restaurant,
        });
      }
    );

    // Also create restaurant list from orders
    orders.forEach((order) => {
      const id = getRestaurantId(order);

      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          id,
          name:
            getRestaurantNameFromOrder(
              order
            ),
          restaurant: null,
        });
      }
    });

    return Array.from(
      map.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [restaurants, orders]);

  // =====================================================
  // FILTER RESTAURANTS
  // =====================================================

  const filteredRestaurantList =
    useMemo(() => {
      const search =
        restaurantSearch
          .trim()
          .toLowerCase();

      if (!search) return [];

      return restaurantList.filter(
        (restaurant) =>
          String(
            restaurant.name || ""
          )
            .toLowerCase()
            .includes(search)
      );
    }, [
      restaurantList,
      restaurantSearch,
    ]);

  // =====================================================
  // SELECTED RESTAURANT
  // =====================================================

  const selectedRestaurant =
    useMemo(() => {
      if (!selectedRestaurantId) {
        return null;
      }

      return restaurantList.find(
        (restaurant) =>
          String(
            restaurant.id
          ).trim() ===
          String(
            selectedRestaurantId
          ).trim()
      );
    }, [
      restaurantList,
      selectedRestaurantId,
    ]);

  // =====================================================
  // APPLIED RESTAURANT
  // =====================================================

  const appliedRestaurant =
    useMemo(() => {
      if (!appliedRestaurantId) {
        return null;
      }

      return restaurantList.find(
        (restaurant) =>
          String(
            restaurant.id
          ).trim() ===
          String(
            appliedRestaurantId
          ).trim()
      );
    }, [
      restaurantList,
      appliedRestaurantId,
    ]);

  // =====================================================
  // ORDER DATE
  // =====================================================

  const getOrderDate = (order) => {
    if (!order) return null;

    return (
      order?.createdAt ||
      order?.created_at ||
      order?.orderDate ||
      order?.order_date ||
      order?.date ||
      order?.created_on ||
      order?.createdOn ||
      order?.placedAt ||
      order?.placed_at ||
      null
    );
  };

  // =====================================================
  // DATE ONLY
  // =====================================================

  const getDateOnly = (date) => {
    if (!date) return "";

    // Already YYYY-MM-DD
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

    // ISO date
    // 2026-08-23T10:30:00.000Z
    //
    // Direct first 10 characters.
    // This avoids timezone shifting 23 Aug -> 22 Aug.
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}T/.test(date)
    ) {
      return date.substring(0, 10);
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    const year =
      parsed.getFullYear();

    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsed.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // SELECTED RESTAURANT ORDERS
  // =====================================================

  const selectedRestaurantOrders =
    useMemo(() => {
      if (
        !appliedRestaurantId ||
        !appliedFromDate ||
        !appliedToDate
      ) {
        return [];
      }

      const selectedId =
        String(
          appliedRestaurantId
        ).trim();

      console.log(
        "===================================="
      );

      console.log(
        "RESTAURANT REPORT FILTER"
      );

      console.log(
        "Selected Restaurant ID:",
        selectedId
      );

      console.log(
        "From Date:",
        appliedFromDate
      );

      console.log(
        "To Date:",
        appliedToDate
      );

      console.log(
        "Total API Orders:",
        orders.length
      );

      console.log(
        "===================================="
      );

      const filteredOrders =
        orders.filter((order) => {
          const orderRestaurantId =
            getRestaurantId(order);

          const orderDate =
            getDateOnly(
              getOrderDate(order)
            );

          const restaurantMatch =
            String(
              orderRestaurantId
            ).trim() === selectedId;

          const dateMatch =
            orderDate &&
            orderDate >=
              appliedFromDate &&
            orderDate <=
              appliedToDate;

          console.log(
            "ORDER CHECK:",
            {
              orderId:
                order?._id ||
                order?.id ||
                order?.orderId,

              orderRestaurantId,

              selectedId,

              orderDate,

              fromDate:
                appliedFromDate,

              toDate:
                appliedToDate,

              restaurantMatch,

              dateMatch,
            }
          );

          if (!restaurantMatch) {
            return false;
          }

          if (!dateMatch) {
            return false;
          }

          return true;
        });

      console.log(
        "===================================="
      );

      console.log(
        "MATCHED ORDERS:",
        filteredOrders.length
      );

      console.log(
        filteredOrders
      );

      console.log(
        "===================================="
      );

      return filteredOrders;
    }, [
      orders,
      appliedRestaurantId,
      appliedFromDate,
      appliedToDate,
    ]);

  // =====================================================
  // APPLY REPORT
  // =====================================================

  const handleApplyReport = () => {
    setError("");

    if (!selectedRestaurantId) {
      setError(
        "Please search and select a restaurant."
      );
      return;
    }

    if (!fromDate) {
      setError(
        "Please select From Date."
      );
      return;
    }

    if (!toDate) {
      setError(
        "Please select To Date."
      );
      return;
    }

    if (fromDate > toDate) {
      setError(
        "From Date cannot be greater than To Date."
      );
      return;
    }

    const restaurantId =
      String(
        selectedRestaurantId
      ).trim();

    console.log(
      "========== APPLY REPORT =========="
    );

    console.log(
      "Restaurant ID:",
      restaurantId
    );

    console.log(
      "From:",
      fromDate
    );

    console.log(
      "To:",
      toDate
    );

    setAppliedRestaurantId(
      restaurantId
    );

    setAppliedFromDate(
      fromDate
    );

    setAppliedToDate(
      toDate
    );
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setRestaurantSearch("");
    setSelectedRestaurantId("");
    setAppliedRestaurantId("");

    setFromDate(today);
    setToDate(today);

    setAppliedFromDate("");
    setAppliedToDate("");

    setError("");
  };

  // =====================================================
  // CLOSE RESTAURANT REPORT
  // =====================================================

  const handleCloseRestaurantReport =
    () => {
      setAppliedRestaurantId("");
      setSelectedRestaurantId("");
      setRestaurantSearch("");

      setAppliedFromDate("");
      setAppliedToDate("");

      setError("");
    };

  // =====================================================
  // AMOUNT
  // =====================================================

  const getAmount = (order) => {
    const amount =
      order?.totalAmount ??
      order?.amount ??
      order?.total ??
      order?.orderAmount ??
      order?.order_amount ??
      order?.price ??
      0;

    const numericAmount =
      Number(amount);

    return Number.isNaN(
      numericAmount
    )
      ? 0
      : numericAmount;
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (
    order
  ) => {
    const status =
      order?.paymentStatus ??
      order?.payment_status ??
      order?.paymentDetails
        ?.paymentStatus ??
      order?.paymentDetails
        ?.status ??
      order?.payment?.status ??
      order?.payment?.paymentStatus ??
      "";

    const normalized =
      String(status)
        .trim()
        .toLowerCase();

    if (
      normalized === "paid" ||
      normalized === "success" ||
      normalized === "successful" ||
      normalized === "completed"
    ) {
      return "Paid";
    }

    if (
      normalized === "failed" ||
      normalized === "failure"
    ) {
      return "Failed";
    }

    return "Pending";
  };

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const getOrderStatus = (
    order
  ) => {
    const status =
      order?.status ??
      order?.orderStatus ??
      order?.order_status ??
      "Pending";

    if (!status) {
      return "Pending";
    }

    return String(status)
      .trim()
      .replace(
        /^./,
        (char) =>
          char.toUpperCase()
      );
  };

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  const getCustomerName = (
    order
  ) => {
    const customer =
      order?.customer ??
      order?.customerDetails ??
      order?.user ??
      order?.userDetails;

    if (
      customer &&
      typeof customer === "object"
    ) {
      return (
        customer?.name ||
        customer?.fullName ||
        customer?.username ||
        customer?.email ||
        "Customer"
      );
    }

    return (
      order?.customerName ||
      order?.userName ||
      order?.customer_name ||
      "Customer"
    );
  };

  // =====================================================
  // CUSTOMER EMAIL
  // =====================================================

  const getCustomerEmail = (
    order
  ) => {
    const customer =
      order?.customer ??
      order?.customerDetails ??
      order?.user ??
      order?.userDetails;

    if (
      customer &&
      typeof customer === "object"
    ) {
      return customer?.email || "";
    }

    return (
      order?.customerEmail ||
      order?.customer_email ||
      ""
    );
  };

  // =====================================================
  // ORDER ID
  // =====================================================

  const getOrderId = (order) => {
    return String(
      order?._id ||
        order?.id ||
        order?.orderId ||
        "-"
    );
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const calculateStatistics = (
    orderData
  ) => {
    const totalOrders =
      orderData.length;

    const deliveredOrders =
      orderData.filter(
        (order) =>
          String(
            getOrderStatus(order)
          ).toLowerCase() ===
          "delivered"
      );

    const cancelledOrders =
      orderData.filter(
        (order) =>
          String(
            getOrderStatus(order)
          ).toLowerCase() ===
          "cancelled"
      );

    const pendingOrders =
      orderData.filter(
        (order) => {
          const status =
            String(
              getOrderStatus(order)
            ).toLowerCase();

          return (
            status !== "delivered" &&
            status !== "cancelled"
          );
        }
      );

    const paidOrders =
      orderData.filter(
        (order) =>
          getPaymentStatus(order) ===
          "Paid"
      );

    const pendingPayments =
      orderData.filter(
        (order) =>
          getPaymentStatus(order) ===
          "Pending"
      );

    const totalRevenue =
      paidOrders.reduce(
        (total, order) =>
          total + getAmount(order),
        0
      );

    const paidAmount =
      paidOrders.reduce(
        (total, order) =>
          total + getAmount(order),
        0
      );

    const pendingAmount =
      pendingPayments.reduce(
        (total, order) =>
          total + getAmount(order),
        0
      );

    return {
      totalOrders,

      deliveredOrders:
        deliveredOrders.length,

      pendingOrders:
        pendingOrders.length,

      cancelledOrders:
        cancelledOrders.length,

      paidPayments:
        paidOrders.length,

      pendingPayments:
        pendingPayments.length,

      totalRevenue,

      paidAmount,

      pendingAmount,
    };
  };

  // =====================================================
  // OVERALL STATISTICS
  // =====================================================

  const overallStatistics =
    useMemo(() => {
      return calculateStatistics(
        orders
      );
    }, [orders]);

  // =====================================================
  // SELECTED RESTAURANT STATISTICS
  // =====================================================

  const selectedRestaurantStatistics =
    useMemo(() => {
      return calculateStatistics(
        selectedRestaurantOrders
      );
    }, [
      selectedRestaurantOrders,
    ]);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatAmount = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDisplayDate = (
    date
  ) => {
    if (!date) return "-";

    const parsed = new Date(
      `${date}T00:00:00`
    );

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // REPORT RANGE
  // =====================================================

  const reportRange =
    appliedFromDate &&
    appliedToDate
      ? appliedFromDate ===
        appliedToDate
        ? formatDisplayDate(
            appliedFromDate
          )
        : `${formatDisplayDate(
            appliedFromDate
          )} - ${formatDisplayDate(
            appliedToDate
          )}`
      : "-";

  // =====================================================
  // RESTAURANT REPORT PAGE
  // =====================================================

  if (
    !loading &&
    appliedRestaurantId
  ) {
    return (
      <div className="reports-page">

        <div className="restaurant-report-top">

          <button
            className="close-report-button"
            onClick={
              handleCloseRestaurantReport
            }
            title="Close Report"
          >
            ×
          </button>

        </div>

        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}

        <div className="restaurant-report-title">

          <div>
            <span>
              RESTAURANT REPORT
            </span>

            <h1>
              {appliedRestaurant?.name ||
                "Restaurant"}
            </h1>
          </div>

        </div>

        <div className="restaurant-report-form">

          <div className="form-section-title">

            <h2>
              Restaurant Report
            </h2>

            <p>
              Detailed performance report
              for the selected restaurant.
            </p>

          </div>

          <div className="report-form-grid">

            <div className="report-field">

              <label>
                Restaurant Name
              </label>

              <div className="report-field-value">
                {appliedRestaurant?.name ||
                  "Restaurant"}
              </div>

            </div>

            <div className="report-field">

              <label>
                Report Period
              </label>

              <div className="report-field-value">
                {reportRange}
              </div>

            </div>

            <div className="report-field">

              <label>
                Total Orders
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.totalOrders
                }
              </div>

            </div>

            <div className="report-field">

              <label>
                Delivered Orders
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.deliveredOrders
                }
              </div>

            </div>

            <div className="report-field">

              <label>
                Pending Orders
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.pendingOrders
                }
              </div>

            </div>

            <div className="report-field">

              <label>
                Cancelled Orders
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.cancelledOrders
                }
              </div>

            </div>

            <div className="report-field">

              <label>
                Total Revenue
              </label>

              <div className="report-field-value">
                {formatAmount(
                  selectedRestaurantStatistics.totalRevenue
                )}
              </div>

            </div>

            <div className="report-field">

              <label>
                Paid Payments
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.paidPayments
                }
              </div>

            </div>

            <div className="report-field">

              <label>
                Pending Payments
              </label>

              <div className="report-field-value">
                {
                  selectedRestaurantStatistics.pendingPayments
                }
              </div>

            </div>

          </div>

        </div>

        <div className="restaurant-detail-card">

          <div className="detail-card-header">

            <div>

              <h2>
                Order Details
              </h2>

              <p>
                Orders placed during the
                selected report period
              </p>

            </div>

            <div className="detail-count">
              {
                selectedRestaurantOrders.length
              }{" "}
              Orders
            </div>

          </div>

          {selectedRestaurantOrders.length ===
          0 ? (
            <div className="empty-table">

              <div>📋</div>

              <h3>
                No orders found
              </h3>

              <p>
                No orders were found for this
                restaurant in the selected
                date range.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table className="professional-table">

                <thead>

                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>
                      Payment Status
                    </th>
                    <th>
                      Order Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {selectedRestaurantOrders.map(
                    (order, index) => {

                      const payment =
                        getPaymentStatus(
                          order
                        );

                      const orderStatus =
                        getOrderStatus(
                          order
                        );

                      const customerName =
                        getCustomerName(
                          order
                        );

                      return (
                        <tr
                          key={
                            getOrderId(
                              order
                            ) + index
                          }
                        >

                          <td>

                            <span className="order-id">
                              #
                              {getOrderId(
                                order
                              ).slice(-8)}
                            </span>

                          </td>

                          <td>

                            <div className="customer-cell">

                              <div className="customer-avatar">
                                {customerName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {
                                    customerName
                                  }
                                </strong>

                                {getCustomerEmail(
                                  order
                                ) && (
                                  <span>
                                    {
                                      getCustomerEmail(
                                        order
                                      )
                                    }
                                  </span>
                                )}

                              </div>

                            </div>

                          </td>

                          <td>

                            {getDateOnly(
                              getOrderDate(
                                order
                              )
                            )
                              ? formatDisplayDate(
                                  getDateOnly(
                                    getOrderDate(
                                      order
                                    )
                                  )
                                )
                              : "-"}

                          </td>

                          <td>

                            <strong className="amount-cell">
                              {formatAmount(
                                getAmount(
                                  order
                                )
                              )}
                            </strong>

                          </td>

                          <td>

                            <span
                              className={`status-badge payment-${payment.toLowerCase()}`}
                            >
                              {payment}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status-badge order-${String(
                                orderStatus
                              )
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {orderStatus}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        <style>
          {restaurantReportStyles}
        </style>

      </div>
    );
  }

  // =====================================================
  // MAIN REPORT PAGE
  // =====================================================

  return (
    <div className="reports-page">

      <div className="reports-header">

        <div>

          <h1>
            Reports
          </h1>

          <p>
            View and analyze QuickServe
            business reports
          </p>

        </div>

        <button
          className="reports-dashboard-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="reports-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading report...
          </p>

        </div>
      ) : (
        <>

          {/* OVERALL SUMMARY */}

          <div className="report-section-title">

            <div>

              <h2>
                Report Summary
              </h2>

              <p>
                Overall business data
              </p>

            </div>

            <div className="all-time-badge">
              All Time Data
            </div>

          </div>

          <div className="reports-stat-grid">

            <StatCard
              icon="🛒"
              title="Total Orders"
              value={
                overallStatistics.totalOrders
              }
              subtitle="All orders received"
            />

            <StatCard
              icon="✓"
              iconClass="delivered"
              title="Delivered"
              value={
                overallStatistics.deliveredOrders
              }
              subtitle="Successfully delivered"
            />

            <StatCard
              icon="⏳"
              iconClass="pending"
              title="Pending Orders"
              value={
                overallStatistics.pendingOrders
              }
              subtitle="In progress"
            />

            <StatCard
              icon="!"
              iconClass="cancelled"
              title="Cancelled"
              value={
                overallStatistics.cancelledOrders
              }
              subtitle="Cancelled orders"
            />

            <StatCard
              icon="₹"
              iconClass="revenue"
              title="Total Revenue"
              value={formatAmount(
                overallStatistics.totalRevenue
              )}
              subtitle="From paid orders"
            />

            <StatCard
              icon="✓"
              iconClass="paid"
              title="Paid Payments"
              value={
                overallStatistics.paidPayments
              }
              subtitle={formatAmount(
                overallStatistics.paidAmount
              )}
            />

            <StatCard
              icon="⏳"
              iconClass="pending"
              title="Pending Payments"
              value={
                overallStatistics.pendingPayments
              }
              subtitle={formatAmount(
                overallStatistics.pendingAmount
              )}
            />

          </div>

          {/* RESTAURANT SECTION */}

          <div className="restaurant-section">

            <div className="restaurant-section-header">

              <div>

                <h2>
                  Restaurant-wise Reports
                </h2>

                <p>
                  Search restaurant and select
                  date range to view report
                </p>

              </div>

              <div className="restaurant-total">
                {restaurantList.length} Restaurants
              </div>

            </div>

            {/* SEARCH + DATE */}

            <div className="restaurant-filter-row">

              {/* SEARCH */}

              <div className="restaurant-search-container">

                <label>
                  Restaurant
                </label>

                <div className="restaurant-search">

                  <span className="search-icon">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search restaurant by name..."
                    value={
                      restaurantSearch
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setRestaurantSearch(
                        value
                      );

                      setError("");

                      if (
                        selectedRestaurant &&
                        value !==
                          selectedRestaurant.name
                      ) {
                        setSelectedRestaurantId(
                          ""
                        );

                        setAppliedRestaurantId(
                          ""
                        );
                      }
                    }}
                  />

                  {restaurantSearch && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => {
                        setRestaurantSearch(
                          ""
                        );

                        setSelectedRestaurantId(
                          ""
                        );

                        setAppliedRestaurantId(
                          ""
                        );
                      }}
                    >
                      ×
                    </button>
                  )}

                </div>

                {/* SEARCH RESULT */}

                {restaurantSearch &&
                  !selectedRestaurantId && (
                    <div className="search-results">

                      {filteredRestaurantList.length ===
                      0 ? (
                        <div className="no-search-result">
                          No restaurant found.
                        </div>
                      ) : (
                        filteredRestaurantList.map(
                          (restaurant) => (
                            <button
                              type="button"
                              key={
                                restaurant.id
                              }
                              className="search-result-item"
                              onClick={() => {
                                setSelectedRestaurantId(
                                  restaurant.id
                                );

                                setRestaurantSearch(
                                  restaurant.name
                                );

                                setError("");
                              }}
                            >
                              {
                                restaurant.name
                              }
                            </button>
                          )
                        )
                      )}

                    </div>
                  )}

              </div>

              {/* FROM DATE */}

              <div className="date-field">

                <label>
                  From Date *
                </label>

                <div className="date-input-wrapper">

                  <input
                    ref={fromDateRef}
                    type="date"
                    value={fromDate}
                    max={today}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="calendar-button"
                    onClick={() =>
                      openCalendar(
                        fromDateRef
                      )
                    }
                  >
                    📅
                  </button>

                </div>

              </div>

              {/* TO DATE */}

              <div className="date-field">

                <label>
                  To Date *
                </label>

                <div className="date-input-wrapper">

                  <input
                    ref={toDateRef}
                    type="date"
                    value={toDate}
                    max={today}
                    min={fromDate || undefined}
                    onChange={(e) =>
                      setToDate(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="calendar-button"
                    onClick={() =>
                      openCalendar(
                        toDateRef
                      )
                    }
                  >
                    📅
                  </button>

                </div>

              </div>

              {/* APPLY */}

              <button
                type="button"
                className="apply-report-button"
                onClick={
                  handleApplyReport
                }
              >
                Apply
              </button>

              {/* CLEAR */}

              <button
                type="button"
                className="clear-report-button"
                onClick={handleClear}
              >
                Clear
              </button>

            </div>

          </div>

        </>
      )}

      <style>
        {mainStyles}
      </style>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  iconClass = "",
  title,
  value,
  subtitle,
}) {
  return (
    <div className="report-stat-card dark-card">

      <div
        className={`report-stat-icon ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <h2>
          {value}
        </h2>

        <small>
          {subtitle}
        </small>

      </div>

    </div>
  );
}

/* =========================================================
   MAIN STYLES
========================================================= */

const mainStyles = `

* {
  box-sizing: border-box;
}

.reports-page {
  min-height: 100vh;
  padding: 28px;
  padding-bottom: 80px;
  background: #f7f8fa;
  color: #111827;
  overflow: visible;
}

/* HEADER */

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
}

.reports-header h1 {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 700;
}

.reports-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.reports-dashboard-button {
  border: none;
  background: #1e293b;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 13px 21px;
  border-radius: 9px;
}

/* ERROR */

.reports-error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
  border-radius: 9px;
  padding: 12px 15px;
  margin-bottom: 18px;
  font-size: 13px;
}

/* SUMMARY */

.report-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.report-section-title h2 {
  margin: 0 0 4px;
  font-size: 19px;
}

.report-section-title p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.all-time-badge {
  background: #eef2f7;
  color: #475569;
  border-radius: 7px;
  padding: 8px 13px;
  font-size: 11px;
  font-weight: 700;
}

/* STAT CARDS */

.reports-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 25px;
}

.report-stat-card {
  min-height: 110px;
  border-radius: 12px;
  padding: 17px;
  display: flex;
  align-items: center;
  gap: 13px;
}

.dark-card {
  background: #24272c;
  color: #fff;
}

.report-stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: #34383f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.report-stat-icon.delivered {
  background: #14532d;
}

.report-stat-icon.pending {
  background: #78350f;
}

.report-stat-icon.cancelled {
  background: #881337;
}

.report-stat-icon.revenue {
  background: #065f46;
}

.report-stat-icon.paid {
  background: #166534;
}

.report-stat-card span {
  display: block;
  color: #cbd5e1;
  font-size: 12px;
  margin-bottom: 5px;
}

.report-stat-card h2 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 21px;
}

.report-stat-card small {
  color: #94a3b8;
  font-size: 10px;
}

/* RESTAURANT SECTION */

.restaurant-section {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  padding-bottom: 45px;
  min-height: 220px;
  overflow: visible;
}

.restaurant-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.restaurant-section-header h2 {
  margin: 0 0 5px;
  font-size: 19px;
  font-weight: 700;
}

.restaurant-section-header p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.restaurant-total {
  background: #f1f5f9;
  color: #475569;
  padding: 8px 13px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
}

/* SEARCH + DATE */

.restaurant-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 28px;
  position: relative;
  min-height: 76px;
}

.restaurant-search-container {
  position: relative;
  flex: 1 1 auto;
  min-width: 420px;
  max-width: none;
  z-index: 30;
}

.restaurant-search-container label,
.date-field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.restaurant-search {
  width: 100%;
  height: 48px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #fff !important;
  overflow: hidden;
}

.restaurant-search:focus-within {
  border-color: #1e293b;
}

.search-icon {
  margin-right: 9px;
  font-size: 17px;
  flex-shrink: 0;
}

.restaurant-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: 13px;
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  background: #fff !important;
  height: 100%;
  padding: 0;
  opacity: 1;
}

.restaurant-search input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.restaurant-search input:-webkit-autofill,
.restaurant-search input:-webkit-autofill:hover,
.restaurant-search input:-webkit-autofill:focus {
  -webkit-text-fill-color: #111827 !important;
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  box-shadow: 0 0 0 1000px #fff inset !important;
}

.search-clear {
  border: none;
  background: transparent;
  font-size: 21px;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0 2px;
}

.search-clear:hover {
  color: #374151;
}

/* SEARCH RESULTS */

.search-results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}

.search-result-item {
  width: 100%;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  padding: 13px 15px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8fafc;
}

.no-search-result {
  padding: 15px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

/* DATE */

.date-field {
  display: flex;
  flex-direction: column;
  width: 155px;
  min-width: 155px;
  flex: 0 0 155px;
}

.date-input-wrapper {
  position: relative;
}

.date-input-wrapper input {
  width: 100%;
  height: 48px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 0 36px 0 10px;
  background: #fff;
  outline: none;
  font-size: 12px;
  color: #111827;
  -webkit-text-fill-color: #111827;
}

.date-input-wrapper input:focus {
  border-color: #1e293b;
}

.calendar-button {
  position: absolute;
  right: 0;
  top: 0;
  width: 36px;
  height: 48px;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* BUTTONS */

.apply-report-button,
.clear-report-button {
  height: 48px;
  border-radius: 9px;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
}

.apply-report-button {
  border: none;
  background: #1e293b;
  color: #fff;
}

.apply-report-button:hover {
  background: #111827;
}

.clear-report-button {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
}

.clear-report-button:hover {
  background: #f8fafc;
}

/* LOADING */

.reports-loading {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #1e293b;
  border-radius: 50%;
  animation: reportSpin .8s linear infinite;
}

@keyframes reportSpin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media (max-width: 1200px) {
  .restaurant-search-container {
    min-width: 340px;
  }

  .date-field {
    width: 145px;
    min-width: 145px;
    flex-basis: 145px;
  }
}

@media (max-width: 1100px) {
  .reports-stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .restaurant-filter-row {
    flex-wrap: wrap;
  }

  .restaurant-search-container {
    width: 100%;
    flex-basis: 100%;
  }
}

@media (max-width: 700px) {
  .reports-page {
    padding: 15px;
    padding-bottom: 50px;
  }

  .reports-header {
    flex-direction: column;
  }

  .reports-stat-grid {
    grid-template-columns: 1fr;
  }

  .restaurant-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .restaurant-filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .restaurant-search-container,
  .date-field {
    width: 100%;
    min-width: 100%;
    flex-basis: auto;
  }

  .apply-report-button,
  .clear-report-button {
    width: 100%;
  }
}
`;

/* =========================================================
   RESTAURANT REPORT STYLES
========================================================= */

const restaurantReportStyles = `

* {
  box-sizing: border-box;
}

/* TOP */

.restaurant-report-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
}

.close-report-button {
  width: 38px;
  height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  background: #fff;
  color: #374151;
  font-size: 25px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-report-button:hover {
  background: #f1f5f9;
  border-color: #9ca3af;
  color: #111827;
}

/* TITLE */

.restaurant-report-title {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}

.restaurant-report-title span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .8px;
  margin-bottom: 5px;
}

.restaurant-report-title h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
}

/* FORM */

.restaurant-report-form {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 18px;
}

.form-section-title {
  padding-bottom: 15px;
  border-bottom: 1px solid #eef0f2;
  margin-bottom: 18px;
}

.form-section-title h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
}

.form-section-title p {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
}

.report-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.report-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-field label {
  color: #374151;
  font-size: 11px;
  font-weight: 600;
}

.report-field-value {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 11px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: #f9fafb;
  color: #111827;
  font-size: 13px;
  font-weight: 600;
}

/* ORDER CARD */

.restaurant-detail-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.detail-card-header {
  padding: 17px 19px;
  border-bottom: 1px solid #eef0f2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.detail-card-header h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
}

.detail-card-header p {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
}

.detail-count {
  background: #f1f5f9;
  color: #475569;
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 10px;
  font-weight: 700;
}

/* TABLE */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.professional-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
}

.professional-table th {
  background: #f8fafc;
  color: #64748b;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .35px;
  padding: 13px 15px;
  border-bottom: 1px solid #e5e7eb;
}

.professional-table td {
  padding: 13px 15px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 12px;
}

.professional-table tbody tr:hover {
  background: #fafafa;
}

.order-id {
  color: #334155;
  font-weight: 700;
  font-size: 11px;
  background: #f1f5f9;
  padding: 6px 8px;
  border-radius: 6px;
}

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
  background: #e2e8f0;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.customer-cell strong {
  display: block;
  color: #111827;
  font-size: 12px;
  margin-bottom: 2px;
}

.customer-cell span {
  display: block;
  color: #9ca3af;
  font-size: 10px;
}

.amount-cell {
  color: #111827;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.payment-paid {
  background: #dcfce7;
  color: #15803d;
}

.payment-pending {
  background: #ffedd5;
  color: #c2410c;
}

.payment-failed {
  background: #ffe4e6;
  color: #be123c;
}

.order-delivered {
  background: #dcfce7;
  color: #15803d;
}

.order-pending {
  background: #ffedd5;
  color: #c2410c;
}

.order-cancelled {
  background: #ffe4e6;
  color: #be123c;
}

.order-confirmed,
.order-preparing,
.order-ready,
.order-out-for-delivery {
  background: #dbeafe;
  color: #1d4ed8;
}

/* EMPTY */

.empty-table {
  padding: 45px 20px;
  text-align: center;
}

.empty-table div {
  font-size: 30px;
  margin-bottom: 8px;
}

.empty-table h3 {
  margin: 0 0 5px;
  color: #374151;
  font-size: 15px;
}

.empty-table p {
  margin: 0;
  color: #9ca3af;
  font-size: 11px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .report-form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .report-form-grid {
    grid-template-columns: 1fr;
  }

  .restaurant-report-title h1 {
    font-size: 21px;
  }

  .close-report-button {
    width: 36px;
    height: 36px;
  }
}
`;

export default Reports;