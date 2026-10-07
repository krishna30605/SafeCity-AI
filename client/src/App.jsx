import { useEffect, useRef, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* =========================================================
   LEAFLET ICON FIX
   ========================================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* =========================================================
   APP
   ========================================================= */
  /* =========================================================
   LOGIN PAGE
   IMPORTANT:
   This component MUST be outside App()
   so inputs do not lose focus while typing.
   ========================================================= */

function LoginPage({
  loginMode,
  setLoginMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loginError,
  setLoginError,
  goTo,
}) {
  const isSignup = loginMode === "signup";

  const handleLogin = (e) => {
    e.preventDefault();

    setLoginError("");

    if (!email.trim()) {
      setLoginError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setLoginError("Please enter your password.");
      return;
    }

    if (isSignup && !name.trim()) {
      setLoginError("Please enter your name.");
      return;
    }

    const savedName = name.trim() || "Krishna";

    setName(savedName);

    goTo("home");
  };

  return (
    <div className="login-page">

      {/* TOP HEADER */}

      <div className="login-top">

        <button
          type="button"
          className="login-back"
          onClick={() => goTo("welcome")}
        >
          ←
        </button>

        <div className="login-brand">

          <div className="login-logo">
            🛡️
          </div>

          <div>
            <h2>SafeCity AI</h2>

            <p>
              Your intelligent city safety assistant
            </p>
          </div>

        </div>
      </div>

      {/* LOGIN CARD */}

      <div className="login-card">

        <div className="login-icon">
          🔐
        </div>

        <h1>
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <p className="login-subtitle">
          {isSignup
            ? "Create your SafeCity AI account"
            : "Login to continue your safety journey"}
        </p>

        <form onSubmit={handleLogin}>

          {/* NAME */}

          {isSignup && (
            <div className="login-field">

              <label>
                Full Name
              </label>

              <div className="input-box">

                <span>👤</span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />

              </div>
            </div>
          )}

          {/* EMAIL */}

          <div className="login-field">

            <label>
              Email Address
            </label>

            <div className="input-box">

              <span>✉️</span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>
          </div>

          {/* PASSWORD */}

          <div className="login-field">

            <div className="password-label">

              <label>
                Password
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  alert(
                    "Password recovery will be connected later."
                  )
                }
              >
                Forgot?
              </button>

            </div>

            <div className="input-box">

              <span>🔒</span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete={
                  isSignup
                    ? "new-password"
                    : "current-password"
                }
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>
          </div>

          {/* TERMS */}

          {isSignup && (
            <label className="terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the SafeCity AI
                terms and privacy policy.
              </span>

            </label>
          )}

          {/* ERROR */}

          {loginError && (
            <div className="login-error">
              ⚠️ {loginError}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-submit"
          >
            {isSignup
              ? "Create Account"
              : "Login"}
          </button>

        </form>

        {/* DIVIDER */}

        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* GOOGLE */}

        <button
          type="button"
          className="google-button"
          onClick={() =>
            alert(
              "Google login will be connected later."
            )
          }
        >
          <span>G</span>
          Continue with Google
        </button>

        {/* SWITCH */}

        <div className="switch-login">

          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setLoginError("");

              setLoginMode(
                isSignup
                  ? "login"
                  : "signup"
              );
            }}
          >
            {isSignup
              ? "Login"
              : "Sign Up"}
          </button>

        </div>

      </div>

      {/* SECURITY */}

      <div className="login-security">

        <span>🛡️</span>

        <div>

          <strong>
            Your safety comes first
          </strong>

          <p>
            SafeCity AI is designed to
            provide helpful safety information.
          </p>

        </div>

      </div>

    </div>
  );
}
  
     function ChatbotPage({
  messages,
  message,
  setMessage,
  sending,
  messagesRef,
  sendMessage,
  handleChatKey,
  goTo,
}) {
  return (
    <section className="chat-page">

      <div className="chat-header">
        <button onClick={() => goTo("home")}>
          ←
        </button>

        <div>
          <h2>AI Safety Chatbot</h2>
          <small>● Online</small>
        </div>

        <span>⋮</span>
      </div>

      <div
        className="messages"
        ref={messagesRef}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === "user"
                ? "message user-message"
                : "message ai-message"
            }
          >
            {msg.sender === "ai" && (
              <div className="chat-avatar">
                🤖
              </div>
            )}

            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="message ai-message">
            <div className="chat-avatar">
              🤖
            </div>

            <div className="message-bubble typing">
              Thinking... 🤔
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">

        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={handleChatKey}
          placeholder="Type your message..."
          disabled={sending}
        />

        <button
          onClick={sendMessage}
          disabled={sending || !message.trim()}
        >
          ➤
        </button>

      </div>

    </section>
  );
}
function App() {
  /* ---------------------------------------------------------
     MAIN STATE
     --------------------------------------------------------- */

  const [screen, setScreen] = useState("welcome");
  const [loginMode, setLoginMode] = useState("login");

  const [name, setName] = useState("Krishna");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [location, setLocation] = useState(null);

  /* ---------------------------------------------------------
     CHAT STATE
     --------------------------------------------------------- */

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hi Krishna! 👋 I'm your AI Safety Assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesRef = useRef(null);
useEffect(() => {
  window.scrollTo(0, 0);
}, [screen]);
  /* ---------------------------------------------------------
     SCROLL PAGE TO TOP
     --------------------------------------------------------- */

  
  /* ---------------------------------------------------------
     CHAT AUTO SCROLL
     
     IMPORTANT:
     We only scroll AFTER a complete message is added.
     We do NOT scroll while the user is typing.
     --------------------------------------------------------- */

  useEffect(() => {
    if (!messagesRef.current) return;

    const container = messagesRef.current;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages]);

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const goTo = (newScreen) => {
    setScreen(newScreen);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  /* =========================================================
     WELCOME PAGE
     ========================================================= */

  const WelcomePage = () => {
    return (
      <div className="welcome-page">
        <div className="welcome-background"></div>

        <div className="welcome-content">
          <div className="welcome-shield">🛡️</div>

          <h1>SafeCity AI</h1>

          <p>Your Safety. Our Priority.</p>

          <div className="welcome-illustration">
            👩🏻‍💻
          </div>

          <button
            className="welcome-start-button"
            onClick={() => {
              setLoginMode("login");
              setLoginError("");
              goTo("login");
            }}
          >
            Get Started
          </button>

          <button
            className="welcome-login-button"
            onClick={() => {
              setLoginMode("login");
              setLoginError("");
              goTo("login");
            }}
          >
            Login / Sign Up
          </button>

          <div className="welcome-footer">
            🔒 Your safety and privacy matter
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================
     LOGIN PAGE
     ========================================================= */

  

  /* =========================================================
     HOME PAGE
     ========================================================= */

  const HomePage = () => {
    return (
      <>
        <section className="welcome">
          <h1>
            Hello, {name || "Krishna"} 👋
          </h1>

          <p>Stay aware, stay safe.</p>
        </section>

        {/* AI CHATBOT CARD */}

        <section className="ai-card">
          <div className="robot">🤖</div>

          <div className="ai-text">
            <h2>AI Safety Chatbot</h2>

            <p>Your 24x7 Safety Assistant</p>

            <button onClick={() => goTo("chatbot")}>
              Chat Now
            </button>
          </div>
        </section>

        {/* FEATURES */}

        <section className="features">
          <button
            className="feature-card"
            onClick={() => goTo("sos")}
          >
            <div className="feature-icon">
              SOS
            </div>

            <h3>Emergency</h3>
            <p>SOS 112</p>
          </button>

          <button
            className="feature-card"
            onClick={() => goTo("contacts")}
          >
            <div className="feature-icon blue">
              👥
            </div>

            <h3>Emergency</h3>
            <p>Contacts</p>
          </button>

          <button
            className="feature-card"
            onClick={() => goTo("route")}
          >
            <div className="feature-icon green">
              🛣️
            </div>

            <h3>Safe Route</h3>
            <p>Finder</p>
          </button>

          <button
            className="feature-card"
            onClick={() => goTo("map")}
          >
            <div className="feature-icon orange">
              🛡️
            </div>

            <h3>Crime Alert</h3>
            <p>Map</p>
          </button>
        </section>

        {/* LOCATION */}

        <button
          className="location-card"
          onClick={getLocation}
        >
          <div>
            <h3>📍 Use My Location</h3>

            <p>
              {location
                ? "Location detected successfully"
                : "Find nearby safety information"}
            </p>
          </div>

          <span className="location-icon">
            ◎
          </span>
        </button>

        {/* STATISTICS */}

        <h2 className="section-title">
          Safety at a Glance
        </h2>

        <section className="stats">
          <button
            className="stat-card"
            onClick={() => goTo("alerts")}
          >
            <h4>Crime Alerts</h4>

            <strong className="red-number">
              12
            </strong>

            <p>In Your Area</p>
          </button>

          <button
            className="stat-card"
            onClick={() => goTo("map")}
          >
            <h4>Safe Zones</h4>

            <strong className="green-number">
              8
            </strong>

            <p>Nearby</p>
          </button>

          <button
            className="stat-card"
            onClick={() => goTo("alerts")}
          >
            <h4>Warnings</h4>

            <strong className="orange-number">
              5
            </strong>

            <p>Active</p>
          </button>
        </section>
      </>
    );
  };

  /* =========================================================
     LOCATION
     ========================================================= */

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        alert("📍 Your location has been detected!");
      },
      () => {
        alert(
          "Unable to get your location. Please allow location permission."
        );
      }
    );
  };

  /* =========================================================
     SOS PAGE
     ========================================================= */

  const SOSPage = () => {
    const callEmergency = () => {
      const confirmed = window.confirm(
        "🚨 Call emergency services at 112?"
      );

      if (confirmed) {
        window.location.href = "tel:112";
      }
    };

    return (
      <section className="page-card sos-page">
        <button
          className="back-button"
          onClick={() => goTo("home")}
        >
          ← Back
        </button>

        <h1>Emergency SOS</h1>

        <p className="page-subtitle">
          Get emergency help quickly
        </p>

        <div className="sos-circle">
          <button onClick={callEmergency}>
            <span>SOS</span>
            <strong>112</strong>
          </button>
        </div>

        <p className="tap-text">
          Tap to call emergency services
        </p>

        <div className="emergency-info">
          <h3>🚨 Emergency Number</h3>
          <p>112 — Emergency Services</p>
        </div>

        <button
          className="cancel-button"
          onClick={() => goTo("home")}
        >
          Cancel SOS
        </button>
      </section>
    );
  };

  /* =========================================================
     CONTACTS PAGE
     ========================================================= */

  const ContactsPage = () => {
    const contacts = [
      {
        name: "Mom",
        number: "+91 98765 43210",
        icon: "👩",
      },
      {
        name: "Dad",
        number: "+91 9819273042",
        icon: "👨",
      },
      {
        name: "Best Friend",
        number: "+91 99876 54321",
        icon: "👩",
      },
      {
        name: "Police Control Room",
        number: "100",
        icon: "👮",
      },
      {
        name: "Women Helpline",
        number: "1091",
        icon: "👩‍💼",
      },
    ];

    return (
      <section className="page-card">
        <button
          className="back-button"
          onClick={() => goTo("home")}
        >
          ← Back
        </button>

        <h1>Emergency Contacts</h1>

        <p className="page-subtitle">
          Quickly contact someone you trust
        </p>

        <div className="contacts-list">
          {contacts.map((contact) => (
            <div
              className="contact-item"
              key={contact.name}
            >
              <div className="contact-avatar">
                {contact.icon}
              </div>

              <div className="contact-details">
                <h3>{contact.name}</h3>
                <p>{contact.number}</p>
              </div>

              <a
                className="call-button"
                href={`tel:${contact.number.replace(
                  /\s/g,
                  ""
                )}`}
              >
                📞
              </a>
            </div>
          ))}
        </div>

        <button
          className="add-contact"
          onClick={() =>
            alert(
              "Add Contact will be connected to a database later."
            )
          }
        >
          ＋ Add New Contact
        </button>
      </section>
    );
  };

  /* =========================================================
     MAP PAGE
     ========================================================= */

  const MapPage = () => {
    const center = location
      ? [location.lat, location.lng]
      : [19.076, 72.8777];

    return (
      <section className="map-page">
        <div className="page-header">
          <button onClick={() => goTo("home")}>
            ←
          </button>

          <h1>Crime Alert Map</h1>

          <span>⚠️</span>
        </div>

        <div className="map-search">
          🔍

          <input
            placeholder="Search location..."
          />
        </div>

        <MapContainer
          center={center}
          zoom={13}
          className="crime-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {location && (
            <>
              <Marker
                position={[
                  location.lat,
                  location.lng,
                ]}
              >
                <Popup>
                  📍 You are here
                </Popup>
              </Marker>

              <Circle
                center={[
                  location.lat,
                  location.lng,
                ]}
                radius={500}
              />
            </>
          )}

          <Marker position={[19.076, 72.8777]}>
            <Popup>
              🚨 Crime alert
              <br />
              Reported incident
            </Popup>
          </Marker>

          <Marker position={[19.0896, 72.8656]}>
            <Popup>
              ⚠️ Safety warning
            </Popup>
          </Marker>

          <Marker position={[19.0596, 72.8295]}>
            <Popup>
              🟢 Safe zone
            </Popup>
          </Marker>
        </MapContainer>

        <div className="map-legend">
          <div>
            🔴
            <span>Crime Alert</span>
          </div>

          <div>
            ⚠️
            <span>Warning</span>
          </div>

          <div>
            🟢
            <span>Safe Zone</span>
          </div>

          <div>
            🔵
            <span>You</span>
          </div>
        </div>

        <div className="recent-alerts">
          <div className="recent-heading">
            <h2>Recent Alerts</h2>

            <button
              onClick={() => goTo("alerts")}
            >
              View All
            </button>
          </div>

          <div className="alert-row">
            <span>🚨</span>

            <div>
              <small>2 min ago</small>
              <p>Theft reported nearby</p>
            </div>

            <b>›</b>
          </div>

          <div className="alert-row">
            <span>⚠️</span>

            <div>
              <small>1 hr ago</small>
              <p>Suspicious activity reported</p>
            </div>

            <b>›</b>
          </div>
        </div>
      </section>
    );
  };

  /* =========================================================
     SAFE ROUTE PAGE
     ========================================================= */

  const RoutePage = () => {
    const [destination, setDestination] =
      useState("");

    const [routeType, setRouteType] =
      useState("Safest Route");

    const startNavigation = () => {
      if (!destination.trim()) {
        alert("Please enter your destination first.");
        return;
      }

      alert(
        `🚗 Starting ${routeType.toLowerCase()} to ${destination}`
      );
    };

    return (
      <section className="page-card route-page">
        <button
          className="back-button"
          onClick={() => goTo("home")}
        >
          ← Back
        </button>

        <h1>Safe Route Finder</h1>

        <p className="page-subtitle">
          Find a safer route to your destination
        </p>

        <div className="route-input">
          <label>From</label>

          <input
            value="📍 My Location"
            readOnly
          />

          <label>To</label>

          <input
            placeholder="Enter destination"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
          />
        </div>

        <div className="route-options">
          {[
            "Safest Route",
            "Shortest Route",
            "Less Traffic",
          ].map((type) => (
            <button
              key={type}
              className={
                routeType === type
                  ? "selected"
                  : ""
              }
              onClick={() => setRouteType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="route-preview">
          <div className="fake-route-map">
            📍

            <div className="route-line">
              ━━━━━╱
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;╲━━━━ 🚩
            </div>
          </div>

          <div className="route-summary">
            <h3>Route Summary</h3>

            <strong>23 min</strong>

            <span> (8.4 km)</span>

            <p>
              🟢 High safety • Well lit • CCTV
            </p>

            <button onClick={startNavigation}>
              Start Navigation →
            </button>
          </div>
        </div>
      </section>
    );
  };

  /* =========================================================
     CHATBOT PAGE
     ========================================================= */

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || sending) {
      return;
    }

    /*
     * Add the user's COMPLETE message once.
     */

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "user",
        text: userMessage,
      },
    ]);

    /*
     * Clear input immediately.
     */

    setMessage("");

    /*
     * Disable send button while waiting.
     */

    setSending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "AI request failed"
        );
      }

      /*
       * Add AI response as ONE complete message.
       */

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: "ai",
          text:
            data.reply ||
            data.message ||
            "I'm here to help you stay safe.",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 2,
          sender: "ai",
          text:
            "Sorry 😔 I couldn't connect to SafeCity AI. Please check that your AI server is running on port 5000.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleChatKey = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  

  /* =========================================================
     ALERTS PAGE
     ========================================================= */

  const AlertsPage = () => {
    return (
      <section className="page-card">
        <button
          className="back-button"
          onClick={() => goTo("home")}
        >
          ← Back
        </button>

        <h1>Safety Alerts</h1>

        <p className="page-subtitle">
          Recent safety information
        </p>

        <div className="big-alert danger">
          <span>🚨</span>

          <div>
            <h3>Theft Reported</h3>

            <p>
              Reported near Linking Road, Bandra.
            </p>

            <small>2 minutes ago</small>
          </div>
        </div>

        <div className="big-alert warning">
          <span>⚠️</span>

          <div>
            <h3>Suspicious Activity</h3>

            <p>
              Reported near Andheri West.
            </p>

            <small>1 hour ago</small>
          </div>
        </div>

        <div className="big-alert safe">
          <span>🟢</span>

          <div>
            <h3>Safe Zone Nearby</h3>

            <p>
              Police station detected nearby.
            </p>

            <small>3 hours ago</small>
          </div>
        </div>
      </section>
    );
  };

  /* =========================================================
     PROFILE PAGE
     ========================================================= */

  const ProfilePage = () => {
    return (
      <section className="page-card profile-page">
        <button
          className="back-button"
          onClick={() => goTo("home")}
        >
          ← Back
        </button>

        <div className="profile-avatar">
          👤
        </div>

        <h1>{name || "Krishna"}</h1>

        <p className="page-subtitle">
          SafeCity AI Member
        </p>

        <div className="profile-options">
          <button
            onClick={() =>
              alert("Personal information")
            }
          >
            👤 Personal Information
          </button>

          <button
            onClick={() =>
              alert("Notification settings")
            }
          >
            🔔 Notification Settings
          </button>

          <button
            onClick={getLocation}
          >
            📍 Location Settings
          </button>

          <button
            onClick={() =>
              alert("Privacy & Safety settings")
            }
          >
            🛡️ Privacy & Safety
          </button>

          <button
            className="logout-button"
            onClick={() => {
              setEmail("");
              setPassword("");
              setLoginError("");
              setScreen("welcome");
            }}
          >
            🚪 Logout
          </button>
        </div>
      </section>
    );
  };

  /* =========================================================
     CURRENT PAGE
     ========================================================= */

  const renderPage = () => {
    switch (screen) {
      case "welcome":
        return <WelcomePage />;

      case "login":
  return (
    <LoginPage
      loginMode={loginMode}
      setLoginMode={setLoginMode}

      name={name}
      setName={setName}

      email={email}
      setEmail={setEmail}

      password={password}
      setPassword={setPassword}

      showPassword={showPassword}
      setShowPassword={setShowPassword}

      loginError={loginError}
      setLoginError={setLoginError}

      goTo={goTo}
    />
  );

      case "home":
        return <HomePage />;

      case "sos":
        return <SOSPage />;

      case "contacts":
        return <ContactsPage />;

      case "map":
        return <MapPage />;

      case "route":
        return <RoutePage />;

      case "chatbot":
  return (
    <ChatbotPage
      messages={messages}
      messagesRef={messagesRef}
      message={message}
      setMessage={setMessage}
      sending={sending}
      sendMessage={sendMessage}
      handleChatKey={handleChatKey}
      goTo={goTo}
    />
  );
      case "alerts":
        return <AlertsPage />;

      case "profile":
        return <ProfilePage />;

      default:
        return <WelcomePage />;
    }
  };

  /* =========================================================
     APP LAYOUT
     ========================================================= */

  /*
   * Welcome and Login have their own full-screen design.
   * The dashboard gets navbar + bottom navigation.
   */

  if (
    screen === "welcome" ||
    screen === "login"
  ) {
    return (
      <div className="app">
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="app">
      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="navbar">
        <button
          className="logo"
          onClick={() => goTo("home")}
        >
          🛡️

          <span>SafeCity AI</span>
        </button>

        <div className="nav-icons">
          <button
            onClick={() => goTo("alerts")}
            aria-label="Alerts"
          >
            🔔
          </button>

          <button
            onClick={() => goTo("profile")}
            aria-label="Profile"
          >
            ☰
          </button>
        </div>
      </header>

      {/* =====================================================
          PAGE
          ===================================================== */}

      <main className="container">
        {renderPage()}
      </main>

      {/* =====================================================
          BOTTOM NAVIGATION
          ===================================================== */}

      <nav className="bottom-nav">
        <button
          className={
            screen === "home"
              ? "active"
              : ""
          }
          onClick={() => goTo("home")}
        >
          🏠
          <span>Home</span>
        </button>

        <button
          className={
            screen === "map"
              ? "active"
              : ""
          }
          onClick={() => goTo("map")}
        >
          🗺️
          <span>Map</span>
        </button>

        <button
          className={
            screen === "alerts"
              ? "active"
              : ""
          }
          onClick={() => goTo("alerts")}
        >
          🔔
          <span>Alerts</span>
        </button>

        <button
          className={
            screen === "chatbot"
              ? "active"
              : ""
          }
          onClick={() => goTo("chatbot")}
        >
          🤖
          <span>Chatbot</span>
        </button>

        <button
          className={
            screen === "profile"
              ? "active"
              : ""
          }
          onClick={() => goTo("profile")}
        >
          👤
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;