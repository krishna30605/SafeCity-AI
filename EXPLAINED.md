# SafeCity AI - line-by-line explanation

Every `//` comment below explains the line under it. The real code is in `client/src/App.jsx` and `server/server.js`.

## 1. SOS and calling
```js
const isPhone = /Android|iPhone|iPad/i.test(navigator.userAgent); // true only on a phone

const callNumber = (number) => {
  const clean = number.replace(/\s/g, "");        // remove spaces: "+91 98765" -> "+9198765"
  if (isPhone) window.location.href = `tel:${clean}`; // phone: open the dialer
  else {
    navigator.clipboard?.writeText(clean);        // laptop: no dialer, so copy the number
    alert(`Calling works on phones. Number ${clean} copied.`);
  }
};
```
SOS button: `onClick={() => window.confirm("Call emergency services at 112?") && callNumber("112")}`
- `window.confirm` shows OK/Cancel so nobody calls 112 by accident.
- `&&` means: only if OK was pressed, run `callNumber("112")`.

## 2. Location + WhatsApp share
```js
const getLocation = (after) => {
  if (!navigator.geolocation) return alert("Location is not supported."); // old browser
  navigator.geolocation.getCurrentPosition(
    (p) => {                                       // success: GPS answered
      const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
      setLocation(loc);                            // save it in React state
      if (after) after(loc);                       // optional next step
    },
    () => alert("Please allow location permission."), // user pressed Block
  );
};

const shareLocation = () =>
  getLocation((loc) => {
    const first = contacts.find((c) => c.number.replace(/\D/g, "").length >= 10); // first contact with a full number
    if (!first) return alert("Add a contact with a full phone number first.");
    const msg = encodeURIComponent(`I need help! My location: https://maps.google.com/?q=${loc.lat},${loc.lng}`);
    window.open(`https://wa.me/${first.number.replace(/\D/g, "")}?text=${msg}`, "_blank"); // open WhatsApp with the text ready
  });
```

## 3. Emergency contacts
```js
const [contacts, setContacts] = useState(() => {      // runs once when the app opens
  try { return JSON.parse(localStorage.getItem("contacts")) || DEFAULT_CONTACTS; } // saved list, or the default 5
  catch { return DEFAULT_CONTACTS; }                   // saved data was broken
});
useEffect(() => localStorage.setItem("contacts", JSON.stringify(contacts)), [contacts]); // save on EVERY change

const addContact = () => {
  const n = prompt("Contact name?");                   // ask name
  const num = n && prompt("Phone number (with +91)?"); // ask number only if a name was typed
  if (n && num) setContacts([...contacts, { name: n, number: num }]); // add to the end
};
```
Delete: `setContacts(contacts.filter((_, k) => k !== i))` keeps every contact except number `i`.

## 4. Crime alert map (reports saved on the device)
```js
const reportIncident = () => {
  const t = prompt("What happened? 1 = Crime, 2 = Warning, 3 = Safe zone");
  const type = { 1: "crime", 2: "warning", 3: "safe" }[t?.trim()]; // turn the typed number into a type
  if (!type) return;                                   // wrong answer: stop
  const text = prompt("Short description");
  if (!text) return;
  const add = (lat, lng) => setIncidents((l) => [...l, { id: Date.now(), type, text, lat, lng, time: new Date().toLocaleString() }]);
  if (location) add(location.lat, location.lng);       // we already know where the user is
  else getLocation((l) => add(l.lat, l.lng));          // otherwise ask the GPS first
};
```
The map draws one pin per item with `incidents.map(...)`; the home counters use `incidents.filter((i) => i.type === "crime").length`.

## 5. Safe route finder
```js
const findRoute = async () => {
  if (!dest.trim()) return alert("Enter a destination first.");
  setRouting(true);                                    // show "Finding route..."
  try {
    const start = location || await new Promise((ok, no) =>
      navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lng: p.coords.longitude }), no)); // my position
    const g = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(dest)}`)).json(); // place name -> coordinates
    if (!g[0]) throw new Error("Destination not found");
    const end = { lat: +g[0].lat, lng: +g[0].lon };
    const r = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`)).json(); // real road routes (up to 3)
    const risk = (rt) => incidents.filter((i) => i.type !== "safe" && rt.geometry.coordinates.some(([lng, lat]) => dist(lat, lng, i.lat, i.lng) < 300)).length; // reported incidents within 300 m of the route
    // "Safest" = fewest nearby reports, then fastest. "Shortest" = least distance. "Less Traffic" = least time.
  } catch (e) { alert("Could not find route: " + e.message); }
  setRouting(false);
};
```
Note: "safest" uses incidents reported inside the app. It is not official crime data.

## 6. Chatbot (client)
```js
const send = async () => {
  const msg = text.trim();
  if (!msg || sending) return;                         // empty or already waiting: stop
  const history = messages;                            // earlier messages = memory
  setMessages((m) => [...m, { id: Date.now(), sender: "user", text: msg }]); // show my bubble
  setText(""); setSending(true);                       // clear the box, lock the button
  try {
    const r = await fetch(`${API}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, history }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.details || d.error);  // server said error
    setMessages((m) => [...m, { id: Date.now() + 1, sender: "ai", text: d.reply }]); // show AI bubble
  } catch { setMessages((m) => [...m, { id: Date.now() + 2, sender: "ai", text: offlineReply(msg) }]); } // server off: built-in tips
  finally { setSending(false); }                       // always unlock
};
```

## 7. Chatbot (server/server.js)
```js
require("dotenv").config();                            // read OPENAI_API_KEY from .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // the key never goes to the browser
app.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message || !message.trim() || message.length > 1000) return res.status(400).json({ error: "Invalid message" });
  const input = [...history.slice(-10).map(...), { role: "user", content: message }]; // last 10 messages + the new one
  const response = await openai.responses.create({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", instructions: "...safety assistant...", input });
  res.json({ reply: response.output_text });           // send the answer back
});
```
