import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

// === Firebase Admin Setup ===
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, "firebase-service-account.json")),
});
const db = admin.firestore();

// === Credentials ===
const EDAMAM_APP_ID = "0482d211";
const EDAMAM_APP_KEY = "2e9fe9a79bf57eb8fd5f3dbf500e08a7";
const TMDB_API_KEY = "0185a0ad03a3db2ef4d9c66936a54152";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// === Food endpoint ===
app.get("/api/recipes", async (req, res) => {
  const query = req.query.q;
  const mealType = req.query.mealType;
  const to = req.query.to || 10;

  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&mealType=${mealType}&to=${to}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Edamam-Account-User": "oyeinmiede",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edamam API error:", errorText);
      return res.status(response.status).json({ error: "Edamam API error", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/recipe", async (req, res) => {
  const rawUri = req.query.uri;
  if (!rawUri) return res.status(400).json({ error: "Missing recipe URI" });

  const url = `https://api.edamam.com/api/recipes/v2/${rawUri}?type=public&app_id=f68a7320&app_key=ba73ba79f5111224f575e97910646b95`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Edamam-Account-User": "oyeinmiede",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edamam API error:", errorText);
      return res.status(response.status).json({ error: "Edamam API error", details: errorText });
    }

    const data = await response.json();
    res.json({ recipe: data.recipe });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === Movie endpoint ===
app.get("/api/movies", async (req, res) => {
  const query = req.query.q;
  const url = query
    ? `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${query}`
    : `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API error:", errorText);
      return res.status(response.status).json({ error: "TMDB API error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === AI Chatbot endpoint (Gemini) ===
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  console.log("Incoming message:", message);
  console.log("Gemini API Key loaded?", !!GEMINI_API_KEY);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
                    You are the built-in AI assistant for a web app called "Piqr". Piqr helps users decide what to eat (Edamam recipes API) and what to watch (TMDB movies API). 
                    Scope
                    Only respond to questions about:
                    - What to eat (recipes)
                    - What to watch (movies)
                    - How to use the Piqr app
                    If asked about anything else, reply exactly:
                    "I can only help you with questions about what to eat, what to watch, or how to use the app."

                    Tone
                    Friendly, helpful, and concise. Keep replies to 2–3 short sentences max.

                    Response Style
                    - Be clear and direct.
                    - Include one small, useful action:
                    - A concrete suggestion (e.g., a recipe or movie name)
                    - A quick filter (e.g., “low-carb”, “comedy, 2010s”)
                    - A short next step (e.g., “open Surprise Me”, “view your Cookbook”)
                    - A simple example query users can copy/paste

                    Behavior Rules
                    Missing Info
                    If the user’s request is missing a key detail (e.g., meal type, genre, decade), ask one short clarifying question.
                    Movie Suggestions
                    - Suggest a movie by name only (no ID or fake buttons).
                    - Example:
                    - “Try a rom-com from the 2010s like The Big Sick. Want more like that or explore other genres?”
                    Recipe Suggestions- Suggest a recipe by name only (no encoded URI or fake buttons).
                    - Example:
                    - “Try lemon garlic salmon — it’s quick and low-carb. Want vegetarian options instead?”
                    Surprise Me
                    - Ask: “Movie or Recipe?”
                    - Then suggest one item by name.
                    - Example:
                    - “Surprise pick: Chef’s Thai Curry. Want to try another or view recipes?”

                    Errors
                    If no results: "I couldn't find matches right now. Try loosening filters or use Surprise Me
                    If invalid input: "I don't recognize that meal type _ try Breakfast, Lunch or Dinner."
                    
                    Now respond to the user's question below:
                    
                    ${message}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API raw response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm... Gemini didn’t respond.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Something went wrong with Gemini API." });
  }
});

// === OTP: Send Code ===
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await db.collection("otp").doc(email).set({
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }

  res.send({ success: true });
});

// === OTP: Verify Code ===
app.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  const doc = await db.collection("otp").doc(email).get();

  if (!doc.exists) return res.send({ valid: false });

  const { code: storedCode, expiresAt } = doc.data();
  if (Date.now() > expiresAt || code !== storedCode) {
    return res.send({ valid: false });
  }

  res.send({ valid: true });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);