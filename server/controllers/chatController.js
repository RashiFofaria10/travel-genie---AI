const {
  generateTravelResponse,
} = require("../services/groqService");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await generateTravelResponse(message);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
  console.error(error);

  res.status(500).json({
    success: false,
    error: error.message,
    stack: error.stack,
  });

  }
};

module.exports = {
  chatWithAI,
};