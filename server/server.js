const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const visionRoutes = require("./routes/visionRoutes");
const hiddenPlacesRoutes = require("./routes/hiddenPlacesRoutes");
const artisanRoutes = require("./routes/artisanRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const flightRoutes = require("./routes/flightRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Travel Genie AI Backend is Running!",
    version: "1.0.0",
    features: {
      chat: true,
      assistant: true,
      vision: true,
      hiddenPlaces: true,
      artisans: true,
      promotions: true,
      trips: true,
    },
  });
});

// API routes
app.use("/api/chat", chatRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/hidden-places", hiddenPlacesRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/flights", flightRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the server .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log("========================================");
      console.log("Travel Genie AI Backend Started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(
        "APIs: chat, assistant, vision, hidden places, artisans, promotions, trips"
      );
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();