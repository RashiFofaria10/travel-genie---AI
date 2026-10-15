const express = require("express");
const Artisan = require("../models/Artisan");
const { discoverLiveArtisans } = require("../services/artisanDiscoveryService");

const router = express.Router();

const escapeRegex = (value) =>
  value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// =====================================================
// GET /api/artisans
// Search artisan profiles saved in MongoDB
// =====================================================
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const destination =
      typeof req.query.destination === "string"
        ? req.query.destination.trim()
        : "";

    const filter = {};

    if (search) {
      const regex = {
        $regex: escapeRegex(search),
        $options: "i",
      };

      filter.$or = [
        { name: regex },
        { location: regex },
        { destination: regex },
        { craft: regex },
        { product: regex },
        { description: regex },
      ];
    }

    if (destination) {
      filter.destination = {
        $regex: escapeRegex(destination),
        $options: "i",
      };
    }

    const artisans = await Artisan.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: artisans.length,
      data: artisans,
      source: "MongoDB",
    });
  } catch (error) {
    console.error("Artisan database search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch artisan records from database.",
    });
  }
});

// =====================================================
// POST /api/artisans
// Save a new artisan profile to MongoDB
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      location,
      destination,
      craft,
      product,
      description,
      price,
      image,
      contact,
      source,
      sourceUrl,
      verifiedArtisan,
      latitude,
      longitude,
    } = req.body;

    if (!name || !craft || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, craft, and location are required.",
      });
    }

    // Check if duplicate already exists by name & destination
    const existing = await Artisan.findOne({
      name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
      destination: {
        $regex: `^${escapeRegex((destination || "").trim())}$`,
        $options: "i",
      },
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Artisan profile is already saved in your database.",
        data: existing,
      });
    }

    const newArtisan = await Artisan.create({
      name: name.trim(),
      location: location.trim(),
      destination: (destination || "Local").trim(),
      craft: craft.trim(),
      product: (product || craft).trim(),
      description: description || "",
      price: price || "",
      image: image || "",
      contact: contact || "",
      source: source || "Saved profile",
      sourceUrl: sourceUrl || "",
      verifiedArtisan: verifiedArtisan ?? true,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      isLiveFetched: true,
    });

    return res.status(201).json({
      success: true,
      message: "Artisan successfully saved to MongoDB database.",
      data: newArtisan,
    });
  } catch (error) {
    console.error("Error creating artisan profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save artisan profile.",
    });
  }
});

// =====================================================
// GET /api/artisans/discover?destination=Jaipur
// Live discovery fetching authentic real data from the web
// =====================================================
router.get("/discover", async (req, res) => {
  try {
    const rawDestination = req.query.destination || req.query.city;
    const destination =
      typeof rawDestination === "string" ? rawDestination.trim() : "";

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "Please enter a destination city to discover artisans.",
      });
    }

    // Call live discovery service that queries OpenStreetMap & Web Cultural Intelligence
    const result = await discoverLiveArtisans(destination);

    // Optionally auto-cache to MongoDB if destination isn't saved yet
    try {
      if (Array.isArray(result.data) && result.data.length > 0) {
        for (const item of result.data) {
          await Artisan.updateOne(
            {
              name: item.name,
              destination: item.destination,
            },
            {
              $setOnInsert: {
                name: item.name,
                location: item.location,
                destination: item.destination,
                craft: item.craft,
                product: item.product,
                description: item.description,
                price: item.price,
                image: item.image,
                contact: item.contact,
                source: item.source,
                sourceUrl: item.sourceUrl,
                verifiedArtisan: item.verifiedArtisan,
                latitude: item.latitude,
                longitude: item.longitude,
                isLiveFetched: true,
              },
            },
            { upsert: true }
          );
        }
      }
    } catch (saveErr) {
      console.warn("MongoDB auto-cache notice:", saveErr.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("Artisan live discovery error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Could not fetch live artisan data. Please check your internet connection and try again.",
    });
  }
});

module.exports = router;