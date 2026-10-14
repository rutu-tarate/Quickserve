import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Complaints({ onBack }) {
  const API_BASE_URL = "http://localhost:3000";

  const restaurantId = "6a71fe0226437232631636ba";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [updating, setUpdating] = useState(false);

  // Restaurant names mapped by restaurant ID
  const [restaurantNames, setRestaurantNames] =
    useState({});

  // --------------------------------------------------
  // FETCH COMPLAINTS
  // --------------------------------------------------

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/complaints/restaurant/${restaurantId}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = response.data;

      let complaintData = [];

      if (Array.isArray(data)) {
        complaintData = data;
      } else if (Array.isArray(data?.complaints)) {
        complaintData = data.complaints;
      } else if (Array.isArray(data?.data)) {
        complaintData = data.data;
      }

      setComplaints(complaintData);

      // Fetch restaurant names
      await fetchRestaurantNames(complaintData);
    } catch (err) {
      console.error(
        "Error fetching complaints:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH RESTAURANT NAMES
  // --------------------------------------------------

  const fetchRestaurantNames = async (
    complaintData
  ) => {
    try {
      const ids = [
        ...new Set(
          complaintData
            .map((item) => getRestaurantId(item))
            .filter(
              (id) =>
                id &&
                id !== "-" &&
                typeof id === "string"
            )
        ),
      ];

      if (ids.length === 0) {
        return;
      }

      const token = localStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const nameMap = {};

      // Try to fetch each restaurant
      await Promise.all(
        ids.map(async (id) => {
          try {
            /*
             * Main endpoint:
             * GET /restaurants/:id
             */
            let response;

            try {
              response = await axios.get(
                `${API_BASE_URL}/restaurants/${id}`,
                {
                  headers,
                }
              );
            } catch (firstError) {
              /*
               * Fallback endpoint:
               * GET /restaurant/:id
               */
              response = await axios.get(
                `${API_BASE_URL}/restaurant/${id}`,
                {
                  headers,
                }
              );
            }

            const data = response?.data;

            const restaurant =
              data?.restaurant ||
              data?.data ||
              data;

            const name =
              restaurant?.name ||
              restaurant?.restaurantName ||
              restaurant?.hotelName ||
              restaurant?.title;

            if (name) {
              nameMap[id] = name;
            }
          } catch (err) {
            console.error(
              `Failed to fetch restaurant ${id}:`,
              err
            );
          }
        })
      );

      setRestaurantNames(nameMap);
    } catch (err) {
      console.error(
        "Restaurant name fetch error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getId = (complaint) => {
    return (
      complaint?._id ||
      complaint?.id ||
      complaint?.complaintId ||
      "-"
    );
  };

  // --------------------------------------------------
  // RESTAURANT ID
  // --------------------------------------------------

  const getRestaurantId = (complaint) => {
    const restaurant =
      complaint?.restaurantId ||
      complaint?.restaurant;

    if (
      restaurant &&
      typeof restaurant === "object"
    ) {
      return (
        restaurant?._id ||
        restaurant?.id ||
        "-"
      );
    }

    if (typeof restaurant === "string") {
      return restaurant;
    }

    // Sometimes restaurant ID can be inside order
    if (
      typeof complaint?.orderId
        ?.restaurantId === "string"
    ) {
      return complaint.orderId.restaurantId;
    }

    if (
      complaint?.orderId?.restaurantId &&
      typeof complaint?.orderId?.restaurantId ===
        "object"
    ) {
      return (
        complaint.orderId.restaurantId?._id ||
        complaint.orderId.restaurantId?.id ||
        "-"
      );
    }

    return "-";
  };

  // --------------------------------------------------
  // RESTAURANT NAME
  // --------------------------------------------------

  const getRestaurantName = (complaint) => {
    // If backend already sends restaurant object
    if (
      complaint?.restaurantId &&
      typeof complaint.restaurantId === "object"
    ) {
      return (
        complaint.restaurantId?.name ||
        complaint.restaurantId?.restaurantName ||
        complaint.restaurantId?.hotelName ||
        "-"
      );
    }

    if (
      complaint?.restaurant &&
      typeof complaint.restaurant === "object"
    ) {
      return (
        complaint.restaurant?.name ||
        complaint.restaurant?.restaurantName ||
        complaint.restaurant?.hotelName ||
        "-"
      );
    }

    // If restaurantName directly exists
    if (
      typeof complaint?.restaurantName ===
      "string"
    ) {
      return complaint.restaurantName;
    }

    // Get name from fetched restaurant map
    const id = getRestaurantId(complaint);

    if (
      id &&
      restaurantNames[id]
    ) {
      return restaurantNames[id];
    }

    return "Restaurant";
  };

  // --------------------------------------------------
  // ORDER ID
  // --------------------------------------------------

  const getOrderId = (complaint) => {
    if (
      typeof complaint?.orderId === "string"
    ) {
      return complaint.orderId;
    }

    if (
      complaint?.orderId &&
      typeof complaint.orderId === "object"
    ) {
      return (
        complaint.orderId?._id ||
        complaint.orderId?.id ||
        "-"
      );
    }

    return (
      complaint?.order?.orderId ||
      complaint?.order?._id ||
      "-"
    );
  };

  // --------------------------------------------------
  // CUSTOMER NAME
  // --------------------------------------------------

  const getCustomerName = (complaint) => {
    const customer =
      complaint?.customerId ||
      complaint?.customer ||
      complaint?.user;

    if (
      typeof complaint?.customerName ===
      "string"
    ) {
      return complaint.customerName;
    }

    if (
      typeof complaint?.customerId?.name ===
      "string"
    ) {
      return complaint.customerId.name;
    }

    if (
      typeof complaint?.customer?.name ===
      "string"
    ) {
      return complaint.customer.name;
    }

    if (
      typeof complaint?.customer?.fullName ===
      "string"
    ) {
      return complaint.customer.fullName;
    }

    if (
      typeof complaint?.user?.name === "string"
    ) {
      return complaint.user.name;
    }

    if (
      typeof complaint?.user?.fullName ===
      "string"
    ) {
      return complaint.user.fullName;
    }

    if (typeof customer === "string") {
      return customer;
    }

    if (
      customer &&
      typeof customer === "object"
    ) {
      return (
        customer?.name ||
        customer?.fullName ||
        customer?.email ||
        customer?._id ||
        "Customer"
      );
    }

    return "Customer";
  };

  // --------------------------------------------------
  // CUSTOMER EMAIL
  // --------------------------------------------------

  const getCustomerEmail = (complaint) => {
    if (
      typeof complaint?.customerId?.email ===
      "string"
    ) {
      return complaint.customerId.email;
    }

    if (
      typeof complaint?.customer?.email ===
      "string"
    ) {
      return complaint.customer.email;
    }

    if (
      typeof complaint?.user?.email === "string"
    ) {
      return complaint.user.email;
    }

    return complaint?.customerEmail || "-";
  };

  // --------------------------------------------------
  // SUBJECT
  // --------------------------------------------------

  const getSubject = (complaint) => {
    return (
      complaint?.subject ||
      complaint?.title ||
      complaint?.complaint ||
      "Complaint"
    );
  };

  // --------------------------------------------------
  // DESCRIPTION
  // --------------------------------------------------

  const getDescription = (complaint) => {
    return (
      complaint?.description ||
      complaint?.message ||
      complaint?.details ||
      "No description available."
    );
  };

  // --------------------------------------------------
  // CATEGORY
  // --------------------------------------------------

  const getCategory = (complaint) => {
    return (
      complaint?.category ||
      complaint?.type ||
      "General"
    );
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatus = (complaint) => {
    return String(
      complaint?.status || "PENDING"
    )
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
  };

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const getDate = (complaint) => {
    const date =
      complaint?.createdAt ||
      complaint?.date ||
      complaint?.createdDate;

    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const pendingCount = complaints.filter(
    (item) =>
      getStatus(item) === "PENDING"
  ).length;

  const inProgressCount = complaints.filter(
    (item) =>
      getStatus(item) === "IN_PROGRESS"
  ).length;

  const resolvedCount = complaints.filter(
    (item) =>
      getStatus(item) === "RESOLVED"
  ).length;

  const rejectedCount = complaints.filter(
    (item) =>
      getStatus(item) === "REJECTED"
  ).length;

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredComplaints = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return complaints.filter(
      (complaint) => {
        const status =
          getStatus(complaint);

        const matchesStatus =
          statusFilter === "ALL" ||
          status === statusFilter;

        const searchableText = [
          getId(complaint),
          getOrderId(complaint),
          getCustomerName(complaint),
          getCustomerEmail(complaint),
          getRestaurantName(complaint),
          getRestaurantId(complaint),
          getSubject(complaint),
          getDescription(complaint),
          getCategory(complaint),
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchValue ||
          searchableText.includes(
            searchValue
          );

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }, [
    complaints,
    search,
    statusFilter,
    restaurantNames,
  ]);

  // --------------------------------------------------
  // UPDATE STATUS
  // --------------------------------------------------

  const updateStatus = async (
    complaint,
    newStatus
  ) => {
    try {
      setUpdating(true);

      const complaintId =
        getId(complaint);

      if (
        !complaintId ||
        complaintId === "-"
      ) {
        alert(
          "Complaint ID not found."
        );
        return;
      }

      const token =
        localStorage.getItem("token");

      await axios.patch(
        `${API_BASE_URL}/complaints/${complaintId}/status`,
        {
          status: newStatus,
        },
        {
          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {},
        }
      );

      setComplaints((previous) =>
        previous.map((item) =>
          getId(item) ===
          complaintId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setSelectedComplaint(
        (previous) =>
          previous
            ? {
                ...previous,
                status: newStatus,
              }
            : previous
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to update complaint status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------------------------
  // STATUS CLASS
  // --------------------------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case "RESOLVED":
        return "status-resolved";

      case "IN_PROGRESS":
        return "status-progress";

      case "REJECTED":
        return "status-rejected";

      default:
        return "status-pending";
    }
  };

  // --------------------------------------------------
  // FORMAT STATUS
  // --------------------------------------------------

  const formatStatus = (status) => {
    if (
      status === "IN_PROGRESS"
    ) {
      return "In Progress";
    }

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="complaints-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .complaints-page {
          min-height: 100vh;
          background: #f6f8fb;
          padding: 28px 34px 45px;
          font-family: Inter, Arial, sans-serif;
          color: #0f2340;
        }

        .complaints-container {
          max-width: 1450px;
          margin: auto;
        }

        /* ================= HEADER ================= */

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .brand {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #2463e8;
          margin: 0 0 10px 0;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .title-icon {
          font-size: 30px;
          line-height: 1;
        }

        .page-title {
          margin: 0;
          font-size: 28px;
          font-weight: 650;
          letter-spacing: -0.5px;
          color: #0d1f38;
        }

        .page-subtitle {
          margin: 6px 0 0 7px;
          color: #62738c;
          font-size: 14px;
        }

        .header-actions {
          padding-top: 10px;
        }

        .back-button {
          height: 44px;
          padding: 0 20px;
          border: none;
          border-radius: 9px;
          background: #1d293b;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(24,37,56,0.14);
        }

        .back-button:hover {
          background: #152033;
        }

        /* ================= SUMMARY ================= */

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card {
          min-height: 96px;
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 13px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: #f1f3f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .summary-label {
          color: #62738c;
          font-size: 13px;
          margin-bottom: 5px;
          white-space: nowrap;
        }

        .summary-value {
          color: #071b35;
          font-size: 24px;
          font-weight: 500;
          line-height: 1;
        }

        /* ================= SEARCH ================= */

        .filter-card {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-box input {
          width: 100%;
          height: 48px;
          border: none;
          outline: none;
          border-radius: 10px;
          background: #292d33;
          color: white;
          padding: 0 18px 0 47px;
          font-size: 14px;
          font-family: inherit;
        }

        .search-box input::placeholder {
          color: #cdd4dc;
        }

        .search-icon {
          position: absolute;
          left: 17px;
          top: 12px;
          font-size: 21px;
          z-index: 2;
        }

        .status-select-wrapper {
          width: 205px;
          position: relative;
          flex-shrink: 0;
        }

        .status-select {
          width: 100%;
          height: 48px;
          border: 1px solid #d9e0e8;
          border-radius: 10px;
          background: white;
          color: #34465c;
          padding: 0 35px 0 16px;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          appearance: none;
        }

        .status-select:focus {
          border-color: #9dbbf5;
        }

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 12px;
          pointer-events: none;
          font-size: 18px;
          color: #4d5d71;
        }

        /* ================= MAIN CARD ================= */

        .main-card {
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 14px;
          overflow: hidden;
        }

        .list-heading {
          text-align: center;
          padding: 18px 20px 19px;
          border-bottom: 1px solid #e2e7ed;
        }

        .list-heading h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #081d38;
        }

        .list-heading p {
          margin: 7px 0 0;
          font-size: 13px;
          color: #70819a;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1250px;
          border-collapse: collapse;
        }

        th {
          background: #fbfcfd;
          color: #687589;
          text-align: left;
          padding: 14px 16px;
          font-size: 11px;
          font-weight: 800;
          border-bottom: 1px solid #e5e9ee;
          white-space: nowrap;
        }

        td {
          padding: 15px 16px;
          border-bottom: 1px solid #edf0f3;
          font-size: 13px;
          color: #34465c;
          vertical-align: middle;
        }

        tbody tr:hover td {
          background: #fbfcfe;
        }

        .complaint-id {
          color: #2162df;
          font-size: 13px;
          font-weight: 700;
        }

        .order-id {
          color: #465a72;
          font-size: 12px;
          font-weight: 600;
        }

        /* ================= RESTAURANT ================= */

        .restaurant-name {
          color: #182f4b;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .restaurant-id {
          margin-top: 3px;
          color: #8995a5;
          font-size: 10px;
          max-width: 175px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .customer-name {
          color: #25384f;
          font-size: 13px;
          font-weight: 700;
        }

        .customer-email {
          margin-top: 3px;
          color: #8491a2;
          font-size: 11px;
        }

        .category {
          color: #596c84;
          font-size: 12px;
          font-weight: 600;
        }

        .subject {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #293c54;
          font-size: 13px;
          font-weight: 600;
        }

        .date-text {
          color: #63748a;
          font-size: 12px;
          white-space: nowrap;
        }

        /* ================= STATUS ================= */

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 11px;
          border-radius: 18px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-pending {
          background: #fff4dc;
          color: #9b6b00;
        }

        .status-progress {
          background: #eaf2ff;
          color: #2864b9;
        }

        .status-resolved {
          background: #e7f8ef;
          color: #16834d;
        }

        .status-rejected {
          background: #fdecec;
          color: #c23942;
        }

        /* ================= VIEW BUTTON ================= */

        .view-button {
          height: 34px;
          padding: 0 12px;
          border: 1px solid #dce3eb;
          border-radius: 7px;
          background: white;
          color: #29405b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .view-button:hover {
          background: #f4f7fa;
        }

        /* ================= STATES ================= */

        .loading-state {
          padding: 60px;
          text-align: center;
          color: #687b91;
          font-size: 14px;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #78889b;
        }

        .empty-icon {
          font-size: 38px;
          margin-bottom: 10px;
        }

        .empty-title {
          color: #33475f;
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .empty-text {
          font-size: 13px;
        }

        .error-box {
          background: #fff0f0;
          border: 1px solid #f1c9c9;
          color: #a83d3d;
          padding: 12px 16px;
          border-radius: 9px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        /* ================= MODAL ================= */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(13,26,43,0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 650px;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0,0,0,0.2);
        }

        .modal-header {
          padding: 18px 21px;
          border-bottom: 1px solid #e7ebf0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 19px;
          color: #152a45;
        }

        .close-button {
          border: none;
          background: transparent;
          font-size: 25px;
          color: #718096;
          cursor: pointer;
        }

        .modal-body {
          padding: 21px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }

        .detail-item label {
          display: block;
          color: #8291a4;
          font-size: 10px;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-weight: 800;
        }

        .detail-item p {
          margin: 0;
          color: #293d56;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
        }

        .restaurant-detail {
          color: #1e5fd5 !important;
          font-weight: 800 !important;
        }

        .description-box {
          background: #f7f9fb;
          border: 1px solid #e7ebef;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 18px;
        }

        .description-box label {
          display: block;
          color: #8291a4;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .description-box p {
          margin: 0;
          color: #46586d;
          font-size: 13px;
          line-height: 1.5;
        }

        .status-section {
          border-top: 1px solid #e8edf2;
          padding-top: 16px;
        }

        .status-section label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #42566d;
          margin-bottom: 9px;
        }

        .status-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-action {
          border: 1px solid #dce3eb;
          background: white;
          padding: 8px 13px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: #344a62;
        }

        .status-action.active {
          border-color: #1f63dd;
          background: #1f63dd;
          color: white;
        }

        .status-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 1200px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .status-select-wrapper {
            width: 100%;
          }
        }

        @media (max-width: 650px) {
          .complaints-page {
            padding: 22px 15px 35px;
          }

          .top-header {
            flex-direction: column;
            gap: 15px;
          }

          .header-actions {
            padding-top: 0;
            width: 100%;
          }

          .back-button {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 23px;
          }

          .title-icon {
            font-size: 26px;
          }
        }

      `}</style>

      <div className="complaints-container">

        {/* ================= HEADER ================= */}

        <div className="top-header">

          <div>

            <div className="brand">
              QUICKSERVE ADMIN
            </div>

            <div className="title-row">

              <span className="title-icon">
                📋
              </span>

              <h1 className="page-title">
                Complaints Management
              </h1>

            </div>

            <p className="page-subtitle">
              Manage and monitor all customer complaints
            </p>

          </div>

          <div className="header-actions">

            <button
              className="back-button"
              onClick={onBack}
            >
              ← Dashboard
            </button>

          </div>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* ================= SUMMARY ================= */}

        <div className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">
              📋
            </div>

            <div>
              <div className="summary-label">
                Total Complaints
              </div>

              <div className="summary-value">
                {complaints.length}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ⏳
            </div>

            <div>
              <div className="summary-label">
                Pending
              </div>

              <div className="summary-value">
                {pendingCount}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ↻
            </div>

            <div>
              <div className="summary-label">
                In Progress
              </div>

              <div className="summary-value">
                {inProgressCount}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <div className="summary-label">
                Resolved
              </div>

              <div className="summary-value">
                {resolvedCount}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              !
            </div>

            <div>
              <div className="summary-label">
                Rejected
              </div>

              <div className="summary-value">
                {rejectedCount}
              </div>
            </div>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="filter-card">

          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by Complaint ID, Customer, Restaurant, Order ID or Category"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="status-select-wrapper">

            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending ({pendingCount})
              </option>

              <option value="IN_PROGRESS">
                In Progress ({inProgressCount})
              </option>

              <option value="RESOLVED">
                Resolved ({resolvedCount})
              </option>

              <option value="REJECTED">
                Rejected ({rejectedCount})
              </option>

            </select>

            <span className="select-arrow">
              ⌄
            </span>

          </div>

        </div>

        {/* ================= LIST ================= */}

        <div className="main-card">

          <div className="list-heading">

            <h2>
              Complaints List
            </h2>

            <p>
              {filteredComplaints.length} complaints found
            </p>

          </div>

          {loading ? (

            <div className="loading-state">
              Loading complaints...
            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <div className="empty-title">
                No complaints found
              </div>

              <div className="empty-text">
                There are no complaints matching your search or filter.
              </div>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>#</th>

                    <th>
                      COMPLAINT ID
                    </th>

                    <th>
                      RESTAURANT
                    </th>

                    <th>
                      ORDER ID
                    </th>

                    <th>
                      CUSTOMER
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      COMPLAINT
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredComplaints.map(
                    (complaint, index) => {

                      const status =
                        getStatus(complaint);

                      return (

                        <tr
                          key={
                            getId(complaint) ||
                            index
                          }
                        >

                          <td>
                            #{index + 1}
                          </td>

                          <td>

                            <span className="complaint-id">
                              {getId(complaint)}
                            </span>

                          </td>

                          {/* RESTAURANT */}

                          <td>

                            <div className="restaurant-name">
                              {getRestaurantName(
                                complaint
                              )}
                            </div>

                            <div className="restaurant-id">
                              ID:{" "}
                              {getRestaurantId(
                                complaint
                              )}
                            </div>

                          </td>

                          {/* ORDER */}

                          <td>

                            <span className="order-id">
                              {getOrderId(
                                complaint
                              )}
                            </span>

                          </td>

                          {/* CUSTOMER */}

                          <td>

                            <div className="customer-name">
                              {getCustomerName(
                                complaint
                              )}
                            </div>

                            <div className="customer-email">
                              {getCustomerEmail(
                                complaint
                              )}
                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td>

                            <span className="category">
                              {getCategory(
                                complaint
                              )}
                            </span>

                          </td>

                          {/* COMPLAINT */}

                          <td>

                            <div className="subject">
                              {getSubject(
                                complaint
                              )}
                            </div>

                          </td>

                          {/* DATE */}

                          <td>

                            <span className="date-text">
                              {getDate(
                                complaint
                              )}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`status ${getStatusClass(
                                status
                              )}`}
                            >
                              {formatStatus(
                                status
                              )}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <button
                              className="view-button"
                              onClick={() =>
                                setSelectedComplaint(
                                  complaint
                                )
                              }
                            >
                              View Details
                            </button>

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

      </div>

      {/* ================= MODAL ================= */}

      {selectedComplaint && (

        <div
          className="modal-overlay"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedComplaint(
                null
              );
            }

          }}
        >

          <div className="modal">

            <div className="modal-header">

              <h2 className="modal-title">
                Complaint Details
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="detail-grid">

                {/* COMPLAINT ID */}

                <div className="detail-item">

                  <label>
                    Complaint ID
                  </label>

                  <p>
                    {getId(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* RESTAURANT */}

                <div className="detail-item">

                  <label>
                    Restaurant
                  </label>

                  <p className="restaurant-detail">
                    {getRestaurantName(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* ORDER ID */}

                <div className="detail-item">

                  <label>
                    Order ID
                  </label>

                  <p>
                    {getOrderId(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* CUSTOMER */}

                <div className="detail-item">

                  <label>
                    Customer
                  </label>

                  <p>
                    {getCustomerName(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* CUSTOMER EMAIL */}

                <div className="detail-item">

                  <label>
                    Customer Email
                  </label>

                  <p>
                    {getCustomerEmail(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* CATEGORY */}

                <div className="detail-item">

                  <label>
                    Category
                  </label>

                  <p>
                    {getCategory(
                      selectedComplaint
                    )}
                  </p>

                </div>

                {/* DATE */}

                <div className="detail-item">

                  <label>
                    Date
                  </label>

                  <p>
                    {getDate(
                      selectedComplaint
                    )}
                  </p>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="description-box">

                <label>
                  Complaint
                </label>

                <p>

                  <strong>
                    {getSubject(
                      selectedComplaint
                    )}
                  </strong>

                </p>

                <p
                  style={{
                    marginTop: "7px",
                  }}
                >
                  {getDescription(
                    selectedComplaint
                  )}
                </p>

              </div>

              {/* STATUS */}

              <div className="status-section">

                <label>
                  Update Complaint Status
                </label>

                <div className="status-actions">

                  <button
                    className={`status-action ${
                      getStatus(
                        selectedComplaint
                      ) === "PENDING"
                        ? "active"
                        : ""
                    }`}
                    disabled={updating}
                    onClick={() =>
                      updateStatus(
                        selectedComplaint,
                        "PENDING"
                      )
                    }
                  >
                    Pending
                  </button>

                  <button
                    className={`status-action ${
                      getStatus(
                        selectedComplaint
                      ) === "IN_PROGRESS"
                        ? "active"
                        : ""
                    }`}
                    disabled={updating}
                    onClick={() =>
                      updateStatus(
                        selectedComplaint,
                        "IN_PROGRESS"
                      )
                    }
                  >
                    In Progress
                  </button>

                  <button
                    className={`status-action ${
                      getStatus(
                        selectedComplaint
                      ) === "RESOLVED"
                        ? "active"
                        : ""
                    }`}
                    disabled={updating}
                    onClick={() =>
                      updateStatus(
                        selectedComplaint,
                        "RESOLVED"
                      )
                    }
                  >
                    Resolved
                  </button>

                  <button
                    className={`status-action ${
                      getStatus(
                        selectedComplaint
                      ) === "REJECTED"
                        ? "active"
                        : ""
                    }`}
                    disabled={updating}
                    onClick={() =>
                      updateStatus(
                        selectedComplaint,
                        "REJECTED"
                      )
                    }
                  >
                    Rejected
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Complaints;