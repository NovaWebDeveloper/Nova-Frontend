import { Link } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import logo from "../assets/logo.png";
import "./Home.css";

function Home() {
  const customerUser = JSON.parse(
    localStorage.getItem("customerUser")
  );

  const logoutCustomer = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    localStorage.removeItem("customerId");

    window.location.href = "/";
  };

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-box">
          <img src={logo} alt="NovaWeb Logo" />
        </div>

        <div className="nav-links">
          <a href="/">Home</a>

          <a href="#services">Services</a>

          <a href="#chat">Chat</a>

          {customerUser ? (
            <>
              <span>Hi, {customerUser.name}</span>

              <button
                onClick={logoutCustomer}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>

              <Link to="/customer-login">Login</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">NovaWeb Developer</span>

          <h1>Build Your Dream Website</h1>

          <p>
            Modern, responsive and professional websites for businesses,
            creators and online brands.
          </p>

          <div className="hero-actions">
            <a href="#services" className="primary-action">View Services</a>
            <a href="#chat" className="secondary-action">Start Chat</a>
          </div>
        </div>

        <div className="hero-showcase" aria-hidden="true">
          <div className="showcase-top">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="showcase-screen">
            <div className="screen-sidebar"></div>
            <div className="screen-main">
              <div className="screen-line wide"></div>
              <div className="screen-line"></div>
              <div className="screen-grid">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="highlights" aria-label="Website highlights">
        <div>
          <strong>100%</strong>
          <span>Responsive Design</span>
        </div>
        <div>
          <strong>Fast</strong>
          <span>Modern React UI</span>
        </div>
        <div>
          <strong>Secure</strong>
          <span>Login and Admin Flow</span>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <h2>My Services</h2>
        <p className="section-lead">
          Choose a clean package or message me for a custom website plan.
        </p>

        <div className="service-grid">

          <div className="service-card">
            <h3>Basic Website</h3>

            <p>
              Portfolio or small business website with
              responsive design.
            </p>

            <h4>Rs. 8,000</h4>
          </div>

          <div className="service-card">
            <h3>Professional Website</h3>

            <p>
              Modern business website with animations
              and contact forms.
            </p>

            <h4>Rs. 1500</h4>
          </div>

          <div className="service-card">
            <h3>E-commerce Website</h3>

            <p>
              Full online store with products, cart
              and checkout system.
            </p>

            <h4>Rs. 3000+</h4>
          </div>

          <div className="service-card">
            <h3>Frontend Development</h3>

            <p>
              React.js frontend with premium responsive
              UI design.
            </p>

            <h4>Rs. 1000+</h4>
          </div>

          <div className="service-card">
            <h3>Backend Development</h3>

            <p>
              Authentication, APIs, admin dashboard
              and database integration.
            </p>

            <h4>Rs. 2000+</h4>
          </div>

          <div className="service-card">
            <h3>Full Stack Website</h3>

            <p>
              Complete frontend, backend and database
              development solution.
            </p>

            <h4>Rs. 4000+</h4>
          </div>

        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="chat-box">
        <div>
          <h2>Chat With Me</h2>

          {customerUser ? (
            <p className="chat-info">
              Click the chat button at bottom-right to start chatting with me.
            </p>
          ) : (
            <p className="chat-info">
              Please register or login first to chat with NovaWeb Developer.
            </p>
          )}
        </div>

        <a href={customerUser ? "#chat" : "/customer-login"} className="chat-cta">
          {customerUser ? "Open Chat Button" : "Login to Chat"}
        </a>
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default Home;
