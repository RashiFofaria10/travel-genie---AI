const express = require("express");

const router = express.Router();

const AMADEUS_BASE_URL =
  process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Amadeus credentials are missing. Configure AMADEUS_API_KEY and AMADEUS_API_SECRET."
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
        data?.errors?.[0]?.detail ||
        "Could not authenticate with Amadeus."
    );
  }

  cachedToken = data.access_token;
  tokenExpiresAt =
    Date.now() + Math.max(0, data.expires_in - 60) * 1000;

  return cachedToken;
}

async function amadeusGet(path, params, token) {
  const query = new URLSearchParams(params);

  const response = await fetch(
    `${AMADEUS_BASE_URL}${path}?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const detail =
      data?.errors?.[0]?.detail ||
      data?.error_description ||
      "Amadeus request failed.";

    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function findAirportCode(city, token) {
  const data = await amadeusGet(
    "/v1/reference-data/locations",
    {
      subType: "CITY,AIRPORT",
      keyword: city,
      "page[limit]": "10",
      sort: "analytics.travelers.score",
      view: "LIGHT",
    },
    token
  );

  const locations = data.data || [];

  if (!locations.length) {
    throw new Error(
      `No matching airport found for "${city}". Try a major city or airport code, such as AMD for Ahmedabad.`
    );
  }

  const cityMatch = locations.find(
    (location) =>
      location.subType === "CITY" &&
      location.address?.cityCode
  );

  const airportMatch = locations.find(
    (location) =>
      location.subType === "AIRPORT" &&
      location.iataCode
  );

  const selected = cityMatch || airportMatch;

  const code =
    selected?.address?.cityCode ||
    selected?.iataCode;

  if (!code) {
    throw new Error(
      `Could not identify an airport code for "${city}".`
    );
  }

  return code;
}

router.post("/search", async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = "ECONOMY",
    } = req.body || {};

    if (!from?.trim() || !to?.trim() || !departureDate) {
      return res.status(400).json({
        message: "Departure city, destination and departure date are required.",
      });
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({
        message: "Departure city and destination must be different.",
      });
    }

    const departure = new Date(`${departureDate}T00:00:00Z`);

    if (
      Number.isNaN(departure.getTime()) ||
      departure.toISOString().slice(0, 10) !== departureDate ||
      departureDate < new Date().toISOString().slice(0, 10)
    ) {
      return res.status(400).json({
        message: "Please provide a valid future departure date.",
      });
    }

    if (returnDate) {
      const returning = new Date(`${returnDate}T00:00:00Z`);

      if (
        Number.isNaN(returning.getTime()) ||
        returning.toISOString().slice(0, 10) !== returnDate ||
        returnDate < departureDate
      ) {
        return res.status(400).json({
          message: "Return date must be on or after the departure date.",
        });
      }
    }

    const passengerCount = Number(adults);

    if (
      !Number.isInteger(passengerCount) ||
      passengerCount < 1 ||
      passengerCount > 9
    ) {
      return res.status(400).json({
        message: "Passenger count must be between 1 and 9.",
      });
    }

    const allowedClasses = [
      "ECONOMY",
      "PREMIUM_ECONOMY",
      "BUSINESS",
      "FIRST",
    ];

    if (!allowedClasses.includes(travelClass)) {
      return res.status(400).json({
        message: "Invalid travel class.",
      });
    }

    const token = await getAccessToken();

    const [originCode, destinationCode] = await Promise.all([
      findAirportCode(from.trim(), token),
      findAirportCode(to.trim(), token),
    ]);

    if (originCode === destinationCode) {
      return res.status(400).json({
        message:
          "Both entries resolved to the same airport or city. Please choose different locations.",
      });
    }

    const params = {
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate,
      adults: String(passengerCount),
      travelClass,
      currencyCode: "INR",
      max: "50",
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    const result = await amadeusGet(
      "/v2/shopping/flight-offers",
      params,
      token
    );

    const carriers = result.dictionaries?.carriers || {};

    const flights = (result.data || []).map((offer) => {
      const itineraries = (offer.itineraries || []).map(
        (itinerary) => {
          const segments = itinerary.segments || [];
          const first = segments[0];
          const last = segments[segments.length - 1];

          return {
            duration: itinerary.duration || "",
            stops: Math.max(0, segments.length - 1),
            departure: first?.departure?.at || "",
            arrival: last?.arrival?.at || "",
            from: first?.departure?.iataCode || originCode,
            to: last?.arrival?.iataCode || destinationCode,
            airlineCodes: [
              ...new Set(
                segments
                  .map((segment) => segment.carrierCode)
                  .filter(Boolean)
              ),
            ],
            airlines: [
              ...new Set(
                segments
                  .map(
                    (segment) =>
                      carriers[segment.carrierCode] ||
                      segment.carrierCode
                  )
                  .filter(Boolean)
              ),
            ],
            segments: segments.map((segment) => ({
              airline:
                carriers[segment.carrierCode] ||
                segment.carrierCode,
              airlineCode: segment.carrierCode,
              flightNumber: segment.number,
              from: segment.departure?.iataCode || "",
              to: segment.arrival?.iataCode || "",
              departure: segment.departure?.at || "",
              arrival: segment.arrival?.at || "",
              duration: segment.duration || "",
            })),
          };
        }
      );

      return {
        id: offer.id,
        price: Number(offer.price?.grandTotal || offer.price?.total || 0),
        currency: offer.price?.currency || "INR",
        itineraries,
        bookableSeats: offer.numberOfBookableSeats ?? null,
        lastTicketingDate: offer.lastTicketingDate || null,
        validatingAirlineCodes:
          offer.validatingAirlineCodes || [],
      };
    });

    res.json({
      source: "Amadeus test environment",
      origin: { city: from.trim(), code: originCode },
      destination: { city: to.trim(), code: destinationCode },
      departureDate,
      returnDate: returnDate || null,
      count: flights.length,
      flights,
      notice:
        "Test-environment results may be limited or cached. Prices and availability must be verified before booking.",
    });
  } catch (error) {
    console.error("Flight search error:", error.message);

    const status =
      error.status === 429
        ? 429
        : error.status === 400
          ? 400
          : 500;

    res.status(status).json({
      message:
        error.status === 429
          ? "The flight API test quota may have been reached. Check your Amadeus usage or try again later."
          : error.message ||
            "Unable to search flights right now. Please try again.",
    });
  }
});

module.exports = router;