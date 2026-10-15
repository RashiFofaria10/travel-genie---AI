const express = require("express");
const router = express.Router();

const {
  generateAssistantResponse,
} = require("../services/assistantService");

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages are required",
      });
    }

    const reply = await generateAssistantResponse(messages);

    res.json({
      success: true,
      reply,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Assistant failed",
    });

  }
});

module.exports = router;