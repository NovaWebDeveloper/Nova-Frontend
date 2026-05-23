import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");
  const [messageType, setMessageType] = useState(
    location.state?.messageType || ""
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loginCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      const loginData = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const res = await API.post("/api/customer/login", loginData);

      localStorage.setItem("customerToken", res.data.token);
      localStorage.setItem("customerUser", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      console.log("Customer login error:", err.response?.data || err.message);

      setMessage(err.response?.data?.message || "Login failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Customer Login</h2>

        {message && (
          <div className={`auth-message ${messageType}`}>{message}</div>
        )}

        <form onSubmit={loginCustomer}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          New customer? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerLogin;
