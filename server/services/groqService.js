const Groq = require("groq-sdk");
require("dotenv").config();
console.log("Groq API Key:", process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateTravelResponse(userMessage) {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `You are Travel Genie AI.

You are an expert travel planner.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use code blocks.
Do NOT explain anything.

The JSON must follow exactly this structure:

{
  "destination": "",
  "country": "",
  "overview": "",
  "budget": {
    "flights": "",
    "hotel": "",
    "food": "",
    "transport": "",
    "total": ""
  },
  "itinerary": [
    {
      "day": "Day 1",
      "title": "",
      "description": ""
    }
  ],
  "hotels": [
    {
      "name": "",
      "price": "",
      "rating": ""
    }
  ],
  "foods": [
    ""
  ],
  "packing": [
    ""
  ],
  "tips": [
    ""
  ]
}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],

      temperature: 0.7,
      max_tokens: 1200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
}

module.exports = {
  generateTravelResponse,
};