import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/api/admin/customers");
      setCustomers(res.data);
    } catch (err) {
      console.log("Failed to fetch customers", err);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      setSelectedCustomer(customerId);
      const res = await API.get(`/api/admin/chat/${customerId}`);
      setMessages(res.data);
    } catch (err) {
      console.log("Failed to fetch messages", err);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();

    if (!reply.trim() || !selectedCustomer) return;
    setStatusMessage("");

    try {
      await API.post("/api/admin/reply", {
        customer_id: selectedCustomer,
        message: reply,
      });

      setReply("");
      fetchMessages(selectedCustomer);
    } catch (err) {
      console.log("Reply failed", err);
      setStatusMessage("Reply send nahi hua");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  useEffect(() => {
    fetchCustomers();

    const interval = setInterval(() => {
      fetchCustomers();

      if (selectedCustomer) {
        fetchMessages(selectedCustomer);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCustomer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>Customers</h2>

        {customers.length === 0 ? (
          <p className="empty">No customers yet</p>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className={
                selectedCustomer === customer.id
                  ? "customer-card active-customer"
                  : "customer-card"
              }
              onClick={() => fetchMessages(customer.id)}
            >
              <h4>{customer.name}</h4>
              <p>{customer.email}</p>
              <small>{customer.phone}</small>
            </div>
          ))
        )}
      </aside>

      <main className="chat-area">
        <div className="dashboard-header">
          <h2>NovaWeb Admin Chat</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {!selectedCustomer ? (
          <p className="empty">Select a customer to view messages</p>
        ) : (
          <>
            <div className="messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.sender === "admin"
                      ? "msg admin-msg"
                      : "msg customer-msg"
                  }
                >
                  <p>{msg.message}</p>
                  <small>{msg.sender}</small>
                </div>
              ))}

              <div ref={messagesEndRef}></div>
            </div>

            <form onSubmit={sendReply} className="reply-box">
              {statusMessage && (
                <div className="dashboard-message error">{statusMessage}</div>
              )}

              <input
                type="text"
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />

              <button type="submit">Send</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
