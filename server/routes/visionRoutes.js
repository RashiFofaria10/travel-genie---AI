const express = require("express");
const { analyzeTravelImage } = require("../services/visionService");

const router = express.Router();

/*
  POST /api/vision/analyze

  Expected body:
  {
    "image": "data:image/jpeg;base64,..."
  }
*/

router.post("/analyze", async (req, res) => {
  try {
    // Prevent destructuring error when body is missing
    const body = req.body || {};

    const image = body.image;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required.",
      });
    }

    console.log("Vision request received.");
    console.log("Image data received:", image.substring(0, 40) + "...");

    const result = await analyzeTravelImage(image);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Vision API Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error?.error?.error?.message ||
        error?.message ||
        "Failed to analyze image.",
    });
  }
});

module.exports = router;