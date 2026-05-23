import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [messageType, setMessageType] = useState(
    location.state?.messageType || ""
  );
  const email = localStorage.getItem("verifyEmail");

  const verifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      await API.post("/api/customer/verify-otp", {
        email,
        otp,
      });

      localStorage.removeItem("verifyEmail");
      navigate("/customer-login", {
        state: {
          message: "Email verified successfully",
          messageType: "success",
        },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Verify OTP</h2>

        {message && (
          <div className={`auth-message ${messageType}`}>{message}</div>
        )}

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
