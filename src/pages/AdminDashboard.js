import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminDashboard.css";

const PRESENCE_TTL = 7000;
const TYPING_TTL = 1800;

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (err) {
    return fallback;
  }
};

function AdminDashboard() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [customerTyping, setCustomerTyping] = useState(false);
  const [customerOnline, setCustomerOnline] = useState(false);
  const [sendingReply, setSendingReply] = useState("");
  const [customerSeenAt, setCustomerSeenAt] = useState("");

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
      localStorage.setItem(`novaSeenByAdmin:${customerId}`, String(Date.now()));
    } catch (err) {
      console.log("Failed to fetch messages", err);
    }
  };

  const handleReplyChange = (value) => {
    setReply(value);

    if (selectedCustomer) {
      localStorage.setItem(
        `novaTyping:${selectedCustomer}:admin`,
        JSON.stringify({ typing: Boolean(value.trim()), at: Date.now() })
      );
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();

    const replyText = reply.trim();
    if (!replyText || !selectedCustomer) return;
    setStatusMessage("");
    setSendingReply(replyText);
    setReply("");
    localStorage.setItem(
      `novaTyping:${selectedCustomer}:admin`,
      JSON.stringify({ typing: false, at: Date.now() })
    );

    try {
      await API.post("/api/admin/reply", {
        customer_id: selectedCustomer,
        message: replyText,
      });

      localStorage.setItem(
        `novaTyping:${selectedCustomer}:admin`,
        JSON.stringify({ typing: false, at: Date.now() })
      );
      fetchMessages(selectedCustomer);
    } catch (err) {
      console.log("Reply failed", err);
      setReply(replyText);
      setStatusMessage("Reply send nahi hua");
    } finally {
      setSendingReply("");
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
    if (!selectedCustomer) return undefined;

    const syncPresence = () => {
      localStorage.setItem(
        `novaPresence:${selectedCustomer}:admin`,
        JSON.stringify({ online: true, at: Date.now() })
      );

      const customerPresence = readJson(
        `novaPresence:${selectedCustomer}:customer`,
        {}
      );
      const typing = readJson(`novaTyping:${selectedCustomer}:customer`, {});
      const now = Date.now();

      setCustomerOnline(
        Boolean(customerPresence.online && now - customerPresence.at < PRESENCE_TTL)
      );
      setCustomerTyping(Boolean(typing.typing && now - typing.at < TYPING_TTL));
      setCustomerSeenAt(
        localStorage.getItem(`novaSeenByCustomer:${selectedCustomer}`) || ""
      );
    };

    syncPresence();
    const interval = setInterval(syncPresence, 900);

    return () => clearInterval(interval);
  }, [selectedCustomer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, customerTyping]);

  const selectedCustomerData = customers.find(
    (customer) => customer.id === selectedCustomer
  );

  const getMessageStatus = (msg) => {
    if (msg.sender !== "admin") return msg.sender;
    if (customerSeenAt || customerOnline || customerTyping) return "Seen";
    return "Delivered";
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-title">
          <h2>Customers</h2>
          <span>{customers.length}</span>
        </div>

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
              <div className="customer-row">
                <span className="customer-avatar">
                  {customer.name?.charAt(0)?.toUpperCase() || "C"}
                </span>
                <div>
                  <h4>{customer.name}</h4>
                  <p>{customer.email}</p>
                </div>
              </div>
              <small>{customer.phone || "Customer chat"}</small>
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
          <div className="empty-chat">
            <h3>Select a customer</h3>
            <p>Choose a customer from the left to view and reply to messages.</p>
          </div>
        ) : (
          <>
            <div className="active-chat-header">
              <div className="customer-row">
                <span className="customer-avatar large">
                  {selectedCustomerData?.name?.charAt(0)?.toUpperCase() || "C"}
                </span>
                <div>
                  <h3>{selectedCustomerData?.name || "Customer"}</h3>
                  <p className={customerOnline ? "presence online" : "presence"}>
                    {customerTyping
                      ? "Typing..."
                      : customerOnline
                        ? "Online"
                        : "Offline"}
                  </p>
                </div>
              </div>
            </div>

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
                  <small>{getMessageStatus(msg)}</small>
                </div>
              ))}

              {customerTyping && (
                <div className="msg customer-msg typing-msg">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              )}

              {sendingReply && (
                <div className="msg admin-msg">
                  <p>{sendingReply}</p>
                  <small>Sent</small>
                </div>
              )}

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
                onChange={(e) => handleReplyChange(e.target.value)}
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
