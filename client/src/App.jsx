import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const isPhone = /Android|iPhone|iPad/i.test(navigator.userAgent);

const pin = (emoji, color) =>
  L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${color}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

const DEFAULT_CONTACTS = [
  { name: "Mom", number: "+919876543210" },
  { name: "Dad", number: "+919123456789" },
  { name: "Best Friend", number: "+919987654321" },
  { name: "Police Control Room", number: "100" },
  { name: "Women Helpline", number: "1091" },
];

const AVATARS = { Mom: "mom", Dad: "dad", "Best Friend": "friend", "Police Control Room": "police", "Women Helpline": "women" };

const SAMPLE = [
  { id: 1, type: "crime", text: "Theft reported near Linking Road", lat: 19.076, lng: 72.8777, time: "Sample" },
  { id: 2, type: "warning", text: "Suspicious activity", lat: 19.0896, lng: 72.8656, time: "Sample" },
  { id: 3, type: "safe", text: "Police station", lat: 19.0596, lng: 72.8295, time: "Sample" },
];
const COLORS = { crime: ["🚨", "#e53935"], warning: ["⚠️", "#f5b400"], safe: ["🛡️", "#28a65a"] };
const view = (i) => ({ icon: COLORS[i.type][0], cls: { crime: "danger", warning: "warning", safe: "safe" }[i.type], title: i.text, text: { crime: "Crime alert", warning: "Safety warning", safe: "Safe zone" }[i.type], time: i.time });
const dist = (a, b, c, d) => {
  const R = 6371000, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r;
  const h = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const TIPS = [
  [/follow|stalk/, "If someone is following you: stay in a crowded, well-lit place, call a contact, and dial 112 if you feel unsafe."],
  [/night|dark|late/, "At night: use main roads, share your live location with a contact, and avoid empty shortcuts."],
  [/harass|eve|touch/, "Move to a safe public place, shout for help, and call 112 or the Women Helpline 1091."],
  [/accident|hurt|injur|ambulance/, "Call 112 immediately for an ambulance. Stay calm and do not move an injured person."],
  [/lost|stuck/, "Open the Map screen to see your location, then call a trusted contact or 112 for help."],
];
const offlineReply = (m) => "(Offline mode) " + (TIPS.find(([re]) => re.test(m.toLowerCase()))?.[1] || "I can't reach the AI server right now. In danger, call 112 (police 100, women helpline 1091).");

const ALERTS = [
  { icon: "🚨", cls: "danger", title: "Theft reported", text: "Near Linking Road, Bandra", time: "2 min ago" },
  { icon: "⚠️", cls: "warning", title: "Suspicious activity", text: "Andheri West", time: "1 hr ago" },
  { icon: "🛡️", cls: "safe", title: "Safe zone nearby", text: "Police station detected", time: "3 hrs ago" },
];

function Header({ title, color, onBack, right }) {
  return (
    <div className="page-top" style={{ background: color }}>
      <button onClick={onBack}>←</button>
      <h2>{title}</h2>
      <div className="top-right">{right}</div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("Krishna");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [dest, setDest] = useState("");
  const [routeType, setRouteType] = useState("Safest Route");
  const [route, setRoute] = useState(null);
  const [routing, setRouting] = useState(false);
  const [incidents, setIncidents] = useState(() => {
    try { return JSON.parse(localStorage.getItem("incidents")) || SAMPLE; } catch { return SAMPLE; }
  });
  useEffect(() => localStorage.setItem("incidents", JSON.stringify(incidents)), [incidents]);

  const [contacts, setContacts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("contacts")) || DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });
  useEffect(() => localStorage.setItem("contacts", JSON.stringify(contacts)), [contacts]);

  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "Hi Krishna! 👋 I'm your AI Safety Assistant. How can I help you today?" },
  ]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, sending]);

  const goTo = (s) => { setScreen(s); window.scrollTo(0, 0); };

  const callNumber = (number) => {
    const clean = number.replace(/\s/g, "");
    if (isPhone) window.location.href = `tel:${clean}`;
    else {
      navigator.clipboard?.writeText(clean);
      alert(`Calling works on phones. Number ${clean} copied.`);
    }
  };

  const getLocation = (after) => {
    if (!navigator.geolocation) return alert("Location is not supported.");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        setLocation(loc);
        if (after) after(loc);
      },
      () => alert("Please allow location permission."),
    );
  };

  const shareLocation = () =>
    getLocation((loc) => {
      const first = contacts.find((c) => c.number.replace(/\D/g, "").length >= 10);
      if (!first) return alert("Add a contact with a full phone number first.");
      const msg = encodeURIComponent(
        `🚨 I need help! My location: https://maps.google.com/?q=${loc.lat},${loc.lng}`,
      );
      window.open(`https://wa.me/${first.number.replace(/\D/g, "")}?text=${msg}`, "_blank");
    });

  const addContact = () => {
    const n = prompt("Contact name?");
    const num = n && prompt("Phone number (with +91)?");
    if (n && num) setContacts([...contacts, { name: n, number: num }]);
  };

  const reportIncident = () => {
    const t = prompt("What happened? 1 = Crime, 2 = Warning, 3 = Safe zone");
    const type = { 1: "crime", 2: "warning", 3: "safe" }[t?.trim()];
    if (!type) return;
    const text = prompt("Short description (e.g. Phone snatching near station)");
    if (!text) return;
    const add = (lat, lng) => setIncidents((l) => [...l, { id: Date.now(), type, text, lat, lng, time: new Date().toLocaleString() }]);
    if (location) add(location.lat, location.lng);
    else getLocation((l) => add(l.lat, l.lng));
  };

  const findRoute = async () => {
    if (!dest.trim()) return alert("Enter a destination first.");
    setRouting(true);
    try {
      const start = location || await new Promise((ok, no) =>
        navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lng: p.coords.longitude }), no));
      setLocation(start);
      const g = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(dest)}`)).json();
      if (!g[0]) throw new Error("Destination not found");
      const end = { lat: +g[0].lat, lng: +g[0].lon };
      const r = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`)).json();
      if (!r.routes?.length) throw new Error("No route found");
      const risk = (rt) => incidents.filter((i) => i.type !== "safe" && rt.geometry.coordinates.some(([lng, lat]) => dist(lat, lng, i.lat, i.lng) < 300)).length;
      const list = r.routes.map((rt) => ({ ...rt, risk: risk(rt) }));
      const best = (f) => list.reduce((a, b) => (f(b, a) ? b : a));
      const pick = routeType === "Shortest Route" ? best((b, a) => b.distance < a.distance)
        : routeType === "Less Traffic" ? best((b, a) => b.duration < a.duration)
        : best((b, a) => b.risk < a.risk || (b.risk === a.risk && b.duration < a.duration));
      setRoute({ pts: pick.geometry.coordinates.map(([lng, lat]) => [lat, lng]), km: (pick.distance / 1000).toFixed(1), min: Math.round(pick.duration / 60), risk: pick.risk, start, end });
    } catch (e) {
      alert("Could not find route: " + (e.message || "allow location permission"));
    }
    setRouting(false);
  };

  const login = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return setError("Enter email and password.");
    setError("");
    goTo("home");
  };

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    const history = messages;
    setMessages((m) => [...m, { id: Date.now(), sender: "user", text: msg }]);
    setText("");
    setSending(true);
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.details || d.error);
      setMessages((m) => [...m, { id: Date.now() + 1, sender: "ai", text: d.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { id: Date.now() + 2, sender: "ai", text: offlineReply(msg) }]);
    } finally {
      setSending(false);
    }
  };

  /* ---------- full-screen pages ---------- */
  if (screen === "welcome")
    return (
      <div className="app welcome-page">
        <img className="logo-img" src="/logo.png" alt="SafeCity AI" />
        <h1>SafeCity AI</h1>
        <p>Your Safety. Our Priority.</p>
        <img className="hero-img" src="/hero.png" alt="" />
        <button className="btn-white" onClick={() => goTo("login")}>Get Started</button>
        <button className="btn-outline" onClick={() => goTo("login")}>Login / Sign Up</button>
      </div>
    );

  if (screen === "login")
    return (
      <div className="app login-page">
        <form className="login-card" onSubmit={login}>
          <h1>Welcome 👋</h1>
          <p className="muted">Demo login - any email works for now</p>
          <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="error">⚠️ {error}</div>}
          <button className="btn-purple" type="submit">Login</button>
          <button type="button" className="link" onClick={() => goTo("welcome")}>← Back</button>
        </form>
      </div>
    );

  /* ---------- app pages ---------- */
  const center = location ? [location.lat, location.lng] : [19.076, 72.8777];
  const back = () => goTo("home");

  return (
    <div className="app">
      {screen === "home" && (
        <div className="page">
          <div className="hello">
            <div><h1>Hello, {name} 👋</h1><p className="muted">Stay aware, stay safe.</p></div>
            <button className="icon-btn" onClick={() => goTo("alerts")}>🔔</button>
          </div>

          <div className="ai-card">
            <img className="robot" src="/robot.png" alt="" />
            <div>
              <h3>AI Safety Chatbot</h3>
              <p>Your 24x7 Safety Assistant</p>
              <button onClick={() => goTo("chat")}>Chat Now</button>
            </div>
          </div>

          <div className="features">
            <button className="feature" onClick={() => goTo("sos")}>
              <span className="circle red">SOS</span><b>Emergency</b><small>SOS 112</small>
            </button>
            <button className="feature" onClick={() => goTo("contacts")}>
              <span className="circle blue">👥</span><b>Emergency</b><small>Contacts</small>
            </button>
            <button className="feature" onClick={() => goTo("route")}>
              <span className="circle green">📍</span><b>Safe Route</b><small>Finder</small>
            </button>
            <button className="feature" onClick={() => goTo("map")}>
              <span className="circle orange">🛡️</span><b>Crime Alert</b><small>Map</small>
            </button>
          </div>

          <button className="location-card" onClick={() => getLocation()}>
            <div>
              <b>📍 Use My Location</b>
              <p className="muted">{location ? "Location detected ✔" : "Find nearby safety info"}</p>
            </div>
          </button>

          <h3 className="section">Safety at a Glance</h3>
          <div className="stats">
            <div><small>Crime Alerts</small><b className="red">{incidents.filter((i) => i.type === "crime").length}</b><small>In Your Area</small></div>
            <div><small>Safe Zones</small><b className="green">{incidents.filter((i) => i.type === "safe").length}</b><small>Nearby</small></div>
            <div><small>Warnings</small><b className="orange">{incidents.filter((i) => i.type === "warning").length}</b><small>Active</small></div>
          </div>
        </div>
      )}

      {screen === "sos" && (
        <>
          <Header title="Emergency SOS" color="#e53935" onBack={back} />
          <div className="page center">
            <button
              className="sos-btn"
              onClick={() => window.confirm("Call emergency services at 112?") && callNumber("112")}
            >
              <span>SOS</span><strong>112</strong>
            </button>
            <h3>Tap to call 112</h3>
            <p className="muted">Or share your live location with your contacts</p>
            <button className="btn-purple" onClick={shareLocation}>📍 Send my location on WhatsApp</button>
            <div className="card">Sharing with <b>{contacts.length} contacts</b></div>
            <button className="btn-outline-dark" onClick={back}>Cancel SOS</button>
          </div>
        </>
      )}

      {screen === "contacts" && (
        <>
          <Header title="Emergency Contacts" color="#2f6fe0" onBack={back}
            right={<button onClick={addContact}>＋</button>} />
          <div className="page">
            {contacts.map((c, i) => (
              <div className="contact" key={i}>
                {AVATARS[c.name]
                  ? <img className="avatar" src={`/avatars/${AVATARS[c.name]}.png`} alt="" />
                  : <div className="avatar">{c.name[0]}</div>}
                <div className="grow"><b>{c.name}</b><p className="muted">{c.number}</p></div>
                <button className="call" onClick={() => callNumber(c.number)}>📞</button>
                <button className="del" onClick={() => setContacts(contacts.filter((_, k) => k !== i))}>
                  🗑️
                </button>
              </div>
            ))}
            <button className="btn-purple" onClick={addContact}>＋ Add New Contact</button>
          </div>
        </>
      )}

      {screen === "map" && (
        <>
          <Header title="Crime Alert Map" color="#5b21c9" onBack={back} />
          <div className="search">🔍 <input placeholder="Search location..." /></div>
          <MapContainer center={center} zoom={13} className="crime-map" key={center.join()}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {location && <Marker position={center} icon={pin("📍", "#2f6fe0")}><Popup>You are here</Popup></Marker>}
            {incidents.map((i) => (
              <Marker key={i.id} position={[i.lat, i.lng]} icon={pin(...COLORS[i.type])}>
                <Popup><b>{view(i).text}</b><br />{i.text}<br /><small>{i.time}</small></Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="legend">
            <span>🔴 Crime</span><span>⚠️ Warning</span><span>🟢 Safe</span><span>🔵 You</span>
          </div>
          <div className="page">
            <h3>Recent Alerts in this Area</h3>
            {incidents.slice(-2).reverse().map(view).map((a, n) => (
              <div className={`alert ${a.cls}`} key={n}>
                <span>{a.icon}</span>
                <div><small>{a.time}</small><p><b>{a.title}</b> - {a.text}</p></div>
              </div>
            ))}
            <button className="btn-purple" onClick={() => getLocation()}>📍 Show my location</button>
            <button className="btn-outline-dark" onClick={reportIncident}>＋ Report an incident here</button>
          </div>
        </>
      )}

      {screen === "route" && (
        <>
          <Header title="Safe Route Finder" color="#2e9e5b" onBack={back} />
          <div className="page">
            <div className="card">
              <small className="muted">From</small>
              <input className="field" value="📍 My Location" readOnly />
              <small className="muted">To</small>
              <input className="field" placeholder="Enter destination (e.g. Andheri Station)" value={dest}
                onChange={(e) => setDest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && findRoute()} />
            </div>
            <b>Choose your preference</b>
            <div className="chips">
              {["Safest Route", "Shortest Route", "Less Traffic"].map((r) => (
                <button key={r} className={routeType === r ? "chip on" : "chip"} onClick={() => setRouteType(r)}>{r}</button>
              ))}
            </div>
            <button className="btn-purple" onClick={findRoute} disabled={routing}>{routing ? "Finding route..." : "🔎 Find Route"}</button>
          </div>
          <MapContainer center={route ? route.pts[0] : center} zoom={13} className="route-map" key={route ? `${route.km}${dest}` : "r"}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {route && (
              <>
                <Polyline positions={route.pts} pathOptions={{ color: "#28a65a", weight: 6 }} />
                <Marker position={[route.start.lat, route.start.lng]} icon={pin("📍", "#2f6fe0")} />
                <Marker position={[route.end.lat, route.end.lng]} icon={pin("🚩", "#e53935")} />
              </>
            )}
          </MapContainer>
          {route && (
            <div className="page">
              <div className="card">
                <b>Route Summary</b>
                <p><span className="big-time">{route.min} min</span> <span className="muted">({route.km} km)</span></p>
                <p className="muted">{route.risk === 0 ? "🟢 No reported incidents within 300 m of this route" : `⚠️ ${route.risk} reported incident(s) near this route`}</p>
              </div>
              <button className="btn-green" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${route.start.lat},${route.start.lng}&destination=${route.end.lat},${route.end.lng}&travelmode=driving`, "_blank")}>Start Navigation ➤</button>
            </div>
          )}
        </>
      )}

      {screen === "alerts" && (
        <>
          <Header title="Safety Alerts" color="#5b21c9" onBack={back} />
          <div className="page">
            {incidents.slice().reverse().map(view).map((a, n) => (
              <div className={`alert ${a.cls}`} key={n}>
                <span>{a.icon}</span>
                <div><b>{a.title}</b><p>{a.text}</p><small>{a.time}</small></div>
              </div>
            ))}
            <p className="muted">Alerts are stored on this device. Use "Report an incident" on the map to add more.</p>
          </div>
        </>
      )}

      {screen === "chat" && (
        <div className="chat">
          <Header title="AI Safety Chatbot" color="#5b21c9" onBack={back} />
          <div className="messages" ref={chatRef}>
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.sender}`}>
                {m.sender === "ai" && <div className="bot">🤖</div>}
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            {sending && <div className="msg ai"><div className="bot">🤖</div><div className="bubble">Thinking... 🤔</div></div>}
          </div>
          <div className="chat-input">
            <input
              value={text}
              placeholder="Type your message..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send} disabled={sending || !text.trim()}>➤</button>
          </div>
        </div>
      )}

      {screen === "profile" && (
        <>
          <Header title="Profile" color="#5b21c9" onBack={back} />
          <div className="page center">
            <div className="avatar big">{name[0]}</div>
            <h2>{name}</h2>
            <p className="muted">SafeCity AI Member</p>
            <button className="btn-outline-dark" onClick={() => { setPassword(""); goTo("welcome"); }}>🚪 Logout</button>
          </div>
        </>
      )}

      <nav className="bottom-nav">
        {[
          ["home", "🏠", "Home"], ["map", "🗺️", "Map"], ["alerts", "🔔", "Alerts"],
          ["chat", "🤖", "Chatbot"], ["profile", "👤", "Profile"],
        ].map(([id, Icon, label]) => (
          <button key={id} className={screen === id ? "active" : ""} onClick={() => goTo(id)}>
            <span className="ico">{Icon}</span><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
