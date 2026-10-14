import { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      console.log("Login Response:", response.data);

      const token =
        response.data?.access_token ||
        response.data?.data?.access_token ||
        response.data?.token ||
        response.data?.data?.token;

      const user = response.data?.user;

      // Check token
      if (!token) {
        setError("Login failed. Token not received.");
        return;
      }

      // Check Admin role
      if (user?.role !== "ADMIN") {
        setError("Access denied. Admin login required.");

        localStorage.removeItem("token");
        localStorage.removeItem("adminUser");

        return;
      }

      // Save token
      localStorage.setItem("token", token);

      // Save admin information
      localStorage.setItem(
        "adminUser",
        JSON.stringify(user)
      );

      // Login successful
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message ||
        "Invalid email or password";

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.logo}>
          QuickServe
        </h1>

        <p style={styles.subtitle}>
          Admin Panel
        </p>

        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={styles.input}
          />

          {/* PASSWORD */}
          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={styles.input}
          />

          {/* ERROR */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },

  card: {
    width: "380px",
    padding: "35px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.12)",
  },

  logo: {
    textAlign: "center",
    margin: "0",
    fontSize: "32px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    background: "#fee2e2",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "15px",
  },
};

export default Login;