const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AIRLINE_LOGOS = {
  "Air India": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  IndiGo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  Emirates: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  "Singapore Airlines": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  "British Airways": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  Lufthansa: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80",
  default: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=300&q=80",
};

const handleFlightSearch = async (req, res) => {
  try {
    const params = req.method === "GET" ? req.query : (req.body || {});
    const { from, to, departureDate, returnDate, adults = 1, travelClass = "ECONOMY" } = params;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination are required.",
      });
    }

    console.log(`✈️ Searching real flights from ${from} to ${to} on ${departureDate || "upcoming date"}...`);

    const prompt = `You are an airline flight routes and schedules intelligence API.
Generate 5 realistic, actual scheduled flight options from ${from} to ${to}.

Rules:
- Use real operating airlines on or near this corridor (e.g. IndiGo, Air India, Emirates, Singapore Airlines, Qatar Airways, Lufthansa, Delta, United, etc.).
- Realistic flight numbers (e.g. AI-102, 6E-204, EK-501, SQ-406, etc.).
- Realistic departure and arrival times and realistic duration.
- Realistic current market economy price per passenger (e.g. ₹4,800 - ₹24,000 for domestic/short-haul, ₹35,000 - ₹75,000 for international long-haul).
- State if it is Non-stop, 1 Stop, etc.

Return ONLY strict valid JSON matching this schema:
{
  "from": "${from}",
  "to": "${to}",
  "departureDate": "${departureDate || ""}",
  "flights": [
    {
      "airline": "Airline Name",
      "flightNumber": "AI-102",
      "departureTime": "06:15 AM",
      "arrivalTime": "08:30 AM",
      "duration": "2h 15m",
      "stops": "Non-stop",
      "price": 5400,
      "currency": "INR",
      "aircraft": "Airbus A320neo",
      "cabin": "${travelClass}"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are a professional airline flight search API. Return strict JSON only without markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const data = JSON.parse(raw);

    const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(
      from
    )}%20to%20${encodeURIComponent(to)}`;

    const flights = (data.flights || []).map((f, i) => ({
      id: `fl-${i + 1}-${Date.now()}`,
      airline: f.airline,
      flightNumber: f.flightNumber || `FL-${100 + i}`,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      duration: f.duration,
      stops: f.stops || "Non-stop",
      price: f.price,
      currency: f.currency || "INR",
      aircraft: f.aircraft || "Boeing 737 / Airbus A320",
      cabin: f.cabin || travelClass,
      bookingUrl: googleFlightsUrl,
    }));

    return res.json({
      success: true,
      from,
      to,
      departureDate,
      returnDate: returnDate || null,
      adults,
      count: flights.length,
      flights,
      bookingUrl: googleFlightsUrl,
    });
  } catch (error) {
    console.error("Flight search error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Flight search service is currently unavailable. Please try again.",
    });
  }
};

router.post("/search", handleFlightSearch);
router.get("/search", handleFlightSearch);

module.exports = router;
