import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      await API.post("/api/customer/register", form);

      localStorage.setItem("verifyEmail", form.email);

      navigate("/verify-otp", {
        state: {
          message: "OTP sent to your email",
          messageType: "success",
        },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Create Account</h2>

        {message && (
          <div className={`auth-message ${messageType}`}>{message}</div>
        )}

        <form onSubmit={registerUser}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

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

          <button type="submit">Register</button>
        </form>

        <p>
          Already verified? <Link to="/customer-login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
