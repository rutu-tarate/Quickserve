import { useEffect, useState } from "react";
import axios from "axios";

function DeliveryPartners({ onBack }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  // =========================================
  // ADD DELIVERY PARTNER MODAL
  // =========================================

  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================
  // STATIC VALUES
  // =========================================

  const totalPartners = 3;
  const activePartners = 2;
  const blockedPartners = 1;

  // =========================================
  // FETCH DELIVERY PARTNERS
  // =========================================

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
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

      const data =
        response.data?.data ||
        response.data?.users ||
        response.data;

      if (Array.isArray(data)) {
        const deliveryUsers = data.filter(
          (user) => user.role === "DELIVERY"
        );

        setPartners(deliveryUsers);
      } else {
        setPartners([]);
        setError("Invalid delivery partner data.");
      }
    } catch (err) {
      console.error(
        "Delivery Partners Error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Admin access required.");
      } else {
        setError("Unable to load delivery partners.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setFormError("");
  };

  // =========================================
  // ADD DELIVERY PARTNER
  // =========================================

  const handleAddPartner = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter name.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Please enter email.");
      return;
    }

    if (!form.mobile.trim()) {
      setFormError("Please enter mobile number.");
      return;
    }

    if (form.mobile.length !== 10) {
      setFormError("Mobile number must contain 10 digits.");
      return;
    }

    if (!form.password) {
      setFormError("Please enter password.");
      return;
    }

    if (form.password.length < 6) {
      setFormError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setAdding(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/users/delivery-partner",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Delivery Partner added successfully!");

      setForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
      });

      setShowAddModal(false);

      await fetchDeliveryPartners();
    } catch (err) {
      console.error(
        "Add Delivery Partner Error:",
        err.response?.data || err.message
      );

      const message = err.response?.data?.message;

      if (Array.isArray(message)) {
        setFormError(message.join(", "));
      } else {
        setFormError(
          message || "Unable to add delivery partner."
        );
      }
    } finally {
      setAdding(false);
    }
  };

  // =========================================
  // GET STATUS
  // =========================================

  const getStatus = (partner) => {
    if (typeof partner.status === "boolean") {
      return partner.status;
    }

    if (typeof partner.isActive === "boolean") {
      return partner.isActive;
    }

    return true;
  };

  // =========================================
  // BLOCK / UNBLOCK
  // =========================================

  const handleStatusChange = async (partner) => {
    try {
      setUpdatingId(partner._id);

      const token = localStorage.getItem("token");

      const currentStatus = getStatus(partner);
      const newStatus = !currentStatus;

      await axios.patch(
        `http://localhost:3000/admin/users/${partner._id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPartners((previous) =>
        previous.map((item) =>
          item._id === partner._id
            ? {
                ...item,
                status: newStatus,
                isActive: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Status Update Error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          "Unable to update status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================
  // SEARCH + STATUS FILTER
  // =========================================

  const filteredPartners = partners.filter((partner) => {
    const text = search.toLowerCase().trim();

    const matchesSearch =
      !text ||
      partner.name?.toLowerCase().includes(text) ||
      partner.email?.toLowerCase().includes(text) ||
      partner.mobile?.toString().includes(text);

    const isActive = getStatus(partner);

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? isActive
        : !isActive;

    return matchesSearch && matchesStatus;
  });

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loader}></div>
        <p>Loading delivery partners...</p>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <p style={styles.smallTitle}>
            QUICKSERVE ADMIN
          </p>

          <h1 style={styles.title}>
            🛵 Delivery Partners
          </h1>

          <p style={styles.subtitle}>
            Manage delivery partners and availability
          </p>
        </div>

        <div style={styles.headerButtons}>

          <button
            onClick={fetchDeliveryPartners}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setFormError("");
            }}
            style={styles.addButton}
          >
            + Add Delivery Partner
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

          <span>⚠️ {error}</span>

          <button
            onClick={() => setError("")}
            style={styles.closeError}
          >
            ×
          </button>

        </div>
      )}

      {/* STATIC STATS */}

      <div style={styles.stats}>

        <div style={styles.card}>

          <div
            style={{
              ...styles.cardIcon,
              background: "#eff6ff",
            }}
          >
            🛵
          </div>

          <div>
            <p style={styles.cardLabel}>
              Total Partners
            </p>

            <h2 style={styles.cardNumber}>
              3
            </h2>
          </div>

        </div>

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
              2
            </h2>
          </div>

        </div>

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
              1
            </h2>
          </div>

        </div>

      </div>

      {/* SEARCH + FILTER */}

      <div style={styles.searchSection}>

        {/* DARK SEARCH BAR */}

        <div style={styles.searchBox}>

          <span style={styles.searchIcon}>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by delivery partner, email or mobile..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="quickserve-search-input"
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

        {/* FILTER BUTTONS */}

        <div style={styles.filterButtons}>

          <button
            onClick={() =>
              setStatusFilter("ALL")
            }
            style={{
              ...styles.filterButton,
              ...(statusFilter === "ALL"
                ? styles.selectedFilter
                : {}),
            }}
          >
            All ({totalPartners})
          </button>

          <button
            onClick={() =>
              setStatusFilter("ACTIVE")
            }
            style={{
              ...styles.filterButton,
              ...(statusFilter === "ACTIVE"
                ? styles.selectedFilter
                : {}),
            }}
          >
            <span style={styles.greenDot}></span>
            Active ({activePartners})
          </button>

          <button
            onClick={() =>
              setStatusFilter("BLOCKED")
            }
            style={{
              ...styles.filterButton,
              ...(statusFilter === "BLOCKED"
                ? styles.selectedFilter
                : {}),
            }}
          >
            <span style={styles.redDot}></span>
            Blocked ({blockedPartners})
          </button>

        </div>

      </div>

      {/* LIST HEADER */}

      <div style={styles.listHeader}>

        <h2 style={styles.tableTitle}>
          Delivery Partners List
        </h2>

        <p style={styles.tableSubtitle}>
          Showing{" "}
          <strong>
            {filteredPartners.length}
          </strong>{" "}
          of {partners.length} partners
        </p>

      </div>

      {/* TABLE */}

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>
            <tr>

              <th style={styles.th}>
                #
              </th>

              <th style={styles.th}>
                DELIVERY PARTNER
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

            {filteredPartners.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  style={styles.empty}
                >

                  <div style={styles.emptyIcon}>
                    🛵
                  </div>

                  <h3 style={styles.emptyTitle}>
                    No delivery partners found
                  </h3>

                  <p style={styles.emptyText}>
                    Add a delivery partner or
                    change your search/filter.
                  </p>

                </td>

              </tr>

            ) : (

              filteredPartners.map(
                (partner, index) => {

                  const isActive =
                    getStatus(partner);

                  return (
                    <tr
                      key={partner._id}
                      style={styles.tableRow}
                    >

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <span style={styles.number}>
                          #{index + 1}
                        </span>
                      </td>

                      <td style={styles.td}>

                        <div style={styles.user}>

                          <div style={styles.avatar}>
                            {partner.name
                              ?.charAt(0)
                              ?.toUpperCase() || "D"}
                          </div>

                          <div>

                            <div style={styles.name}>
                              {partner.name || "N/A"}
                            </div>

                            <div style={styles.id}>
                              ID:{" "}
                              {partner._id?.slice(-6)}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td style={styles.td}>

                        <div style={styles.email}>
                          📧 {partner.email || "N/A"}
                        </div>

                        <div style={styles.phone}>
                          📞 {partner.mobile || "N/A"}
                        </div>

                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <span style={styles.role}>
                          Delivery
                        </span>
                      </td>

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
                          />

                          {isActive
                            ? "Active"
                            : "Blocked"}

                        </span>

                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >

                        <button
                          disabled={
                            updatingId ===
                            partner._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              partner
                            )
                          }
                          style={{
                            ...styles.actionButton,

                            background: isActive
                              ? "#fff1f2"
                              : "#ecfdf5",

                            color: isActive
                              ? "#e11d48"
                              : "#15803d",

                            opacity:
                              updatingId ===
                              partner._id
                                ? 0.6
                                : 1,
                          }}
                        >

                          {updatingId ===
                          partner._id
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

      {/* ADD DELIVERY PARTNER MODAL */}

      {showAddModal && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <p style={styles.modalSmallTitle}>
                  QUICKSERVE ADMIN
                </p>

                <h2 style={styles.modalTitle}>
                  Add Delivery Partner
                </h2>

                <p style={styles.modalSubtitle}>
                  Create a new delivery partner account
                </p>

              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormError("");
                }}
                style={styles.modalClose}
              >
                ×
              </button>

            </div>

            {formError && (

              <div style={styles.formError}>
                ⚠️ {formError}
              </div>

            )}

            <form onSubmit={handleAddPartner}>

              {/* NAME */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  className="quickserve-form-input"
                  style={styles.formInput}
                />

              </div>

              {/* EMAIL */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  className="quickserve-form-input"
                  style={styles.formInput}
                />

              </div>

              {/* MOBILE */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Mobile Number
                </label>

                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter 10 digit mobile number"
                  value={form.mobile}
                  maxLength={10}
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setForm({
                      ...form,
                      mobile: value,
                    });

                    setFormError("");

                  }}
                  className="quickserve-form-input"
                  style={styles.formInput}
                />

              </div>

              {/* PASSWORD */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  className="quickserve-form-input"
                  style={styles.formInput}
                />

              </div>

              {/* BUTTONS */}

              <div style={styles.modalButtons}>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError("");
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    ...styles.saveButton,
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  {adding
                    ? "Adding..."
                    : "+ Add Partner"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================================
          INPUT CSS
      ========================================= */}

      <style>
  {`

    input.quickserve-form-input {
      background-color: #3a3a3a !important;

      color: #ffffff !important;

      -webkit-text-fill-color: #ffffff !important;

      caret-color: #ffffff !important;

      border: 1px solid #555555 !important;
    }

    input.quickserve-form-input::placeholder {
      color: #d1d5db !important;

      -webkit-text-fill-color: #d1d5db !important;

      opacity: 1 !important;
    }

    input.quickserve-form-input:focus {
      background-color: #3a3a3a !important;

      color: #ffffff !important;

      -webkit-text-fill-color: #ffffff !important;

      border-color: #666666 !important;

      outline: none !important;

      box-shadow: 0 0 0 2px rgba(100, 100, 100, 0.15) !important;
    }

    input.quickserve-form-input:focus::placeholder {
      color: #d1d5db !important;

      -webkit-text-fill-color: #d1d5db !important;

      opacity: 1 !important;
    }

    input.quickserve-form-input:-webkit-autofill,
    input.quickserve-form-input:-webkit-autofill:hover,
    input.quickserve-form-input:-webkit-autofill:focus {
      -webkit-text-fill-color: #ffffff !important;

      -webkit-box-shadow:
        0 0 0px 1000px #3a3a3a inset !important;

      box-shadow:
        0 0 0px 1000px #3a3a3a inset !important;

      caret-color: #ffffff !important;
    }

    input.quickserve-search-input {
      background-color: #3a3a3a !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff !important;
      border: 1px solid #555555 !important;
    }

    input.quickserve-search-input::placeholder {
      color: #d6d6d6 !important;
      -webkit-text-fill-color: #d6d6d6 !important;
      opacity: 1 !important;
    }

    input.quickserve-search-input:focus {
      background-color: #3a3a3a !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border-color: #666666 !important;
      outline: none !important;
    }

  `}
</style>

    </div>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = {

  container: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "38px",
    boxSizing: "border-box",
  },

  // =========================================
  // HEADER
  // =========================================

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
    flexWrap: "wrap",
  },

  smallTitle: {
    margin: 0,
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#2563eb",
  },

  title: {
    margin: "5px 0 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  refreshButton: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    padding: "11px 17px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  addButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow:
      "0 5px 15px rgba(37,99,235,0.18)",
  },

  backButton: {
    border: "none",
    background: "#1e293b",
    color: "#fff",
    padding: "11px 17px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  // =========================================
  // ERROR
  // =========================================

  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 15px",
    borderRadius: "9px",
    marginBottom: "20px",
    fontSize: "13px",
  },

  closeError: {
    border: "none",
    background: "transparent",
    color: "#b91c1c",
    fontSize: "20px",
    cursor: "pointer",
  },

  // =========================================
  // STATS
  // =========================================

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 3px 15px rgba(15,23,42,0.04)",
  },

  cardIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "11px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "700",
  },

  cardLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },

  cardNumber: {
    margin: "4px 0 0",
    fontSize: "26px",
    fontWeight: "600",
    color: "#0f172a",
  },

  // =========================================
  // SEARCH SECTION
  // =========================================

  searchSection: {
    background: "#ffffff",
    border: "1px solid #e8edf3",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 3px 15px rgba(15,23,42,0.04)",
  },

  searchBox: {
    position: "relative",
    flex: 1,
    minWidth: 0,
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "19px",
    zIndex: 2,
    pointerEvents: "none",
  },

  // =========================================
  // SEARCH INPUT - DARK
  // =========================================

  input: {
  width: "100%",
  height: "42px",
  boxSizing: "border-box",
  padding: "0 42px",
  border: "1px solid #555555",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  fontWeight: "400",
  background: "#3a3a3a",
  color: "#ffffff",
  caretColor: "#ffffff",
  WebkitTextFillColor: "#ffffff",
},

  clear: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    fontSize: "21px",
    color: "#d1d5db",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================================
  // FILTER BUTTONS
  // =========================================

  filterButtons: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },

  filterButton: {
    height: "42px",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },

  selectedFilter: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
  },

  greenDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    border: "1px solid #15803d",
  },

  redDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#ef4444",
    display: "inline-block",
    border: "1px solid #b91c1c",
  },

  // =========================================
  // LIST HEADER
  // =========================================

  listHeader: {
    textAlign: "center",
    marginBottom: "18px",
  },

  tableTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },

  tableSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  // =========================================
  // TABLE
  // =========================================

  tableContainer: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: "12px",
    overflowX: "auto",
    boxShadow:
      "0 3px 15px rgba(15,23,42,0.04)",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  th: {
    padding: "14px 15px",
    textAlign: "center",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#334155",
  },

  tableRow: {
    background: "#fff",
  },

  number: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px",
  },

  name: {
    fontWeight: "600",
    color: "#111827",
    fontSize: "14px",
  },

  id: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  email: {
    color: "#475569",
    marginBottom: "5px",
  },

  phone: {
    color: "#64748b",
    fontSize: "12px",
  },

  role: {
    display: "inline-block",
    padding: "6px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    background: "#fff7ed",
    color: "#c2410c",
  },

  active: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 11px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "600",
  },

  blocked: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 11px",
    borderRadius: "20px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "11px",
    fontWeight: "600",
  },

  activeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  blockedDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#ef4444",
  },

  actionButton: {
    border: "none",
    borderRadius: "7px",
    padding: "7px 13px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // =========================================
  // EMPTY
  // =========================================

  empty: {
    textAlign: "center",
    padding: "60px 20px",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    color: "#334155",
    fontSize: "17px",
  },

  emptyText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
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
    color: "#64748b",
  },

  loader: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    marginBottom: "12px",
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
    maxWidth: "500px",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "26px",
    boxSizing: "border-box",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
  },

  modalSmallTitle: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.3px",
    color: "#2563eb",
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  modalClose: {
    border: "none",
    background: "#f1f5f9",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    fontSize: "21px",
    color: "#475569",
    cursor: "pointer",
  },

  formError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "11px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "17px",
  },

  // =========================================
  // FORM
  // =========================================

  formGroup: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },

  formInput: {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #555555",
  borderRadius: "8px",
  outline: "none",
  fontSize: "13px",
  background: "#3a3a3a",
  color: "#ffffff",
  caretColor: "#ffffff",
  WebkitTextFillColor: "#ffffff",
},

  // =========================================
  // MODAL BUTTONS
  // =========================================

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  cancelButton: {
    border: "1px solid #dbe2ea",
    background: "#fff",
    color: "#475569",
    padding: "10px 17px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  saveButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};

export default DeliveryPartners;