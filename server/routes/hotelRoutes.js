const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
];

router.get("/search", async (req, res) => {
  try {
    const destination = typeof req.query.destination === "string" ? req.query.destination.trim() : "";

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "Destination is required to search hotels.",
      });
    }

    console.log(`🏨 Searching real hotels for: "${destination}"...`);

    const prompt = `You are a real-world travel accommodations expert.
Find 6 real, actual, highly rated hotels, boutique stays, or heritage resorts in and around "${destination}".

Rules:
- Give REAL, existing hotels in ${destination}.
- Provide realistic price per night with local currency symbol (e.g. ₹3,500/night or $140/night).
- Provide real star ratings between 4.2 and 4.9.
- Provide real address or neighborhood in ${destination}.
- List 4 key amenities per hotel (e.g. WiFi, Pool, Spa, Breakfast, AC, Ocean View).
- Provide 2-sentence description highlighting what makes staying there memorable.

Return ONLY valid JSON matching this schema:
{
  "destination": "${destination}",
  "hotels": [
    {
      "name": "Real Hotel Name",
      "location": "Real address or neighborhood in ${destination}",
      "rating": 4.7,
      "reviewsCount": 850,
      "pricePerNight": "₹4,500/night",
      "type": "Heritage Boutique Hotel",
      "amenities": ["Free High-Speed WiFi", "Rooftop Swimming Pool", "Complimentary Breakfast", "Spa & Wellness"],
      "description": "Authentic description of the property and guest experience."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are a professional hotel search API. Return strict JSON only without Markdown backticks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const data = JSON.parse(raw);

    const hotels = (data.hotels || []).map((hotel, index) => {
      const q = encodeURIComponent(`${hotel.name} ${destination}`);
      return {
        id: `hotel-${index + 1}-${Date.now()}`,
        name: hotel.name,
        location: hotel.location,
        destination,
        rating: hotel.rating || 4.6,
        reviewsCount: hotel.reviewsCount || 420,
        pricePerNight: hotel.pricePerNight || "Check live rates",
        type: hotel.type || "Boutique Hotel",
        amenities: hotel.amenities || ["Free WiFi", "Breakfast", "AC", "Room Service"],
        description: hotel.description,
        image: HOTEL_IMAGES[index % HOTEL_IMAGES.length],
        bookingUrl: `https://www.google.com/travel/hotels?q=${q}`,
        bookingDotComUrl: `https://www.booking.com/searchresults.html?ss=${q}`,
      };
    });

    return res.json({
      success: true,
      destination,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error("Hotel search error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live hotel options. Please try again.",
    });
  }
});

module.exports = router;
