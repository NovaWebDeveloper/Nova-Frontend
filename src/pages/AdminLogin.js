import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/api/admin/login", form);

      localStorage.setItem("adminToken", res.data.token);

      navigate("/admin-dashboard");
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleLogin} className="login-box">
        <h2>Admin Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p className="hint">admin@novaweb.com / 123456</p>
      </form>
    </div>
  );
}

export default AdminLogin;