import { useEffect, useState } from "react";
import API from "../services/api";
import "./ChatWidget.css";

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState(
        localStorage.getItem("customerId")
    );
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [firstMessage, setFirstMessage] = useState("");

    const customerToken = localStorage.getItem("customerToken");
    const customerUser = JSON.parse(localStorage.getItem("customerUser") || "null");

    const fetchMessages = async (id) => {
        try {
            const res = await API.get(`/api/chat/${id}`);
            setMessages(res.data);
        } catch (err) {
            console.log("Fetch messages error:", err.response?.data || err.message);
        }
    };

    const startChat = async (e) => {
        e.preventDefault();

        try {
            if (!customerToken || !customerUser) {
                alert("Please login first to start chat");
                return;
            }

            if (!firstMessage.trim()) {
                alert("Please write a message");
                return;
            }

            const res = await API.post("/api/chat/start", {
                name: customerUser.name,
                email: customerUser.email,
                phone: "",
                message: firstMessage,
            });

            localStorage.setItem("customerId", res.data.customer.id);
            setCustomerId(res.data.customer.id);

            setFirstMessage("");
            fetchMessages(res.data.customer.id);
        } catch (err) {
            console.log("Start chat error:", err.response?.data || err.message);
            alert(err.response?.data?.error || err.response?.data?.message || "Chat start failed");
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        try {
            if (!newMessage.trim()) return;

            await API.post("/api/chat/message", {
                customer_id: customerId,
                message: newMessage,
            });

            setNewMessage("");
            fetchMessages(customerId);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "";

            if (errorMsg.includes("foreign key")) {
                localStorage.removeItem("customerId");
                setCustomerId(null);
                alert("Old chat expired. Please start a new chat.");
                return;
            }

            console.log("Send message error:", err.response?.data || err.message);
            alert(errorMsg || "Message send failed");
        }
    };

    useEffect(() => {
        if (customerId) {
            fetchMessages(customerId);

            const interval = setInterval(() => {
                fetchMessages(customerId);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [customerId]);

    return (
        <>
            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                💬
            </button>

            {open && (
                <div className="chat-widget">
                    <div className="chat-header">
                        <h3>NovaWeb Chat</h3>
                        <button onClick={() => setOpen(false)}>×</button>
                    </div>

                    {!customerToken || !customerUser ? (
                        <div className="chat-login-warning">
                            <p>Please login to chat with NovaWeb Developer.</p>
                            <a href="/customer-login">Login</a>
                            <a href="/register">Register</a>
                        </div>
                    ) : !customerId ? (
                        <form onSubmit={startChat} className="chat-form">
                            <p className="welcome-user">Welcome, {customerUser.name}</p>

                            <textarea
                                placeholder="Write your first message..."
                                value={firstMessage}
                                onChange={(e) => setFirstMessage(e.target.value)}
                                required
                            />

                            <button type="submit">Start Chat</button>
                        </form>
                    ) : (
                        <>
                            <div className="chat-messages">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={
                                            msg.sender === "customer"
                                                ? "bubble customer"
                                                : "bubble admin"
                                        }
                                    >
                                        {msg.message}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={sendMessage} className="chat-input">
                                <input
                                    placeholder="Type message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />

                                <button type="submit">Send</button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

export default ChatWidget;