const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
console.log("API Key:", process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateTravelResponse(userMessage) {
  const prompt = `
You are Travel Genie, an expert AI travel assistant.

The user asked:
${userMessage}

Respond using this format:

🌍 Destination Overview

📅 Suggested Itinerary

💰 Estimated Budget

🏨 Hotel Suggestions

🍽️ Food Recommendations

🎒 Packing List

💡 Travel Tips
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

module.exports = {
  generateTravelResponse,
};