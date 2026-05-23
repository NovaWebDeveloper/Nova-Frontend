import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import "./ChatWidget.css";

const PRESENCE_TTL = 7000;
const TYPING_TTL = 1800;

const readJson = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (err) {
        return fallback;
    }
};

const getSavedCustomerId = (customerUser) => {
    if (!customerUser?.email) return localStorage.getItem("customerId");

    const savedChats = readJson("novaCustomerChats", {});
    return savedChats[customerUser.email] || localStorage.getItem("customerId");
};

const saveCustomerChat = (customerEmail, customerId) => {
    if (!customerEmail || !customerId) return;

    const savedChats = readJson("novaCustomerChats", {});
    localStorage.setItem(
        "novaCustomerChats",
        JSON.stringify({ ...savedChats, [customerEmail]: customerId })
    );
};

function ChatWidget() {
    const customerToken = localStorage.getItem("customerToken");
    const customerUser = JSON.parse(localStorage.getItem("customerUser") || "null");
    const customerEmail = customerUser?.email;
    const messagesEndRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState(
        getSavedCustomerId(customerUser)
    );
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [firstMessage, setFirstMessage] = useState("");
    const [notice, setNotice] = useState("");
    const [adminTyping, setAdminTyping] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [adminSeenAt, setAdminSeenAt] = useState("");
    const [sendingText, setSendingText] = useState("");

    const fetchMessages = async (id) => {
        try {
            const res = await API.get(`/api/chat/${id}`);
            setMessages(res.data);
            localStorage.setItem(`novaSeenByCustomer:${id}`, String(Date.now()));
        } catch (err) {
            console.log("Fetch messages error:", err.response?.data || err.message);
        }
    };

    const updateCustomerTyping = (value) => {
        setNewMessage(value);

        if (customerId) {
            localStorage.setItem(
                `novaTyping:${customerId}:customer`,
                JSON.stringify({ typing: Boolean(value.trim()), at: Date.now() })
            );
        }
    };

    const startChat = async (e) => {
        e.preventDefault();
        setNotice("");

        try {
            if (!customerToken || !customerUser) {
                setNotice("Please login first to start chat");
                return;
            }

            if (!firstMessage.trim()) {
                setNotice("Please write a message");
                return;
            }

            const res = await API.post("/api/chat/start", {
                name: customerUser.name,
                email: customerUser.email,
                phone: "",
                message: firstMessage,
            });

            localStorage.setItem("customerId", res.data.customer.id);
            saveCustomerChat(customerEmail, res.data.customer.id);
            setCustomerId(res.data.customer.id);

            setFirstMessage("");
            fetchMessages(res.data.customer.id);
        } catch (err) {
            console.log("Start chat error:", err.response?.data || err.message);
            setNotice(err.response?.data?.error || err.response?.data?.message || "Chat start failed");
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        setNotice("");
        const messageText = newMessage.trim();

        try {
            if (!messageText) return;

            setSendingText(messageText);
            setNewMessage("");
            localStorage.setItem(
                `novaTyping:${customerId}:customer`,
                JSON.stringify({ typing: false, at: Date.now() })
            );

            await API.post("/api/chat/message", {
                customer_id: customerId,
                message: messageText,
            });

            fetchMessages(customerId);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "";
            setNewMessage(messageText);

            if (errorMsg.includes("foreign key")) {
                localStorage.removeItem("customerId");
                setCustomerId(null);
                setNotice("Old chat expired. Please start a new chat.");
                return;
            }

            console.log("Send message error:", err.response?.data || err.message);
            setNotice(errorMsg || "Message send failed");
        } finally {
            setSendingText("");
        }
    };

    useEffect(() => {
        if (customerId) {
            localStorage.setItem("customerId", customerId);
            saveCustomerChat(customerEmail, customerId);
            fetchMessages(customerId);

            const interval = setInterval(() => {
                fetchMessages(customerId);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [customerId, customerEmail]);

    useEffect(() => {
        if (!customerId) return undefined;

        const syncPresence = () => {
            localStorage.setItem(
                `novaPresence:${customerId}:customer`,
                JSON.stringify({ online: true, at: Date.now() })
            );

            const adminPresence = readJson(`novaPresence:${customerId}:admin`, {});
            const typing = readJson(`novaTyping:${customerId}:admin`, {});
            const now = Date.now();

            setAdminOnline(Boolean(adminPresence.online && now - adminPresence.at < PRESENCE_TTL));
            setAdminTyping(Boolean(typing.typing && now - typing.at < TYPING_TTL));
            setAdminSeenAt(localStorage.getItem(`novaSeenByAdmin:${customerId}`) || "");
        };

        syncPresence();
        const interval = setInterval(syncPresence, 900);

        return () => clearInterval(interval);
    }, [customerId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, adminTyping]);

    const getMessageStatus = (msg) => {
        if (msg.sender !== "customer") return "";
        if (adminSeenAt || adminOnline || adminTyping) return "Seen";
        return "Delivered";
    };

    return (
        <>
            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                💬
            </button>

            {open && (
                <div className="chat-widget">
                    <div className="chat-header">
                        <div>
                            <h3>NovaWeb Chat</h3>
                            {customerId && (
                                <span className={adminOnline ? "chat-status online" : "chat-status"}>
                                    {adminTyping ? "Typing..." : adminOnline ? "Admin online" : "Admin offline"}
                                </span>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)}>×</button>
                    </div>

                    {notice && <div className="chat-notice">{notice}</div>}

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
                                        <span>{msg.message}</span>
                                        {msg.sender === "customer" && (
                                            <small>{getMessageStatus(msg)}</small>
                                        )}
                                    </div>
                                ))}

                                {adminTyping && (
                                    <div className="bubble admin typing-bubble">
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                    </div>
                                )}

                                {sendingText && (
                                    <div className="bubble customer">
                                        <span>{sendingText}</span>
                                        <small>Sent</small>
                                    </div>
                                )}

                                <div ref={messagesEndRef}></div>
                            </div>

                            <form onSubmit={sendMessage} className="chat-input">
                                <input
                                    placeholder="Type message..."
                                    value={newMessage}
                                    onChange={(e) => updateCustomerTyping(e.target.value)}
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
