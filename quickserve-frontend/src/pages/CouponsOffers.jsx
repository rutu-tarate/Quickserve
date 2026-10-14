import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function CouponsOffers({ onBack }) {
  const API_BASE_URL = "http://localhost:3000";

  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [couponToDelete, setCouponToDelete] =
    useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    inactive: 0,
  });

  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    restaurantId: "",
    usageLimit: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  // =====================================================
  // FETCH COUPONS
  // =====================================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/coupons`,
        {
          headers: getHeaders(),
        }
      );

      const data = response?.data;

      let couponData = [];

      if (Array.isArray(data)) {
        couponData = data;
      } else if (Array.isArray(data?.coupons)) {
        couponData = data.coupons;
      } else if (Array.isArray(data?.data)) {
        couponData = data.data;
      }

      setCoupons(couponData);
    } catch (err) {
      console.error("Error fetching coupons:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH STATS
  // =====================================================

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/coupons/stats`,
        {
          headers: getHeaders(),
        }
      );

      const data = response?.data || {};

      setStats({
        total: Number(data.total || 0),
        active: Number(data.active || 0),
        expired: Number(data.expired || 0),
        inactive: Number(data.inactive || 0),
      });
    } catch (err) {
      console.error("Error fetching coupon stats:", err);

      // Fallback calculation
      calculateLocalStats(coupons);
    }
  };

  // =====================================================
  // FETCH RESTAURANTS
  // =====================================================

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants`,
        {
          headers: getHeaders(),
        }
      );

      const data = response?.data;

      let restaurantData = [];

      if (Array.isArray(data)) {
        restaurantData = data;
      } else if (Array.isArray(data?.restaurants)) {
        restaurantData = data.restaurants;
      } else if (Array.isArray(data?.data)) {
        restaurantData = data.data;
      }

      setRestaurants(restaurantData);
    } catch (err) {
      console.error(
        "Error fetching restaurants:",
        err
      );

      setRestaurants([]);
    }
  };

  // =====================================================
  // LOCAL STATS
  // =====================================================

  const calculateLocalStats = (couponData) => {
    const now = new Date();

    const total = couponData.length;

    const active = couponData.filter((coupon) => {
      const from = new Date(coupon.validFrom);
      const until = new Date(coupon.validUntil);

      return (
        coupon.isActive === true &&
        from <= now &&
        until >= now
      );
    }).length;

    const expired = couponData.filter((coupon) => {
      const until = new Date(coupon.validUntil);

      return until < now;
    }).length;

    const inactive = couponData.filter(
      (coupon) => coupon.isActive === false
    ).length;

    setStats({
      total,
      active,
      expired,
      inactive,
    });
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCoupons();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (coupons.length > 0) {
      fetchStats();
    }
  }, [coupons]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getId = (coupon) => {
    return (
      coupon?._id ||
      coupon?.id ||
      "-"
    );
  };

  const getCode = (coupon) => {
    return coupon?.code || "-";
  };

  const getTitle = (coupon) => {
    return coupon?.title || "-";
  };

  const getDescription = (coupon) => {
    return (
      coupon?.description ||
      "No description available."
    );
  };

  const getDiscountType = (coupon) => {
    return coupon?.discountType || "PERCENTAGE";
  };

  const getDiscountValue = (coupon) => {
    const value = Number(
      coupon?.discountValue || 0
    );

    if (
      getDiscountType(coupon) ===
      "PERCENTAGE"
    ) {
      return `${value}%`;
    }

    return `₹${value}`;
  };

  const getRestaurantId = (coupon) => {
    const restaurant =
      coupon?.restaurantId ||
      coupon?.restaurant;

    if (
      restaurant &&
      typeof restaurant === "object"
    ) {
      return (
        restaurant?._id ||
        restaurant?.id ||
        ""
      );
    }

    return typeof restaurant === "string"
      ? restaurant
      : "";
  };

  const getRestaurantName = (coupon) => {
    const restaurant =
      coupon?.restaurantId ||
      coupon?.restaurant;

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

    const restaurantId =
      getRestaurantId(coupon);

    if (!restaurantId) {
      return "All Restaurants";
    }

    const found = restaurants.find(
      (item) =>
        String(
          item?._id || item?.id
        ) === String(restaurantId)
    );

    return (
      found?.name ||
      found?.restaurantName ||
      found?.hotelName ||
      "Restaurant"
    );
  };

  const getDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
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

  const getDateTimeLocal = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      parsed.getDate()
    ).padStart(2, "0");
    const hours = String(
      parsed.getHours()
    ).padStart(2, "0");
    const minutes = String(
      parsed.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =====================================================
  // COUPON STATUS
  // =====================================================

  const getCouponStatus = (coupon) => {
    const now = new Date();

    const from = coupon?.validFrom
      ? new Date(coupon.validFrom)
      : null;

    const until = coupon?.validUntil
      ? new Date(coupon.validUntil)
      : null;

    if (until && until < now) {
      return "EXPIRED";
    }

    if (coupon?.isActive === false) {
      return "INACTIVE";
    }

    if (
      from &&
      from > now
    ) {
      return "UPCOMING";
    }

    return "ACTIVE";
  };

  const formatStatus = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "EXPIRED":
        return "Expired";

      case "INACTIVE":
        return "Inactive";

      case "UPCOMING":
        return "Upcoming";

      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";

      case "EXPIRED":
        return "status-expired";

      case "INACTIVE":
        return "status-inactive";

      case "UPCOMING":
        return "status-upcoming";

      default:
        return "status-inactive";
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCoupons = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const status =
        getCouponStatus(coupon);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const searchableText = [
        getCode(coupon),
        getTitle(coupon),
        getDescription(coupon),
        getRestaurantName(coupon),
        getRestaurantId(coupon),
        getDiscountValue(coupon),
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
    });
  }, [
    coupons,
    search,
    statusFilter,
    restaurants,
  ]);

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingCoupon(null);

    setForm({
      code: "",
      title: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      restaurantId: "",
      usageLimit: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    });

    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon?.code || "",
      title: coupon?.title || "",
      description:
        coupon?.description || "",
      discountType:
        coupon?.discountType ||
        "PERCENTAGE",
      discountValue:
        coupon?.discountValue ?? "",
      minOrderAmount:
        coupon?.minOrderAmount ?? "",
      maxDiscountAmount:
        coupon?.maxDiscountAmount ?? "",
      restaurantId:
        getRestaurantId(coupon),
      usageLimit:
        coupon?.usageLimit ?? "",
      validFrom:
        getDateTimeLocal(
          coupon?.validFrom
        ),
      validUntil:
        getDateTimeLocal(
          coupon?.validUntil
        ),
      isActive:
        coupon?.isActive !== false,
    });

    setSelectedCoupon(null);
    setShowForm(true);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.code.trim()) {
        alert("Please enter coupon code.");
        return;
      }

      if (!form.title.trim()) {
        alert("Please enter coupon title.");
        return;
      }

      if (!form.discountValue) {
        alert(
          "Please enter discount value."
        );
        return;
      }

      if (!form.validFrom) {
        alert("Please select valid from date.");
        return;
      }

      if (!form.validUntil) {
        alert(
          "Please select valid until date."
        );
        return;
      }

      const validFrom = new Date(
        form.validFrom
      );

      const validUntil = new Date(
        form.validUntil
      );

      if (validUntil <= validFrom) {
        alert(
          "Valid until date must be after valid from date."
        );
        return;
      }

      if (
        form.discountType ===
          "PERCENTAGE" &&
        Number(form.discountValue) > 100
      ) {
        alert(
          "Percentage discount cannot be more than 100%."
        );
        return;
      }

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        title: form.title.trim(),

        description:
          form.description.trim(),

        discountType:
          form.discountType,

        discountValue:
          Number(form.discountValue),

        minOrderAmount:
          Number(form.minOrderAmount || 0),

        maxDiscountAmount:
          Number(
            form.maxDiscountAmount || 0
          ),

        restaurantId:
          form.restaurantId || "",

        usageLimit:
          Number(form.usageLimit || 0),

        validFrom:
          validFrom.toISOString(),

        validUntil:
          validUntil.toISOString(),

        isActive:
          form.isActive,
      };

      if (editingCoupon) {
        await axios.patch(
          `${API_BASE_URL}/coupons/${getId(
            editingCoupon
          )}`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        alert(
          "Coupon updated successfully."
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/coupons`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        alert(
          "Coupon created successfully."
        );
      }

      setShowForm(false);
      setEditingCoupon(null);

      await fetchCoupons();
      await fetchStats();
    } catch (err) {
      console.error(
        "Coupon save error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to save coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const openDeleteConfirm = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteConfirm(true);
  };

  const deleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      setSaving(true);

      await axios.delete(
        `${API_BASE_URL}/coupons/${getId(
          couponToDelete
        )}`,
        {
          headers: getHeaders(),
        }
      );

      alert(
        "Coupon deleted successfully."
      );

      setShowDeleteConfirm(false);
      setCouponToDelete(null);

      setSelectedCoupon(null);

      await fetchCoupons();
      await fetchStats();
    } catch (err) {
      console.error(
        "Delete coupon error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to delete coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const toggleStatus = async (coupon) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/coupons/${getId(
          coupon
        )}/toggle-status`,
        {},
        {
          headers: getHeaders(),
        }
      );

      await fetchCoupons();
      await fetchStats();

      if (
        selectedCoupon &&
        getId(selectedCoupon) ===
          getId(coupon)
      ) {
        setSelectedCoupon(null);
      }
    } catch (err) {
      console.error(
        "Toggle status error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to update coupon status."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="coupons-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .coupons-page {
          min-height: 100vh;
          background: #f6f8fb;
          padding: 28px 34px 45px;
          font-family: Inter, Arial, sans-serif;
          color: #0f2340;
        }

        .coupons-container {
          max-width: 1500px;
          margin: auto;
        }

        /* HEADER */

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
          margin-bottom: 10px;
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
          display: flex;
          gap: 10px;
          padding-top: 10px;
        }

        .back-button,
        .add-button {
          height: 44px;
          padding: 0 20px;
          border: none;
          border-radius: 9px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .back-button {
          background: #1d293b;
        }

        .add-button {
          background: #2165e8;
        }

        .back-button:hover {
          background: #152033;
        }

        .add-button:hover {
          background: #1757ce;
        }

        /* SUMMARY */

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
        }

        .summary-value {
          color: #071b35;
          font-size: 24px;
          font-weight: 500;
          line-height: 1;
        }

        /* FILTER */

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
          width: 190px;
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

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 12px;
          pointer-events: none;
          font-size: 18px;
          color: #4d5d71;
        }

        /* MAIN */

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

        /* COUPON */

        .coupon-code {
          color: #2162df;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .coupon-title {
          color: #25384f;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .coupon-description {
          color: #8491a2;
          font-size: 11px;
          max-width: 190px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

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

        .discount-value {
          color: #16834d;
          font-size: 14px;
          font-weight: 800;
        }

        .discount-type {
          margin-top: 3px;
          color: #8995a5;
          font-size: 10px;
        }

        .amount-text {
          color: #4c6077;
          font-size: 12px;
          white-space: nowrap;
        }

        .date-text {
          color: #63748a;
          font-size: 12px;
          white-space: nowrap;
        }

        /* STATUS */

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

        .status-active {
          background: #e7f8ef;
          color: #16834d;
        }

        .status-expired {
          background: #fdecec;
          color: #c23942;
        }

        .status-inactive {
          background: #eef1f4;
          color: #59697c;
        }

        .status-upcoming {
          background: #eaf2ff;
          color: #2864b9;
        }

        /* ACTIONS */

        .action-buttons {
          display: flex;
          gap: 7px;
          align-items: center;
        }

        .action-button {
          height: 33px;
          padding: 0 10px;
          border: 1px solid #dce3eb;
          border-radius: 7px;
          background: white;
          color: #29405b;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .action-button:hover {
          background: #f4f7fa;
        }

        .action-button.edit {
          color: #2162df;
        }

        .action-button.delete {
          color: #c23942;
        }

        /* STATES */

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

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(13,26,43,0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .modal {
          width: 100%;
          max-width: 720px;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0,0,0,0.2);
          margin: auto;
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

        /* DETAILS */

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .detail-item label,
        .form-group label {
          display: block;
          color: #8291a4;
          font-size: 10px;
          margin-bottom: 6px;
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

        .detail-section {
          margin-top: 20px;
          background: #f7f9fb;
          border: 1px solid #e7ebef;
          border-radius: 10px;
          padding: 14px;
        }

        .detail-section-title {
          color: #42566d;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        /* FORM */

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          border: 1px solid #d9e0e8;
          border-radius: 8px;
          outline: none;
          padding: 10px 12px;
          font-size: 13px;
          color: #263b54;
          background: white;
          font-family: inherit;
        }

        .form-group input,
        .form-group select {
          height: 42px;
        }

        .form-group textarea {
          min-height: 80px;
          resize: vertical;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #8fb2ee;
          box-shadow: 0 0 0 2px rgba(33,101,232,.08);
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .checkbox-row input {
          width: 17px;
          height: 17px;
        }

        .checkbox-row span {
          color: #40546b;
          font-size: 13px;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          padding-top: 17px;
          border-top: 1px solid #e8edf2;
        }

        .cancel-button,
        .save-button {
          height: 42px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-button {
          border: 1px solid #dce3eb;
          background: white;
          color: #455a72;
        }

        .save-button {
          border: none;
          background: #2165e8;
          color: white;
        }

        .save-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        /* CONFIRM */

        .confirm-modal {
          max-width: 430px;
        }

        .confirm-body {
          padding: 25px;
          text-align: center;
        }

        .confirm-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .confirm-title {
          color: #1b3049;
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .confirm-text {
          color: #718096;
          font-size: 13px;
          line-height: 1.5;
        }

        .confirm-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .delete-confirm {
          height: 40px;
          padding: 0 18px;
          border: none;
          border-radius: 8px;
          background: #d93d48;
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .coupons-page {
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

          .back-button,
          .add-button {
            flex: 1;
          }

          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .status-select-wrapper {
            width: 100%;
          }

          .form-grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }
        }

        @media (max-width: 550px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 23px;
          }

          .title-icon {
            font-size: 26px;
          }

          .header-actions {
            flex-direction: column;
          }
        }

      `}</style>

      <div className="coupons-container">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="top-header">

          <div>

            <div className="brand">
              QUICKSERVE ADMIN
            </div>

            <div className="title-row">

              <span className="title-icon">
                🎟️
              </span>

              <h1 className="page-title">
                Coupons & Offers
              </h1>

            </div>

            <p className="page-subtitle">
              Create and manage promotional
              coupons and offers
            </p>

          </div>

          <div className="header-actions">

            <button
              className="back-button"
              onClick={onBack}
            >
              ← Dashboard
            </button>

            <button
              className="add-button"
              onClick={openAddForm}
            >
              + Add Coupon
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <div className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">
              🎟️
            </div>

            <div>
              <div className="summary-label">
                Total Coupons
              </div>

              <div className="summary-value">
                {stats.total}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <div className="summary-label">
                Active
              </div>

              <div className="summary-value">
                {stats.active}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ⏰
            </div>

            <div>
              <div className="summary-label">
                Expired
              </div>

              <div className="summary-value">
                {stats.expired}
              </div>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ◼
            </div>

            <div>
              <div className="summary-label">
                Inactive
              </div>

              <div className="summary-value">
                {stats.inactive}
              </div>
            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div className="filter-card">

          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by Coupon Code, Title, Restaurant or Discount"
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
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="UPCOMING">
                Upcoming
              </option>

              <option value="EXPIRED">
                Expired
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

            <span className="select-arrow">
              ⌄
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="main-card">

          <div className="list-heading">

            <h2>
              Coupons List
            </h2>

            <p>
              {filteredCoupons.length} coupons found
            </p>

          </div>

          {loading ? (

            <div className="loading-state">
              Loading coupons...
            </div>

          ) : filteredCoupons.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🎟️
              </div>

              <div className="empty-title">
                No coupons found
              </div>

              <div className="empty-text">
                There are no coupons matching
                your search or filter.
              </div>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>#</th>

                    <th>
                      COUPON
                    </th>

                    <th>
                      RESTAURANT
                    </th>

                    <th>
                      DISCOUNT
                    </th>

                    <th>
                      MIN ORDER
                    </th>

                    <th>
                      USAGE
                    </th>

                    <th>
                      VALIDITY
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

                  {filteredCoupons.map(
                    (coupon, index) => {

                      const status =
                        getCouponStatus(
                          coupon
                        );

                      return (

                        <tr
                          key={
                            getId(coupon) ||
                            index
                          }
                        >

                          <td>
                            #{index + 1}
                          </td>

                          {/* COUPON */}

                          <td>

                            <div className="coupon-code">
                              {getCode(coupon)}
                            </div>

                            <div className="coupon-title">
                              {getTitle(coupon)}
                            </div>

                            <div className="coupon-description">
                              {getDescription(
                                coupon
                              )}
                            </div>

                          </td>

                          {/* RESTAURANT */}

                          <td>

                            <div className="restaurant-name">
                              {getRestaurantName(
                                coupon
                              )}
                            </div>

                            {getRestaurantId(
                              coupon
                            ) && (
                              <div className="restaurant-id">
                                ID:{" "}
                                {getRestaurantId(
                                  coupon
                                )}
                              </div>
                            )}

                          </td>

                          {/* DISCOUNT */}

                          <td>

                            <div className="discount-value">
                              {getDiscountValue(
                                coupon
                              )}
                            </div>

                            <div className="discount-type">
                              {
                                getDiscountType(
                                  coupon
                                ) ===
                                "PERCENTAGE"
                                  ? "Percentage"
                                  : "Flat Discount"
                              }
                            </div>

                          </td>

                          {/* MIN ORDER */}

                          <td>

                            <span className="amount-text">
                              ₹
                              {Number(
                                coupon?.minOrderAmount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </td>

                          {/* USAGE */}

                          <td>

                            <span className="amount-text">

                              {coupon?.usedCount || 0}

                              {" / "}

                              {coupon?.usageLimit > 0
                                ? coupon.usageLimit
                                : "Unlimited"}

                            </span>

                          </td>

                          {/* VALIDITY */}

                          <td>

                            <div className="date-text">
                              {getDate(
                                coupon?.validFrom
                              )}
                            </div>

                            <div
                              className="date-text"
                              style={{
                                marginTop: "3px",
                              }}
                            >
                              to{" "}
                              {getDate(
                                coupon?.validUntil
                              )}
                            </div>

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

                            <div className="action-buttons">

                              <button
                                className="action-button"
                                onClick={() =>
                                  setSelectedCoupon(
                                    coupon
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                className="action-button edit"
                                onClick={() =>
                                  openEditForm(
                                    coupon
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="action-button delete"
                                onClick={() =>
                                  openDeleteConfirm(
                                    coupon
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

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

      {/* ================================================= */}
      {/* VIEW DETAILS MODAL */}
      {/* ================================================= */}

      {selectedCoupon && (

        <div
          className="modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedCoupon(null);
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <h2 className="modal-title">
                Coupon Details
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedCoupon(null)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="detail-grid">

                <div className="detail-item">

                  <label>
                    Coupon Code
                  </label>

                  <p>
                    {getCode(
                      selectedCoupon
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Title
                  </label>

                  <p>
                    {getTitle(
                      selectedCoupon
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Restaurant
                  </label>

                  <p>
                    {getRestaurantName(
                      selectedCoupon
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Discount
                  </label>

                  <p>
                    {getDiscountValue(
                      selectedCoupon
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Minimum Order
                  </label>

                  <p>
                    ₹
                    {Number(
                      selectedCoupon?.minOrderAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Maximum Discount
                  </label>

                  <p>
                    {Number(
                      selectedCoupon?.maxDiscountAmount ||
                        0
                    ) > 0
                      ? `₹${Number(
                          selectedCoupon.maxDiscountAmount
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      : "No Limit"}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Usage
                  </label>

                  <p>
                    {selectedCoupon?.usedCount ||
                      0}
                    {" / "}
                    {selectedCoupon?.usageLimit >
                    0
                      ? selectedCoupon.usageLimit
                      : "Unlimited"}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Status
                  </label>

                  <p>
                    {formatStatus(
                      getCouponStatus(
                        selectedCoupon
                      )
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Valid From
                  </label>

                  <p>
                    {getDate(
                      selectedCoupon?.validFrom
                    )}
                  </p>

                </div>

                <div className="detail-item">

                  <label>
                    Valid Until
                  </label>

                  <p>
                    {getDate(
                      selectedCoupon?.validUntil
                    )}
                  </p>

                </div>

              </div>

              <div className="detail-section">

                <div className="detail-section-title">
                  Description
                </div>

                <div
                  style={{
                    color: "#46586d",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  {getDescription(
                    selectedCoupon
                  )}
                </div>

              </div>

              <div className="form-actions">

                <button
                  className="cancel-button"
                  onClick={() =>
                    setSelectedCoupon(null)
                  }
                >
                  Close
                </button>

                <button
                  className="cancel-button"
                  onClick={() =>
                    toggleStatus(
                      selectedCoupon
                    )
                  }
                >
                  {selectedCoupon?.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  className="save-button"
                  onClick={() =>
                    openEditForm(
                      selectedCoupon
                    )
                  }
                >
                  Edit Coupon
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================================= */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget &&
              !saving
            ) {
              setShowForm(false);
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <h2 className="modal-title">
                {editingCoupon
                  ? "Edit Coupon"
                  : "Add New Coupon"}
              </h2>

              <button
                className="close-button"
                disabled={saving}
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <form onSubmit={handleSubmit}>

                <div className="form-grid">

                  {/* CODE */}

                  <div className="form-group">

                    <label>
                      Coupon Code *
                    </label>

                    <input
                      type="text"
                      name="code"
                      placeholder="e.g. SAVE50"
                      value={form.code}
                      onChange={
                        handleFormChange
                      }
                      style={{
                        textTransform:
                          "uppercase",
                      }}
                    />

                  </div>

                  {/* TITLE */}

                  <div className="form-group">

                    <label>
                      Coupon Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Flat 50 Off"
                      value={form.title}
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div className="form-group full">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Enter coupon description..."
                      value={
                        form.description
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* DISCOUNT TYPE */}

                  <div className="form-group">

                    <label>
                      Discount Type *
                    </label>

                    <select
                      name="discountType"
                      value={
                        form.discountType
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="PERCENTAGE">
                        Percentage
                      </option>

                      <option value="FLAT">
                        Flat Discount
                      </option>

                    </select>

                  </div>

                  {/* DISCOUNT VALUE */}

                  <div className="form-group">

                    <label>
                      Discount Value *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="discountValue"
                      placeholder={
                        form.discountType ===
                        "PERCENTAGE"
                          ? "e.g. 20"
                          : "e.g. 50"
                      }
                      value={
                        form.discountValue
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* MIN ORDER */}

                  <div className="form-group">

                    <label>
                      Minimum Order Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="minOrderAmount"
                      placeholder="e.g. 300"
                      value={
                        form.minOrderAmount
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* MAX DISCOUNT */}

                  <div className="form-group">

                    <label>
                      Maximum Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="maxDiscountAmount"
                      placeholder="e.g. 150"
                      value={
                        form.maxDiscountAmount
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* RESTAURANT */}

                  <div className="form-group full">

                    <label>
                      Restaurant
                    </label>

                    <select
                      name="restaurantId"
                      value={
                        form.restaurantId
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="">
                        All Restaurants
                      </option>

                      {restaurants.map(
                        (restaurant) => {

                          const id =
                            restaurant?._id ||
                            restaurant?.id;

                          const name =
                            restaurant?.name ||
                            restaurant?.restaurantName ||
                            restaurant?.hotelName ||
                            "Restaurant";

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {name}
                            </option>
                          );
                        }
                      )}

                    </select>

                  </div>

                  {/* USAGE LIMIT */}

                  <div className="form-group">

                    <label>
                      Usage Limit
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="usageLimit"
                      placeholder="0 = Unlimited"
                      value={
                        form.usageLimit
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* VALID FROM */}

                  <div className="form-group">

                    <label>
                      Valid From *
                    </label>

                    <input
                      type="datetime-local"
                      name="validFrom"
                      value={
                        form.validFrom
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* VALID UNTIL */}

                  <div className="form-group">

                    <label>
                      Valid Until *
                    </label>

                    <input
                      type="datetime-local"
                      name="validUntil"
                      value={
                        form.validUntil
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                  {/* ACTIVE */}

                  <div className="form-group full">

                    <div className="checkbox-row">

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={
                          form.isActive
                        }
                        onChange={
                          handleFormChange
                        }
                      />

                      <span>
                        Coupon is active
                      </span>

                    </div>

                  </div>

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-button"
                    disabled={saving}
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* DELETE CONFIRM */}
      {/* ================================================= */}

      {showDeleteConfirm && (

        <div
          className="modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget &&
              !saving
            ) {
              setShowDeleteConfirm(false);
            }
          }}
        >

          <div className="modal confirm-modal">

            <div className="modal-header">

              <h2 className="modal-title">
                Delete Coupon
              </h2>

              <button
                className="close-button"
                disabled={saving}
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="confirm-body">

              <div className="confirm-icon">
                ⚠️
              </div>

              <div className="confirm-title">
                Delete this coupon?
              </div>

              <div className="confirm-text">

                Are you sure you want to delete{" "}
                <strong>
                  {getCode(
                    couponToDelete
                  )}
                </strong>
                ? This action cannot be undone.

              </div>

              <div className="confirm-actions">

                <button
                  className="cancel-button"
                  disabled={saving}
                  onClick={() =>
                    setShowDeleteConfirm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  className="delete-confirm"
                  disabled={saving}
                  onClick={deleteCoupon}
                >
                  {saving
                    ? "Deleting..."
                    : "Delete Coupon"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CouponsOffers;