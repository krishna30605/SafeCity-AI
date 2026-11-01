const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.json({ message: "SafeCity AI server is working!" }));

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim() || message.length > 1000)
      return res.status(400).json({ error: "Invalid message" });

    const input = [
      ...history.slice(-10).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions:
        "You are SafeCity AI, a calm city-safety assistant for users in India. Give short, practical advice. If the user is in immediate danger, tell them to call 112 (police 100, women helpline 1091).",
      input,
    });
    res.json({ reply: response.output_text || "I'm here to help you stay safe." });
  } catch (e) {
    console.error(e.status, e.code, e.message);
    res.status(500).json({ error: "AI request failed", details: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
