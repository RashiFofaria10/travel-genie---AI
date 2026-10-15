const express = require("express");
const { findHiddenPlaces } = require("../services/hiddenPlacesService");

const router = express.Router();

/*
  POST /api/hidden-places/discover

  Body:
  {
    "destination": "Manali"
  }
*/

router.post("/discover", async (req, res) => {
  try {
    const { destination } = req.body;

    if (
      !destination ||
      typeof destination !== "string" ||
      !destination.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a destination.",
      });
    }

    const cleanDestination = destination.trim();

    if (cleanDestination.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Destination name is too long.",
      });
    }

    console.log(
      `🗺️ Finding hidden places around: ${cleanDestination}`
    );

    const result = await findHiddenPlaces(cleanDestination);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ Hidden Places API Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error?.error?.error?.message ||
        error?.message ||
        "Failed to find hidden places.",
    });
  }
});

module.exports = router;