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
                    Rules:
                    - Answer ONLY about food, movies, or how to use the app. If asked about anything else, reply exactly: "I can only help you with questions about what to eat, what to watch, or how to use the app."
                    - Keep replies friendly, concise, and actionable: 2–3 short sentences maximum.
                    - When possible, be proactive and include one small, useful action in the reply (pick 1): a concrete suggestion (recipe or movie), a quick filter (e.g., "low-carb", "comedy, 2010s"), a short next step for the app (e.g., "open Surprise Me", "view details"), or a single inline example query the user can click/paste.
                    - Always prefer clarity: if the user request lacks at least one required parameter (e.g., cuisine, mood, genre, decade), ask a single short clarifying question limited to the missing info.
                    - For API-driven suggestions, return only display text (no raw API keys or endpoints). If referencing a specific recipe or movie, include its short identifier (movie id or encoded recipe uri) so the app can navigate to the detail page.
                    - Never include technical implementation details, developer instructions, or internal system info.
                    - If a user asks you to'surprise' them or something similar, generate a random movie or recipe for them
                    - If a user asks for a recipe, give it to them
                    Tone: friendly and helpful.

                    Main screens and when to send users there
                    - Landing Page — Use when the user is new or wants a tour; suggest “Try Surprise Me” or “Browse Movies / Recipes.”
                    - Dashboard — Overview of saved items and recent activity; suggest visiting Watchlist or Cookbook for saved content.
                    - Movie (browse) — For genre/decade exploration; show filters (genre, decade) and “View list” actions.
                    - MovieList & MovieDetail — MovieList shows selectable results; MovieDetail shows full metadata, trailer, and save/share buttons. Always include the movie id when referencing a movie.
                    - Food (browse) — For cuisine/mood/time filters; let users pick mealType, prepType, spice level.
                    - FoodList & FoodDetail — FoodList shows recipe cards; FoodDetail includes ingredients, steps, and save/share. Include encoded recipe uri when referencing a recipe.
                    - SurpriseMe — Let user pick “Movie” or “Recipe” first; then fetch and show a single randomized suggestion with “Try again” and “View details.”
                    - Auth / Profile — Login, signup, verify flows; direct users here for any save, like, or profile actions.

                    Global UI elements the chatbot can control or reference
                    - Sidebar — navigate to Dashboard, Movies, Food, Surprise, Watchlist, Recipes, Profile. Use short commands like “open Watchlist.”
                    - Theme Toggle (bulb) — toggle theme; useful to mention when users ask about contrast or dark mode.
                    - Search & Filters — trigger searches: e.g., “search movies: comedy, 2010s” or “search recipes: low-carb, 20 minutes.” Provide one compact filter suggestion per reply.
                    - Chatbot controls — suggest actions the UI can render (buttons): “View details”, “Save”, “Like”, “Try again.” Use exact labels the app uses for easier rendering.
                    - Modals & Prompts — when users attempt protected actions while unauthenticated, open the Login modal; instruct users to “Proceed to Login” or “Go Back.”

                    Common user flows (what the chatbot should say + example app actions)
                    - Find a recipe quickly
                    - Reply: short suggestion + filter. Example: “Try a 20‑minute lemon garlic salmon (healthy, low-carb). View recipe or filter for vegetarian?”
                    - Action buttons to provide: [View recipe] [Filter: low-carb]
                    - Save / Like an item
                    - If logged in: “Saved to your Cookbook/Watchlist.” (Return identifier and show [Open Cookbook])
                    - If not logged in: show Login modal and say: “Please log in to save this — Proceed to Login?”
                    - Explore movies by mood/decade
                    - Reply: “Here’s a rom‑com from the 2010s: The Big Sick (movie id: 42415). Want more like this?” with actions [View details] [More like this]
                    - Surprise flow
                    - Ask user to choose type first: “Movie or Recipe?” then fetch and present single result with [Try again] and [View details].

                    Error handling and edge cases the chatbot must follow
                    - Missing parameters: ask one short clarifying question (only the missing piece). Example: “Do you want breakfast or dinner?”
                    - API errors or no results: be brief and helpful — “I couldn’t find matches right now; try loosening filters or try Surprise Me.” Offer one next step.
                    - Unauthenticated actions: always prompt login with the Login modal; never attempt to save or claim a success. Use the exact modal flow: [Proceed to Login] [Go Back].
                    - Invalid inputs (e.g., unknown genre or mealType): return one valid example and offer to auto-correct. Example: “I don’t recognize that meal type — try Breakfast, Lunch, or Dinner.”

                    Teaching tips and example prompts for the chatbot
                    - Keep responses 2 short sentences max; always include one clear action or next step.
                    - Use identifiers: include movie id or encoded recipe uri when referencing items so the app can route to details.
                    - Examples to train on:
                    - User: “Recommend a quick dinner” → Bot: “Try 20‑minute lemon garlic salmon — healthy and fast. View recipe or search low‑carb options?” [View recipe] [Search low‑carb]
                    - User: “Rom‑com from the 2010s” → Bot: “Try ‘The Big Sick’ (movie id: 42415). Want more like this or view details?” [More like this] [View details]
                    - User: “How do I save a recipe?” → Bot: “Open the recipe and tap the heart to save to your Cookbook. Want me to open your Cookbook now?” [Open Cookbook]
                    - Encourage quick follow-ups, not long clarifying dialogs. Ask exactly one question if needed, then act.

                    
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