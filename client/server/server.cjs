const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

console.log(
  "🔑 API key loaded:",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing!");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "🚨 SafeCity AI server is working!",
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    console.log("👤 User:", message);

    const response = await openai.responses.create({
      model: "gpt-5",

      instructions:
        "You are SafeCity AI, a helpful city safety assistant. Give calm, practical safety advice. If the user appears to be in immediate danger, encourage them to contact local emergency services.",

      input: message,
    });

    const reply = response.output_text;

    console.log("🤖 AI:", reply);

    return res.json({
      reply:
        reply ||
        "I'm here to help you stay safe. How can I assist you?",
    });

  } catch (error) {
    console.error("\n❌ ===== OPENAI ERROR =====");

    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Type:", error.type);

    console.error("==========================\n");

    return res.status(500).json({
      error: "AI request failed",
      details: error.message,
      status: error.status || null,
      code: error.code || null,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `🚨 SafeCity AI server running on http://localhost:${PORT}`
  );
});