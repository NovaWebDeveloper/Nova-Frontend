import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function VerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const email = localStorage.getItem("verifyEmail");

  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/customer/verify-otp", {
        email,
        otp,
      });

      alert("Email verified successfully");
      localStorage.removeItem("verifyEmail");
      navigate("/customer-login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Verify OTP</h2>

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit">Verify OTP</button>
        </form>

        <p>
          Wrong email? <Link to="/register">Register again</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;