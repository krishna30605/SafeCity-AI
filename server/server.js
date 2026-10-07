const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "gpt-5",
      instructions:
        "You are SafeCity AI. Give simple, calm and practical safety advice.",
      input: message,
    });

    res.json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

app.listen(5000, () => {
  console.log("🚨 SafeCity AI server running on http://localhost:5000");
});